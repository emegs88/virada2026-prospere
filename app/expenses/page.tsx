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
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { FixedExpense } from '@/types'

export default function ExpensesPage() {
  const { fixedExpenses, addFixedExpense, updateFixedExpense, removeFixedExpense } = useStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null)
  const [formData, setFormData] = useState<Partial<FixedExpense>>({
    name: '',
    monthlyValue: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    status: 'active',
  })

  const handleOpenDialog = (expense?: FixedExpense) => {
    if (expense) {
      setEditingExpense(expense)
      setFormData(expense)
    } else {
      setEditingExpense(null)
      setFormData({
        name: '',
        monthlyValue: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        status: 'active',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingExpense) {
      updateFixedExpense(editingExpense.id, formData)
    } else {
      addFixedExpense({
        ...formData,
        id: Date.now().toString(),
      } as FixedExpense)
    }
    setIsDialogOpen(false)
    setEditingExpense(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta despesa fixa?')) {
      removeFixedExpense(id)
    }
  }

  const activeExpenses = fixedExpenses.filter((e) => e.status === 'active')
  const totalMonthly = activeExpenses.reduce((sum, e) => sum + e.monthlyValue, 0)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Despesas Fixas</h1>
            <p className="text-muted-foreground">Gerencie suas despesas fixas mensais</p>
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
                <DialogTitle>{editingExpense ? 'Editar Despesa' : 'Nova Despesa Fixa'}</DialogTitle>
                <DialogDescription>
                  Preencha os dados da despesa fixa mensal
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Pouso Alegre Futebol Clube"
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
                  <Label htmlFor="category">Categoria (opcional)</Label>
                  <Input
                    id="category"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ex: Esportes, Aluguel, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Data Início</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Data Término</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
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

        {/* Resumo */}
        <Card>
          <CardHeader>
            <CardTitle>Total de Despesas Fixas Mensais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalMonthly)}</p>
            <p className="text-sm text-muted-foreground mt-2">{activeExpenses.length} despesas ativas</p>
          </CardContent>
        </Card>

        {/* Lista */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Despesas Fixas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fixedExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{expense.name}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          expense.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                        }`}
                      >
                        {expense.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatCurrency(expense.monthlyValue)}/mês
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(expense.startDate).toLocaleDateString('pt-BR')} até{' '}
                      {new Date(expense.endDate).toLocaleDateString('pt-BR')}
                      {expense.category && ` • ${expense.category}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(expense)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(expense.id)}>
                      <Trash2 className="h-4 w-4 text-prospere-red" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
