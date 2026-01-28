'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useStore } from '@/store/useStore'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Calculator, TrendingUp, TrendingDown, AlertTriangle, Target, DollarSign } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface SimulatedExpense {
  id: string
  name: string
  type: 'contract' | 'marketing' | 'service' | 'other'
  monthlyValue: number
  installments: number
  startDate: string
  totalValue: number
}

export default function SimulatorPage() {
  const { consorcioParams, fixedExpenses, personalExpenses, debts } = useStore()
  const [simulatedExpenses, setSimulatedExpenses] = useState<SimulatedExpense[]>([])
  const [newExpense, setNewExpense] = useState<Partial<SimulatedExpense>>({
    name: '',
    type: 'contract',
    monthlyValue: 0,
    installments: 12,
    startDate: new Date().toISOString().split('T')[0],
  })

  const monthlyCommission =
    consorcioParams.activeSales *
    (consorcioParams.commissionPercentage / 100) /
    consorcioParams.commissionInstallments

  const currentFixedExpenses = fixedExpenses
    .filter((e) => e.status === 'active')
    .reduce((sum, e) => sum + e.monthlyValue, 0)

  const currentPersonalExpenses = personalExpenses
    .filter((e) => e.status === 'active')
    .reduce((sum, e) => sum + e.monthlyValue, 0)

  const currentTotalExpenses = currentFixedExpenses + currentPersonalExpenses
  const currentFreeCash = monthlyCommission - currentTotalExpenses

  const addSimulatedExpense = () => {
    if (!newExpense.name || !newExpense.monthlyValue) return

    const totalValue = (newExpense.monthlyValue || 0) * (newExpense.installments || 12)
    const expense: SimulatedExpense = {
      id: Date.now().toString(),
      name: newExpense.name || '',
      type: newExpense.type || 'contract',
      monthlyValue: newExpense.monthlyValue || 0,
      installments: newExpense.installments || 12,
      startDate: newExpense.startDate || new Date().toISOString().split('T')[0],
      totalValue,
    }

    setSimulatedExpenses([...simulatedExpenses, expense])
    setNewExpense({
      name: '',
      type: 'contract',
      monthlyValue: 0,
      installments: 12,
      startDate: new Date().toISOString().split('T')[0],
    })
  }

  const removeSimulatedExpense = (id: string) => {
    setSimulatedExpenses(simulatedExpenses.filter((e) => e.id !== id))
  }

  const simulatedMonthlyExpenses = simulatedExpenses.reduce((sum, e) => sum + e.monthlyValue, 0)
  const newTotalExpenses = currentTotalExpenses + simulatedMonthlyExpenses
  const newFreeCash = monthlyCommission - newTotalExpenses

  // Cálculo de quanto precisa vender a mais
  const neededSalesIncrease = newFreeCash < 0 
    ? Math.abs(newFreeCash) * consorcioParams.commissionInstallments / (consorcioParams.commissionPercentage / 100)
    : 0

  const neededActiveSales = neededSalesIncrease > 0
    ? consorcioParams.activeSales + neededSalesIncrease
    : consorcioParams.activeSales

  // Cálculo de caixa necessário
  const monthsToCover = 3 // recomendação: 3 meses de despesas
  const neededCash = newTotalExpenses * monthsToCover

  // Projeção 12 meses
  const projectionData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2026, i, 1)
    const monthName = month.toLocaleDateString('pt-BR', { month: 'short' })
    const expensesInMonth = simulatedExpenses.some((e) => {
      const start = new Date(e.startDate)
      const end = new Date(start)
      end.setMonth(end.getMonth() + e.installments)
      return month >= start && month < end
    })
      ? simulatedMonthlyExpenses
      : 0

    return {
      month: monthName,
      receita: monthlyCommission,
      despesasAtuais: currentTotalExpenses,
      despesasSimuladas: expensesInMonth,
      despesasTotais: currentTotalExpenses + expensesInMonth,
      saldo: monthlyCommission - currentTotalExpenses - expensesInMonth,
    }
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Simulador de Despesas</h1>
          <p className="text-muted-foreground">
            Simule novos contratos, marketing e despesas para ver o impacto futuro
          </p>
        </div>

        {/* Situação Atual */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Comissão Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(monthlyCommission)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Despesas Atuais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(currentTotalExpenses)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Caixa Livre Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${currentFreeCash >= 0 ? 'text-green-600' : 'text-prospere-red'}`}>
                {formatCurrency(currentFreeCash)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Vendas Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(consorcioParams.activeSales)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Adicionar Nova Despesa Simulada */}
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Despesa Simulada</CardTitle>
            <CardDescription>
              Simule um novo contrato, investimento em marketing ou outra despesa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expenseName">Nome da Despesa</Label>
                <Input
                  id="expenseName"
                  value={newExpense.name}
                  onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                  placeholder="Ex: Contrato Marketing, Serviço X..."
                />
              </div>
              <div>
                <Label htmlFor="expenseType">Tipo</Label>
                <Select
                  value={newExpense.type}
                  onValueChange={(value) => setNewExpense({ ...newExpense, type: value as any })}
                >
                  <SelectTrigger id="expenseType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract">Contrato</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="service">Serviço</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="monthlyValue">Valor Mensal (R$)</Label>
                <Input
                  id="monthlyValue"
                  type="number"
                  value={newExpense.monthlyValue}
                  onChange={(e) => setNewExpense({ ...newExpense, monthlyValue: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="installments">Parcelas (meses)</Label>
                <Input
                  id="installments"
                  type="number"
                  value={newExpense.installments}
                  onChange={(e) => setNewExpense({ ...newExpense, installments: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="startDate">Data Início</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newExpense.startDate}
                  onChange={(e) => setNewExpense({ ...newExpense, startDate: e.target.value })}
                />
              </div>
            </div>

            {newExpense.monthlyValue && newExpense.installments && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Valor Total:</p>
                <p className="text-lg font-bold">
                  {formatCurrency((newExpense.monthlyValue || 0) * (newExpense.installments || 12))}
                </p>
              </div>
            )}

            <Button onClick={addSimulatedExpense} disabled={!newExpense.name || !newExpense.monthlyValue}>
              <Calculator className="mr-2 h-4 w-4" />
              Adicionar à Simulação
            </Button>
          </CardContent>
        </Card>

        {/* Impacto com Simulação */}
        {simulatedExpenses.length > 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <Card className={newFreeCash < 0 ? 'border-prospere-red' : 'border-green-500'}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {newFreeCash < 0 ? <AlertTriangle className="h-4 w-4 text-prospere-red" /> : <TrendingUp className="h-4 w-4 text-green-500" />}
                    Novo Caixa Livre
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${newFreeCash >= 0 ? 'text-green-600' : 'text-prospere-red'}`}>
                    {formatCurrency(newFreeCash)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {newFreeCash < 0 ? 'Déficit mensal' : 'Ainda positivo'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Despesas Adicionais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(simulatedMonthlyExpenses)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {simulatedExpenses.length} despesa(s) simulada(s)
                  </p>
                </CardContent>
              </Card>

              {neededSalesIncrease > 0 && (
                <>
                  <Card className="border-yellow-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Target className="h-4 w-4 text-yellow-500" />
                        Vendas Necessárias
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">
                        +{formatCurrency(neededSalesIncrease)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Para cobrir o déficit
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Vendas Ativas Totais</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(neededActiveSales)}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Meta necessária
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Caixa Recomendado</CardTitle>
                <CardDescription>
                  Reserva de emergência para cobrir {monthsToCover} meses de despesas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Caixa Necessário</p>
                    <p className="text-3xl font-bold">{formatCurrency(neededCash)}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {newTotalExpenses.toLocaleString('pt-BR')} × {monthsToCover} meses
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Diferença</p>
                    <p className={`text-2xl font-bold ${neededCash - currentFreeCash * monthsToCover > 0 ? 'text-prospere-red' : 'text-green-600'}`}>
                      {formatCurrency(neededCash - (currentFreeCash * monthsToCover))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Projeção */}
            <Card>
              <CardHeader>
                <CardTitle>Projeção 12 Meses</CardTitle>
                <CardDescription>
                  Impacto das despesas simuladas ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line type="monotone" dataKey="receita" stroke="#10B981" name="Receita" strokeWidth={2} />
                    <Line type="monotone" dataKey="despesasAtuais" stroke="#6B7280" name="Despesas Atuais" strokeWidth={2} />
                    <Line type="monotone" dataKey="despesasSimuladas" stroke="#F59E0B" name="Despesas Simuladas" strokeWidth={2} />
                    <Line type="monotone" dataKey="despesasTotais" stroke="#DC2626" name="Despesas Totais" strokeWidth={2} />
                    <Line type="monotone" dataKey="saldo" stroke="#000000" name="Saldo" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Lista de Despesas Simuladas */}
            <Card>
              <CardHeader>
                <CardTitle>Despesas Simuladas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {simulatedExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{expense.name}</h3>
                          <span className="px-2 py-1 rounded text-xs bg-muted">{expense.type}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatCurrency(expense.monthlyValue)}/mês × {expense.installments} meses = {formatCurrency(expense.totalValue)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Início: {new Date(expense.startDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSimulatedExpense(expense.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {simulatedExpenses.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma despesa simulada ainda.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Adicione despesas acima para ver o impacto futuro.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
