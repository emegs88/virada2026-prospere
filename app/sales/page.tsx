'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStore } from '@/store/useStore'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { TrendingUp, Target, Save } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function SalesPage() {
  const { salesGoals, addSalesGoal, consorcioParams, updateConsorcioParams } = useStore()
  const [targetSales, setTargetSales] = useState(0)
  const [selectedMonth, setSelectedMonth] = useState('')

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2026, i, 1)
    return {
      value: `2026-${String(i + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    }
  })

  const handleSaveGoal = () => {
    if (selectedMonth && targetSales > 0) {
      addSalesGoal({
        month: selectedMonth,
        target: targetSales,
        actual: salesGoals.find((g) => g.month === selectedMonth)?.actual || 0,
      })
      setTargetSales(0)
    }
  }

  const handleUpdateActual = (month: string, actual: number) => {
    addSalesGoal({
      month,
      target: salesGoals.find((g) => g.month === month)?.target || 0,
      actual,
    })
  }

  const monthlyCommission =
    consorcioParams.activeSales *
    (consorcioParams.commissionPercentage / 100) /
    consorcioParams.commissionInstallments

  // Calcular vendas ativas baseado nos últimos 20 meses
  const calculateActiveSales = () => {
    const last20Months = salesGoals
      .filter((g) => {
        const goalDate = new Date(g.month + '-01')
        const now = new Date()
        const monthsDiff = (now.getFullYear() - goalDate.getFullYear()) * 12 + (now.getMonth() - goalDate.getMonth())
        return monthsDiff >= 0 && monthsDiff < 20
      })
      .reduce((sum, g) => sum + g.actual, 0)

    return last20Months || consorcioParams.activeSales
  }

  const activeSales = calculateActiveSales()
  const contractsNeeded = consorcioParams.averageTicket
    ? Math.ceil(targetSales / (consorcioParams.averageTicket || 1))
    : 0

  const chartData = months.map((month) => {
    const goal = salesGoals.find((g) => g.month === month.value)
    return {
      month: new Date(month.value + '-01').toLocaleDateString('pt-BR', { month: 'short' }),
      meta: goal?.target || 0,
      real: goal?.actual || 0,
    }
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Metas de Vendas</h1>
          <p className="text-muted-foreground">Gerencie suas metas e vendas reais de consórcio</p>
        </div>

        {/* Parâmetros */}
        <Card>
          <CardHeader>
            <CardTitle>Parâmetros do Consórcio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="activeSales">Vendas Ativas Atuais (R$)</Label>
                <Input
                  id="activeSales"
                  type="number"
                  value={consorcioParams.activeSales}
                  onChange={(e) =>
                    updateConsorcioParams({ activeSales: Number(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Comissão mensal: {formatCurrency(monthlyCommission)}
                </p>
              </div>
              <div>
                <Label htmlFor="averageTicket">Ticket Médio (R$)</Label>
                <Input
                  id="averageTicket"
                  type="number"
                  value={consorcioParams.averageTicket || 0}
                  onChange={(e) =>
                    updateConsorcioParams({ averageTicket: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Comissão Total: {consorcioParams.commissionPercentage}%</Label>
              </div>
              <div>
                <Label>Parcelas: {consorcioParams.commissionInstallments}</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas Ativas Calculadas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(activeSales)}</div>
              <p className="text-xs text-muted-foreground">Baseado nos últimos 20 meses</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissão Mensal</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  activeSales *
                    (consorcioParams.commissionPercentage / 100) /
                    consorcioParams.commissionInstallments
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contratos Necessários</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contractsNeeded}</div>
              <p className="text-xs text-muted-foreground">Para meta de {formatCurrency(targetSales)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Adicionar Meta */}
        <Card>
          <CardHeader>
            <CardTitle>Adicionar/Editar Meta Mensal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="month">Mês</Label>
                <select
                  id="month"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="">Selecione o mês</option>
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="target">Meta (R$)</Label>
                <Input
                  id="target"
                  type="number"
                  value={targetSales}
                  onChange={(e) => setTargetSales(Number(e.target.value))}
                  placeholder="Valor da meta"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSaveGoal} disabled={!selectedMonth || targetSales <= 0}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Meta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico */}
        <Card>
          <CardHeader>
            <CardTitle>Meta vs Real</CardTitle>
            <CardDescription>Evolução das vendas ao longo de 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="meta" stroke="#DC2626" name="Meta" strokeWidth={2} />
                <Line type="monotone" dataKey="real" stroke="#000000" name="Real" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tabela de Metas */}
        <Card>
          <CardHeader>
            <CardTitle>Metas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Mês</th>
                    <th className="text-right p-2">Meta</th>
                    <th className="text-right p-2">Real</th>
                    <th className="text-right p-2">Diferença</th>
                    <th className="text-right p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {months.map((month) => {
                    const goal = salesGoals.find((g) => g.month === month.value)
                    const target = goal?.target || 0
                    const actual = goal?.actual || 0
                    const diff = actual - target
                    return (
                      <tr key={month.value} className="border-b">
                        <td className="p-2 font-medium">{month.label}</td>
                        <td className="p-2 text-right">{formatCurrency(target)}</td>
                        <td className="p-2 text-right">
                          <Input
                            type="number"
                            value={actual}
                            onChange={(e) => handleUpdateActual(month.value, Number(e.target.value))}
                            className="w-32 ml-auto"
                            placeholder="0"
                          />
                        </td>
                        <td className={`p-2 text-right font-bold ${diff >= 0 ? 'text-green-600' : 'text-prospere-red'}`}>
                          {formatCurrency(diff)}
                        </td>
                        <td className="p-2 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedMonth(month.value)
                              setTargetSales(target)
                            }}
                          >
                            Editar
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
