'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStore } from '@/store/useStore'
import { formatCurrency } from '@/lib/utils'
import { Calendar, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function PaymentPlanPage() {
  const { paymentPlans, generatePaymentPlan, debts, fixedExpenses, consorcioParams } = useStore()
  const [fundPercentage, setFundPercentage] = useState(30)

  const months = [
    '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06',
    '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12',
  ]

  const handleGeneratePlan = () => {
    generatePaymentPlan(fundPercentage)
  }

  const monthlyCommission =
    consorcioParams.activeSales *
    (consorcioParams.commissionPercentage / 100) /
    consorcioParams.commissionInstallments

  const monthlyFixed = fixedExpenses
    .filter((e) => e.status === 'active')
    .reduce((sum, e) => sum + e.monthlyValue, 0)

  const chartData = months.map((month) => {
    const plan = paymentPlans.find((p) => p.month === month)
    return {
      month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short' }),
      receita: plan?.revenue || monthlyCommission,
      fixos: plan?.fixedExpenses || monthlyFixed,
      pagamentos: plan?.payments.reduce((sum, p) => sum + p.amount, 0) || 0,
      saldo: plan?.balance || 0,
    }
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Plano de Pagamento 2026</h1>
            <p className="text-muted-foreground">Calendário financeiro mês a mês</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="fundPercentage">% Fundo Cartas:</Label>
              <Input
                id="fundPercentage"
                type="number"
                value={fundPercentage}
                onChange={(e) => setFundPercentage(Number(e.target.value))}
                className="w-20"
                min="0"
                max="100"
              />
            </div>
            <Button onClick={handleGeneratePlan}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Gerar Plano Automático
            </Button>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(monthlyCommission)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Despesas Fixas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(monthlyFixed)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Caixa Disponível</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(monthlyCommission - monthlyFixed)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Fundo Cartas ({fundPercentage}%)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency((monthlyCommission - monthlyFixed) * (fundPercentage / 100))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico */}
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de Caixa 2026</CardTitle>
            <CardDescription>Receitas, despesas e saldo mensal</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="receita" fill="#10B981" name="Receita" />
                <Bar dataKey="fixos" fill="#6B7280" name="Fixos" />
                <Bar dataKey="pagamentos" fill="#DC2626" name="Pagamentos" />
                <Bar dataKey="saldo" fill="#000000" name="Saldo" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Calendário Mensal */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {months.map((month) => {
            const plan = paymentPlans.find((p) => p.month === month)
            const revenue = plan?.revenue || monthlyCommission
            const fixed = plan?.fixedExpenses || monthlyFixed
            const payments = plan?.payments || []
            const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0)
            const balance = revenue - fixed - totalPayments
            const alerts = plan?.alerts || []

            return (
              <Card key={month} className={balance < 0 ? 'border-prospere-red' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </CardTitle>
                    {balance >= 0 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-prospere-red" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Receita</p>
                    <p className="font-semibold">{formatCurrency(revenue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Despesas Fixas</p>
                    <p className="font-semibold text-gray-600">{formatCurrency(fixed)}</p>
                  </div>
                  {payments.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Pagamentos Planejados</p>
                      <div className="space-y-1">
                        {payments.map((payment, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{payment.debtName}</span>
                            <span className="font-medium">{formatCurrency(payment.amount)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t flex justify-between">
                        <span className="font-medium">Total Pagamentos:</span>
                        <span className="font-bold">{formatCurrency(totalPayments)}</span>
                      </div>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Saldo:</span>
                      <span
                        className={`text-lg font-bold ${
                          balance >= 0 ? 'text-green-600' : 'text-prospere-red'
                        }`}
                      >
                        {formatCurrency(balance)}
                      </span>
                    </div>
                  </div>
                  {alerts.length > 0 && (
                    <div className="pt-2 space-y-1">
                      {alerts.map((alert, idx) => (
                        <div key={idx} className="text-xs bg-yellow-100 text-yellow-800 p-2 rounded">
                          ⚠️ {alert}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {paymentPlans.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum plano gerado ainda.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Clique em &quot;Gerar Plano Automático&quot; para criar o calendário financeiro.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
