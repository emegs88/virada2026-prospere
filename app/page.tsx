'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useStore } from '@/store/useStore'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { TrendingUp, DollarSign, CreditCard, AlertCircle } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#DC2626', '#000000', '#6B7280', '#10B981']

export default function HomePage() {
  const { debts, fixedExpenses, consorcioParams, salesGoals } = useStore()

  const monthlyCommission =
    consorcioParams.activeSales *
    (consorcioParams.commissionPercentage / 100) /
    consorcioParams.commissionInstallments

  const totalMoneyDebts = debts
    .filter((d) => d.type === 'money' && d.status === 'active')
    .reduce((sum, d) => sum + d.value, 0)

  const totalCardEntries = debts
    .filter((d) => d.type === 'card' && d.status === 'active' && d.entryValue)
    .reduce((sum, d) => sum + (d.entryValue || 0), 0)

  const monthlyFixed = fixedExpenses
    .filter((e) => e.status === 'active')
    .reduce((sum, e) => sum + e.monthlyValue, 0)

  const freeCash = monthlyCommission - monthlyFixed

  // Gráfico de vendas ativas
  const salesData = salesGoals.length > 0
    ? salesGoals.map((goal) => ({
        month: new Date(goal.month + '-01').toLocaleDateString('pt-BR', { month: 'short' }),
        meta: goal.target,
        real: goal.actual,
      }))
    : Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2026, i, 1).toLocaleDateString('pt-BR', { month: 'short' }),
        meta: 0,
        real: 0,
      }))

  // Gráfico de comissão mensal
  const commissionData = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2026, i, 1).toLocaleDateString('pt-BR', { month: 'short' }),
    comissao: monthlyCommission,
  }))

  // Distribuição de dívidas
  const debtDistribution = [
    {
      name: 'Pequenas (<50k)',
      value: debts.filter((d) => d.value < 50000 && d.status === 'active').reduce((sum, d) => sum + d.value, 0),
    },
    {
      name: 'Médias (50k-150k)',
      value: debts.filter((d) => d.value >= 50000 && d.value < 150000 && d.status === 'active').reduce((sum, d) => sum + d.value, 0),
    },
    {
      name: 'Grandes (>150k)',
      value: debts.filter((d) => d.value >= 150000 && d.status === 'active').reduce((sum, d) => sum + d.value, 0),
    },
    {
      name: 'Estruturais (Cartas)',
      value: totalCardEntries,
    },
  ].filter((item) => item.value > 0)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu planejamento financeiro</p>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas Ativas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(consorcioParams.activeSales)}</div>
              <p className="text-xs text-muted-foreground">Comissão: {formatCurrency(monthlyCommission)}/mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Dívidas (Dinheiro)</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalMoneyDebts)}</div>
              <p className="text-xs text-muted-foreground">{debts.filter((d) => d.type === 'money' && d.status === 'active').length} credores</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entradas Necessárias</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCardEntries)}</div>
              <p className="text-xs text-muted-foreground">30% de entrada nas cartas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Caixa Livre Estimado</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${freeCash < 0 ? 'text-prospere-red' : 'text-green-600'}`}>
                {formatCurrency(freeCash)}
              </div>
              <p className="text-xs text-muted-foreground">Após fixos e comissão</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Vendas Ativas - Meta vs Real</CardTitle>
              <CardDescription>Evolução das vendas ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="meta" stroke="#DC2626" name="Meta" />
                  <Line type="monotone" dataKey="real" stroke="#000000" name="Real" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comissão Mensal Projetada</CardTitle>
              <CardDescription>Previsão para os próximos 12 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={commissionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="comissao" fill="#DC2626" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição das Dívidas</CardTitle>
            <CardDescription>Por categoria e tamanho</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={debtDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {debtDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
