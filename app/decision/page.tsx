'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useStore } from '@/store/useStore'
import { formatCurrency } from '@/lib/utils'
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Loader2, 
  Sparkles,
  Trash2,
  Save
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

export default function DecisionPage() {
  const { decisions, addDecision, updateDecision, removeDecision, debts, fixedExpenses, consorcioParams } = useStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [aiAdvice, setAiAdvice] = useState<string>('')
  const [currentDecision, setCurrentDecision] = useState<Partial<any>>({
    title: '',
    orientation: { peace: false, sign: '', notes: '' },
    advice: { who: '', date: '', cost: 0, conclusion: '' },
    math: { roi: 0, risk: '', worstCase: '', viability: '' },
    result: undefined,
  })

  const handleGetAIAdvice = async (decision: any) => {
    setIsLoading(true)
    setAiAdvice('')

    try {
      const context = {
        vendasAtivas: consorcioParams.activeSales,
        comissaoMensal: consorcioParams.activeSales * (consorcioParams.commissionPercentage / 100) / consorcioParams.commissionInstallments,
        totalDividas: debts.filter(d => d.status === 'active').reduce((sum, d) => sum + d.value, 0),
        despesasFixas: fixedExpenses.filter(e => e.status === 'active').reduce((sum, e) => sum + e.monthlyValue, 0),
      }

      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decisionData: decision,
          context,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao obter conselho da IA')
      }

      const data = await response.json()
      setAiAdvice(data.advice)
    } catch (error) {
      console.error('Error getting AI advice:', error)
      setAiAdvice('Erro ao obter conselho. Verifique se a chave OPENAI_API_KEY está configurada no .env.local')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = () => {
    const newDecision = {
      ...currentDecision,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    addDecision(newDecision as any)
    setIsDialogOpen(false)
    setCurrentDecision({
      title: '',
      orientation: { peace: false, sign: '', notes: '' },
      advice: { who: '', date: '', cost: 0, conclusion: '' },
      math: { roi: 0, risk: '', worstCase: '', viability: '' },
      result: undefined,
    })
    setAiAdvice('')
  }

  const getResultColor = (result?: string) => {
    switch (result) {
      case 'green':
        return 'bg-green-500 text-white'
      case 'yellow':
        return 'bg-yellow-500 text-white'
      case 'red':
        return 'bg-prospere-red text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getResultIcon = (result?: string) => {
    switch (result) {
      case 'green':
        return <CheckCircle2 className="h-5 w-5" />
      case 'yellow':
        return <AlertCircle className="h-5 w-5" />
      case 'red':
        return <XCircle className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Destino x Decisão</h1>
            <p className="text-muted-foreground">Análise completa para tomadas de decisão estratégicas</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Nova Decisão</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Decisão</DialogTitle>
                <DialogDescription>
                  Preencha os campos para uma análise completa da decisão
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div>
                  <Label htmlFor="title">Título da Decisão</Label>
                  <Input
                    id="title"
                    value={currentDecision.title}
                    onChange={(e) => setCurrentDecision({ ...currentDecision, title: e.target.value })}
                    placeholder="Ex: Investir em novo negócio X"
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Orientação Divina</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="peace"
                        checked={currentDecision.orientation?.peace}
                        onChange={(e) =>
                          setCurrentDecision({
                            ...currentDecision,
                            orientation: { ...currentDecision.orientation, peace: e.target.checked },
                          })
                        }
                        className="h-4 w-4"
                      />
                      <Label htmlFor="peace">Há paz/sinal positivo?</Label>
                    </div>
                    <div>
                      <Label htmlFor="sign">Sinal específico</Label>
                      <Input
                        id="sign"
                        value={currentDecision.orientation?.sign || ''}
                        onChange={(e) =>
                          setCurrentDecision({
                            ...currentDecision,
                            orientation: { ...currentDecision.orientation, sign: e.target.value },
                          })
                        }
                        placeholder="Descreva o sinal recebido"
                      />
                    </div>
                    <div>
                      <Label htmlFor="orientationNotes">Notas</Label>
                      <Textarea
                        id="orientationNotes"
                        value={currentDecision.orientation?.notes || ''}
                        onChange={(e) =>
                          setCurrentDecision({
                            ...currentDecision,
                            orientation: { ...currentDecision.orientation, notes: e.target.value },
                          })
                        }
                        placeholder="Observações sobre orientação"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Conselho</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="adviceWho">Quem ouviu?</Label>
                      <Input
                        id="adviceWho"
                        value={currentDecision.advice?.who || ''}
                        onChange={(e) =>
                          setCurrentDecision({
                            ...currentDecision,
                            advice: { ...currentDecision.advice, who: e.target.value },
                          })
                        }
                        placeholder="Nome do conselheiro"
                      />
                    </div>
                    <div>
                      <Label htmlFor="adviceDate">Data</Label>
                      <Input
                        id="adviceDate"
                        type="date"
                        value={currentDecision.advice?.date || ''}
                        onChange={(e) =>
                          setCurrentDecision({
                            ...currentDecision,
                            advice: { ...currentDecision.advice, date: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="adviceCost">Custo do conselho (R$)</Label>
                      <Input
                        id="adviceCost"
                        type="number"
                        value={currentDecision.advice?.cost || 0}
                        onChange={(e) =>
                          setCurrentDecision({
                            ...currentDecision,
                            advice: { ...currentDecision.advice, cost: Number(e.target.value) },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="adviceConclusion">Conclusão</Label>
                      <Textarea
                        id="adviceConclusion"
                        value={currentDecision.advice?.conclusion || ''}
                        onChange={(e) =>
                          setCurrentDecision({
                            ...currentDecision,
                            advice: { ...currentDecision.advice, conclusion: e.target.value },
                          })
                        }
                        placeholder="Resumo do conselho recebido"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Matemática</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="roi">ROI (%)</Label>
                      <Input
                        id="roi"
                        type="number"
                        value={currentDecision.math?.roi || 0}
                        onChange={(e) =>
                          setCurrentDecision({
                            ...currentDecision,
                            math: { ...currentDecision.math, roi: Number(e.target.value) },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="risk">Risco</Label>
                      <Input
                        id="risk"
                        value={currentDecision.math?.risk || ''}
                        onChange={(e) =>
                          setCurrentDecision({
                            ...currentDecision,
                            math: { ...currentDecision.math, risk: e.target.value },
                          })
                        }
                        placeholder="Avaliação do risco"
                      />
                    </div>
                    <div>
                      <Label htmlFor="worstCase">Pior Cenário</Label>
                      <Textarea
                        id="worstCase"
                        value={currentDecision.math?.worstCase || ''}
                        onChange={(e) =>
                          setCurrentDecision({
                            ...currentDecision,
                            math: { ...currentDecision.math, worstCase: e.target.value },
                          })
                        }
                        placeholder="Descreva o pior cenário possível"
                      />
                    </div>
                    <div>
                      <Label htmlFor="viability">Viabilidade</Label>
                      <Textarea
                        id="viability"
                        value={currentDecision.math?.viability || ''}
                        onChange={(e) =>
                          setCurrentDecision({
                            ...currentDecision,
                            math: { ...currentDecision.math, viability: e.target.value },
                          })
                        }
                        placeholder="Análise de viabilidade"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <Label htmlFor="result">Resultado</Label>
                  <Select
                    value={currentDecision.result || ''}
                    onValueChange={(value) =>
                      setCurrentDecision({ ...currentDecision, result: value as any })
                    }
                  >
                    <SelectTrigger id="result">
                      <SelectValue placeholder="Selecione o resultado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="green">Verde - Prosseguir</SelectItem>
                      <SelectItem value="yellow">Amarelo - Esperar</SelectItem>
                      <SelectItem value="red">Vermelho - Não entrar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {aiAdvice && (
                  <Card className="border-prospere-red">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-prospere-red" />
                        Conselho da IA
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap text-sm">{aiAdvice}</div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => handleGetAIAdvice(currentDecision)}
                  disabled={isLoading || !currentDecision.title}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Obter Conselho da IA
                    </>
                  )}
                </Button>
                <Button onClick={handleSave} disabled={!currentDecision.title}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Decisão
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {decisions.map((decision) => (
            <Card key={decision.id} className="relative">
              <div className={`absolute top-0 right-0 p-2 rounded-bl-lg ${getResultColor(decision.result)}`}>
                {getResultIcon(decision.result)}
              </div>
              <CardHeader>
                <CardTitle className="pr-12">{decision.title}</CardTitle>
                <CardDescription>
                  {new Date(decision.createdAt).toLocaleDateString('pt-BR')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Orientação:</p>
                  <p className="text-sm text-muted-foreground">
                    {decision.orientation?.peace ? '✅ Há paz' : '❌ Sem paz'}
                  </p>
                </div>
                {decision.advice?.who && (
                  <div>
                    <p className="text-sm font-medium">Conselho de:</p>
                    <p className="text-sm text-muted-foreground">{decision.advice.who}</p>
                  </div>
                )}
                {decision.math?.roi && (
                  <div>
                    <p className="text-sm font-medium">ROI:</p>
                    <p className="text-sm text-muted-foreground">{decision.math.roi}%</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGetAIAdvice(decision)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-1" />
                        IA
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeDecision(decision.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {decisions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhuma decisão cadastrada ainda.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Clique em "Nova Decisão" para começar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
