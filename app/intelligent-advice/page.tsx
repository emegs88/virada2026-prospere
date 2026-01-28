'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useStore } from '@/store/useStore'
import { formatCurrency } from '@/lib/utils'
import { Sparkles, Loader2, TrendingUp, Target, BarChart3, PieChart as PieChartIcon } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#DC2626', '#000000', '#6B7280', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6']

export default function IntelligentAdvicePage() {
  const {
    personalExpenses,
    debts,
    fixedExpenses,
    consorcioParams,
    intelligentAdvices,
    addIntelligentAdvice,
  } = useStore()

  const [isLoading, setIsLoading] = useState(false)
  const [currentAdvice, setCurrentAdvice] = useState<string>('')
  const [selectedInfluencer, setSelectedInfluencer] = useState<'tiago-brunet' | 'thiago-nigro' | 'flavio-augusto' | 'ai-combined'>('ai-combined')
  const [adviceMetrics, setAdviceMetrics] = useState<any>(null)

  // Calcular dados financeiros
  const monthlyCommission =
    consorcioParams.activeSales *
    (consorcioParams.commissionPercentage / 100) /
    consorcioParams.commissionInstallments

  const salary = personalExpenses.find((e) => e.category === 'salary' && e.status === 'active')?.monthlyValue || 0
  const totalPersonalExpenses = personalExpenses
    .filter((e) => e.status === 'active')
    .reduce((sum, e) => sum + e.monthlyValue, 0)

  const totalFixedExpenses = fixedExpenses
    .filter((e) => e.status === 'active')
    .reduce((sum, e) => sum + e.monthlyValue, 0)

  const totalDebts = debts
    .filter((d) => d.status === 'active')
    .reduce((sum, d) => sum + (d.type === 'money' ? d.value : d.entryValue || 0), 0)

  const totalExpenses = totalPersonalExpenses + totalFixedExpenses
  const monthlyRevenue = salary + monthlyCommission
  const monthlyBalance = monthlyRevenue - totalExpenses
  const savingsRate = monthlyRevenue > 0 ? (monthlyBalance / monthlyRevenue) * 100 : 0

  const handleGenerateAdvice = async () => {
    setIsLoading(true)
    setCurrentAdvice('')

    const financialData = {
      monthlyRevenue,
      salary,
      monthlyCommission,
      totalExpenses,
      totalPersonalExpenses,
      totalFixedExpenses,
      totalDebts,
      monthlyBalance,
      savingsRate,
      activeSales: consorcioParams.activeSales,
      personalExpensesByCategory: personalExpenses
        .filter((e) => e.status === 'active')
        .reduce((acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + e.monthlyValue
          return acc
        }, {} as Record<string, number>),
    }

    try {
      const response = await fetch('/api/intelligent-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          financialData,
          influencer: selectedInfluencer,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao obter conselho')
      }

      const data = await response.json()
      setCurrentAdvice(data.advice)

      // Salvar conselho
      addIntelligentAdvice({
        id: Date.now().toString(),
        title: `Conselho ${selectedInfluencer === 'ai-combined' ? 'Combinado' : selectedInfluencer}`,
        influencer: selectedInfluencer,
        category: 'financial',
        advice: data.advice,
        metrics: {
          currentValue: monthlyBalance,
          targetValue: monthlyBalance * 1.5,
          percentage: savingsRate,
          timeframe: '12 meses',
        },
        createdAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error getting advice:', error)
      setCurrentAdvice('Erro ao obter conselho. Verifique se a chave OPENAI_API_KEY está configurada.')
    } finally {
      setIsLoading(false)
    }
  }

  // Dados para gráficos
  const expensesByCategory = personalExpenses
    .filter((e) => e.status === 'active' && e.monthlyValue > 0)
    .reduce((acc, e) => {
      const cat = e.category
      acc[cat] = (acc[cat] || 0) + e.monthlyValue
      return acc
    }, {} as Record<string, number>)

  const categoryChartData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }))

  const revenueExpenseData = [
    { name: 'Receita', receita: monthlyRevenue, despesas: totalExpenses },
  ]

  const topExpenses = personalExpenses
    .filter((e) => e.status === 'active' && e.monthlyValue > 0)
    .sort((a, b) => b.monthlyValue - a.monthlyValue)
    .slice(0, 5)
    .map((e) => ({
      name: e.name,
      value: e.monthlyValue,
    }))

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Conselhos Inteligentes</h1>
            <p className="text-muted-foreground">
              Análise financeira com IA inspirada em Tiago Brunet, Thiago Nigro e Flávio Augusto
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Salário: {formatCurrency(salary)} + Comissão: {formatCurrency(monthlyCommission)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pessoais: {formatCurrency(totalPersonalExpenses)} + Fixas: {formatCurrency(totalFixedExpenses)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Saldo Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${monthlyBalance >= 0 ? 'text-green-600' : 'text-prospere-red'}`}>
                {formatCurrency(monthlyBalance)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Poupança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${savingsRate >= 20 ? 'text-green-600' : savingsRate >= 10 ? 'text-yellow-600' : 'text-prospere-red'}`}>
                {savingsRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Receita vs Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="receita" fill="#10B981" name="Receita" />
                  <Bar dataKey="despesas" fill="#DC2626" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Despesas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topExpenses} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="value" fill="#DC2626" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gerador de Conselhos */}
        <Card>
          <CardHeader>
            <CardTitle>Gerar Conselho Inteligente</CardTitle>
            <CardDescription>
              Escolha o estilo de conselho e obtenha uma análise completa com números e gráficos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Estilo do Conselheiro</label>
              <Select value={selectedInfluencer} onValueChange={(value: any) => setSelectedInfluencer(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tiago-brunet">Tiago Brunet - Educação Financeira</SelectItem>
                  <SelectItem value="thiago-nigro">Thiago Nigro - O Primo Rico</SelectItem>
                  <SelectItem value="flavio-augusto">Flávio Augusto - Geração de Valor</SelectItem>
                  <SelectItem value="ai-combined">Combinado (Todos os Estilos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleGenerateAdvice} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando conselho...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar Conselho Inteligente
                </>
              )}
            </Button>

            {currentAdvice && (
              <Card className="border-prospere-red mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-prospere-red" />
                    Conselho Gerado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{currentAdvice}</div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Histórico de Conselhos */}
        {intelligentAdvices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Conselhos Anteriores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {intelligentAdvices.slice(-5).reverse().map((advice) => (
                  <div key={advice.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{advice.title}</h3>
                      <span className="text-xs text-muted-foreground">
                        {new Date(advice.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{advice.advice}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
