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
import { Textarea } from '@/components/ui/textarea'
import type { Debt, DebtType, Priority, Status } from '@/types'

export default function DebtsPage() {
  const { debts, addDebt, updateDebt, removeDebt } = useStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null)
  const [formData, setFormData] = useState<Partial<Debt>>({
    name: '',
    value: 0,
    type: 'money',
    priority: 'medium',
    status: 'active',
    entryPercentage: 0.30,
  })

  const handleOpenDialog = (debt?: Debt) => {
    if (debt) {
      setEditingDebt(debt)
      setFormData(debt)
    } else {
      setEditingDebt(null)
      setFormData({
        name: '',
        value: 0,
        type: 'money',
        priority: 'medium',
        status: 'active',
        entryPercentage: 0.30,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingDebt) {
      updateDebt(editingDebt.id, formData)
    } else {
      addDebt({
        ...formData,
        id: Date.now().toString(),
        cardValue: formData.type === 'card' ? formData.cardValue : undefined,
        entryValue: formData.type === 'card' && formData.cardValue && formData.entryPercentage
          ? formData.cardValue * formData.entryPercentage
          : undefined,
      } as Debt)
    }
    setIsDialogOpen(false)
    setEditingDebt(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta dívida?')) {
      removeDebt(id)
    }
  }

  const activeDebts = debts.filter((d) => d.status === 'active')
  const moneyDebts = activeDebts.filter((d) => d.type === 'money')
  const cardDebts = activeDebts.filter((d) => d.type === 'card')

  const priorityOrder = { high: 3, medium: 2, low: 1 }
  const sortedDebts = [...debts].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'active' ? -1 : 1
    }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dívidas & Credores</h1>
            <p className="text-muted-foreground">Gerencie todas as suas dívidas e compromissos</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Dívida
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingDebt ? 'Editar Dívida' : 'Nova Dívida'}</DialogTitle>
                <DialogDescription>
                  Preencha os dados da dívida ou compromisso
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Nome do Credor</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: João Silva"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as DebtType })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="money">Dinheiro</SelectItem>
                      <SelectItem value="card">Carta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.type === 'money' ? (
                  <div>
                    <Label htmlFor="value">Valor (R$)</Label>
                    <Input
                      id="value"
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="cardValue">Valor da Carta (R$)</Label>
                      <Input
                        id="cardValue"
                        type="number"
                        value={formData.cardValue || 0}
                        onChange={(e) => {
                          const cardValue = Number(e.target.value)
                          setFormData({
                            ...formData,
                            cardValue,
                            entryValue: cardValue * (formData.entryPercentage || 0.30),
                          })
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="entryPercentage">% de Entrada</Label>
                      <Input
                        id="entryPercentage"
                        type="number"
                        step="0.01"
                        value={(formData.entryPercentage || 0.30) * 100}
                        onChange={(e) => {
                          const percentage = Number(e.target.value) / 100
                          setFormData({
                            ...formData,
                            entryPercentage: percentage,
                            entryValue: (formData.cardValue || 0) * percentage,
                          })
                        }}
                      />
                    </div>
                    {formData.entryValue && (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">Entrada Calculada:</p>
                        <p className="text-lg font-bold">{formatCurrency(formData.entryValue)}</p>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="value">Valor em Dinheiro (opcional, se já tem parte paga)</Label>
                      <Input
                        id="value"
                        type="number"
                        value={formData.value || 0}
                        onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value as Priority })}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as Status })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="negotiated">Negociado</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notas adicionais sobre esta dívida"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={!formData.name}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Resumo */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Dívidas (Dinheiro)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(moneyDebts.reduce((sum, d) => sum + d.value, 0))}</p>
              <p className="text-sm text-muted-foreground">{moneyDebts.length} credores</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Entradas (Cartas)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(cardDebts.reduce((sum, d) => sum + (d.entryValue || 0), 0))}
              </p>
              <p className="text-sm text-muted-foreground">{cardDebts.length} cartas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  moneyDebts.reduce((sum, d) => sum + d.value, 0) +
                  cardDebts.reduce((sum, d) => sum + (d.entryValue || 0), 0)
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Dívidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Nome</th>
                    <th className="text-left p-2">Tipo</th>
                    <th className="text-right p-2">Valor</th>
                    <th className="text-left p-2">Prioridade</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-right p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDebts.map((debt) => (
                    <tr key={debt.id} className="border-b">
                      <td className="p-2 font-medium">{debt.name}</td>
                      <td className="p-2">
                        <span className="px-2 py-1 rounded text-xs bg-muted">
                          {debt.type === 'money' ? 'Dinheiro' : 'Carta'}
                        </span>
                      </td>
                      <td className="p-2 text-right">
                        {debt.type === 'card' && debt.entryValue ? (
                          <div>
                            <div className="font-bold">{formatCurrency(debt.entryValue)}</div>
                            <div className="text-xs text-muted-foreground">
                              (Carta: {formatCurrency(debt.cardValue || 0)})
                            </div>
                          </div>
                        ) : (
                          formatCurrency(debt.value)
                        )}
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            debt.priority === 'high'
                              ? 'bg-prospere-red text-white'
                              : debt.priority === 'medium'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-gray-500 text-white'
                          }`}
                        >
                          {debt.priority === 'high' ? 'Alta' : debt.priority === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            debt.status === 'active'
                              ? 'bg-blue-500 text-white'
                              : debt.status === 'negotiated'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-green-500 text-white'
                          }`}
                        >
                          {debt.status === 'active' ? 'Ativo' : debt.status === 'negotiated' ? 'Negociado' : 'Pago'}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(debt)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(debt.id)}>
                            <Trash2 className="h-4 w-4 text-prospere-red" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
