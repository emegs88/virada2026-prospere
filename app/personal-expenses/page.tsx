'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useStore } from '@/store/useStore'
import { formatCurrency } from '@/lib/utils'
import { Plus, Edit, Trash2, Save, X, Home, Heart, GraduationCap, Activity, DollarSign, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import type { PersonalExpense } from '@/types'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const categoryIcons = {
  salary: DollarSign,
  housing: Home,
  family: Users,
  health: Heart,
  education: GraduationCap,
  lifestyle: Activity,
  other: DollarSign,
}

const categoryLabels = {
  salary: 'Salário',
  housing: 'Moradia',
  family: 'Família',
  health: 'Saúde',
  education: 'Educação',
  lifestyle: 'Estilo de Vida',
  other: 'Outros',
}

const COLORS = ['#DC2626', '#000000', '#6B7280', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6']

export default function PersonalExpensesPage() {
  const { personalExpenses, addPersonalExpense, updatePersonalExpense, removePersonalExpense } = useStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<PersonalExpense | null>(null)
  const [formData, setFormData] = useState<Partial<PersonalExpense>>({
    category: 'other',
    name: '',
    monthlyValue: 0,
    status: 'active',
  })

  const handleOpenDialog = (expense?: PersonalExpense) => {
    if (expense) {
      setEditingExpense(expense)
      setFormData(expense)
    } else {
      setEditingExpense(null)
      setFormData({
        category: 'other',
        name: '',
        monthlyValue: 0,
        status: 'active',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingExpense) {
      updatePersonalExpense(editingExpense.id, formData)
    } else {
      addPersonalExpense({
        ...formData,
        id: Date.now().toString(),
      } as PersonalExpense)
    }
    setIsDialogOpen(false)
    setEditingExpense(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta despesa pessoal?')) {
      removePersonalExpense(id)
    }
  }

  const activeExpenses = personalExpenses.filter((e) => e.status === 'active')
  const totalMonthly = activeExpenses.reduce((sum, e) => sum + e.monthlyValue, 0)

  const salary = activeExpenses.find((e) => e.category === 'salary')?.monthlyValue || 0
  const savingsRate = salary > 0 ? ((salary - totalMonthly) / salary) * 100 : 0

  // Dados para gráfico
  const chartData = activeExpenses
    .filter((e) => e.monthlyValue > 0)
    .map((expense) => ({
      name: expense.name,
      value: expense.monthlyValue,
      category: categoryLabels[expense.category] || 'Outros',
    }))

  const categoryTotals = activeExpenses.reduce((acc, expense) => {
    const cat = categoryLabels[expense.category] || 'Outros'
    acc[cat] = (acc[cat] || 0) + expense.monthlyValue
    return acc
  }, {} as Record<string, number>)

  const categoryChartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }))

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Despesas Pessoais</h1>
            <p className="text-muted-foreground">Gerencie suas despesas pessoais e familiares</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Despesa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingExpense ? 'Editar Despesa' : 'Nova Despesa Pessoal'}</DialogTitle>
                <DialogDescription>
                  Adicione ou edite uma despesa pessoal mensal
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as any })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salary">Salário</SelectItem>
                      <SelectItem value="housing">Moradia</SelectItem>
                      <SelectItem value="family">Família</SelectItem>
                      <SelectItem value="health">Saúde</SelectItem>
                      <SelectItem value="education">Educação</SelectItem>
                      <SelectItem value="lifestyle">Estilo de Vida</SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Salário, Casa, Kevialne, Escola..."
                  />
                </div>

                <div>
                  <Label htmlFor="monthlyValue">Valor Mensal (R$)</Label>
                  <Input
                    id="monthlyValue"
                    type="number"
                    value={formData.monthlyValue}
                    onChange={(e) => setFormData({ ...formData, monthlyValue: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalhes sobre esta despesa"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={!formData.name || !formData.monthlyValue}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Salário Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(salary)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalMonthly)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Saldo Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${salary - totalMonthly >= 0 ? 'text-green-600' : 'text-prospere-red'}`}>
                {formatCurrency(salary - totalMonthly)}
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
              <CardTitle>Distribuição por Categoria</CardTitle>
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

          <Card>
            <CardHeader>
              <CardTitle>Top Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeExpenses
                  .filter((e) => e.monthlyValue > 0)
                  .sort((a, b) => b.monthlyValue - a.monthlyValue)
                  .slice(0, 5)
                  .map((expense) => {
                    const Icon = categoryIcons[expense.category]
                    const percentage = (expense.monthlyValue / totalMonthly) * 100
                    return (
                      <div key={expense.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{expense.name}</span>
                          </div>
                          <span className="font-bold">{formatCurrency(expense.monthlyValue)}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-prospere-red h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Despesas Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {personalExpenses.map((expense) => {
                const Icon = categoryIcons[expense.category]
                return (
                  <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4 flex-1">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{expense.name}</h3>
                          <span className="px-2 py-1 rounded text-xs bg-muted">
                            {categoryLabels[expense.category]}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              expense.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                            }`}
                          >
                            {expense.status === 'active' ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        {expense.description && (
                          <p className="text-sm text-muted-foreground mt-1">{expense.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatCurrency(expense.monthlyValue)}</p>
                        <p className="text-xs text-muted-foreground">/mês</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(expense)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(expense.id)}>
                        <Trash2 className="h-4 w-4 text-prospere-red" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
