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
import { Plus, Edit, Trash2, Save, X, Users, TrendingUp, Target, AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import type { RelationshipLevel } from '@/types'
import { generateRelationshipActionPlan, getRelationshipGap } from '@/lib/decision-scorer'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

export default function RelationshipsPage() {
  const { decisions } = useStore()
  const [relationships, setRelationships] = useState<RelationshipLevel[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRelationship, setEditingRelationship] = useState<RelationshipLevel | null>(null)
  const [formData, setFormData] = useState<Partial<RelationshipLevel>>({
    person: '',
    category: 'strategic',
    level: 'medium',
    currentStatus: 'fair',
    neededLevel: 'medium',
    influence: 50,
    trust: 50,
    value: 0,
  })

  const handleOpenDialog = (rel?: RelationshipLevel) => {
    if (rel) {
      setEditingRelationship(rel)
      setFormData(rel)
    } else {
      setEditingRelationship(null)
      setFormData({
        person: '',
        category: 'strategic',
        level: 'medium',
        currentStatus: 'fair',
        neededLevel: 'medium',
        influence: 50,
        trust: 50,
        value: 0,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    const gap = (() => {
      const levelValues = { critical: 4, high: 3, medium: 2, low: 1, none: 0 }
      const currentValue = levelValues[formData.currentStatus === 'excellent' ? 'high' : formData.currentStatus === 'good' ? 'medium' : formData.currentStatus === 'fair' ? 'low' : 'none']
      const neededValue = levelValues[formData.neededLevel || 'medium']
      return neededValue - currentValue
    })()

    const actionPlan = generateRelationshipActionPlan({
      ...formData,
      gap,
    } as RelationshipLevel)

    const newRelationship: RelationshipLevel = {
      id: editingRelationship?.id || Date.now().toString(),
      person: formData.person || '',
      category: formData.category || 'strategic',
      level: formData.level || 'medium',
      currentStatus: formData.currentStatus || 'fair',
      neededLevel: formData.neededLevel || 'medium',
      gap,
      actionPlan,
      influence: formData.influence || 50,
      trust: formData.trust || 50,
      value: formData.value || 0,
      notes: formData.notes,
    }

    if (editingRelationship) {
      setRelationships(relationships.map((r) => (r.id === editingRelationship.id ? newRelationship : r)))
    } else {
      setRelationships([...relationships, newRelationship])
    }

    setIsDialogOpen(false)
    setEditingRelationship(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este relacionamento?')) {
      setRelationships(relationships.filter((r) => r.id !== id))
    }
  }

  const gaps = getRelationshipGap(relationships)
  const criticalRelationships = relationships.filter((r) => r.neededLevel === 'critical' && r.gap > 0)

  // Dados para gráficos
  const categoryData = relationships.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const radarData = relationships.map((r) => ({
    person: r.person,
    trust: r.trust,
    influence: r.influence,
    value: r.value / 1000, // normalizar
    status: r.currentStatus === 'excellent' ? 100 : r.currentStatus === 'good' ? 75 : r.currentStatus === 'fair' ? 50 : 25,
  }))

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Níveis de Relacionamentos</h1>
            <p className="text-muted-foreground">
              Gerencie seus relacionamentos estratégicos baseado em &quot;Especialista em Pessoas&quot;
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Relacionamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingRelationship ? 'Editar Relacionamento' : 'Novo Relacionamento'}</DialogTitle>
                <DialogDescription>
                  Defina o nível atual e necessário do relacionamento
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="person">Nome da Pessoa</Label>
                  <Input
                    id="person"
                    value={formData.person}
                    onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                    placeholder="Ex: João Silva, Maria Santos..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="strategic">Estratégico</SelectItem>
                        <SelectItem value="financial">Financeiro</SelectItem>
                        <SelectItem value="emotional">Emocional</SelectItem>
                        <SelectItem value="spiritual">Espiritual</SelectItem>
                        <SelectItem value="operational">Operacional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="level">Nível de Importância</Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) => setFormData({ ...formData, level: value as any })}
                    >
                      <SelectTrigger id="level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Crítico</SelectItem>
                        <SelectItem value="high">Alto</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="low">Baixo</SelectItem>
                        <SelectItem value="none">Nenhum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentStatus">Status Atual</Label>
                    <Select
                      value={formData.currentStatus}
                      onValueChange={(value) => setFormData({ ...formData, currentStatus: value as any })}
                    >
                      <SelectTrigger id="currentStatus">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excelente</SelectItem>
                        <SelectItem value="good">Bom</SelectItem>
                        <SelectItem value="fair">Regular</SelectItem>
                        <SelectItem value="poor">Ruim</SelectItem>
                        <SelectItem value="broken">Quebrado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="neededLevel">Nível Necessário</Label>
                    <Select
                      value={formData.neededLevel}
                      onValueChange={(value) => setFormData({ ...formData, neededLevel: value as any })}
                    >
                      <SelectTrigger id="neededLevel">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Crítico</SelectItem>
                        <SelectItem value="high">Alto</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="low">Baixo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="trust">Confiança (0-100)</Label>
                    <Input
                      id="trust"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.trust}
                      onChange={(e) => setFormData({ ...formData, trust: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="influence">Influência (0-100)</Label>
                    <Input
                      id="influence"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.influence}
                      onChange={(e) => setFormData({ ...formData, influence: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="value">Valor (R$)</Label>
                    <Input
                      id="value"
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Observações sobre este relacionamento"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={!formData.person}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Alertas de Gaps */}
        {criticalRelationships.length > 0 && (
          <Card className="border-prospere-red">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-prospere-red">
                <AlertTriangle className="h-5 w-5" />
                Relacionamentos Críticos com Gap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {criticalRelationships.map((rel) => (
                  <div key={rel.id} className="p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{rel.person}</p>
                        <p className="text-sm text-muted-foreground">
                          Status: {rel.currentStatus} → Necessário: {rel.neededLevel} (Gap: {rel.gap})
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium">Plano de Ação:</p>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {rel.actionPlan.map((action, idx) => (
                          <li key={idx}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Relacionamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{relationships.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Confiança Média</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {relationships.length > 0
                  ? Math.round(relationships.reduce((sum, r) => sum + r.trust, 0) / relationships.length)
                  : 0}
                /100
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Influência Média</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {relationships.length > 0
                  ? Math.round(relationships.reduce((sum, r) => sum + r.influence, 0) / relationships.length)
                  : 0}
                /100
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Gaps Críticos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-prospere-red">{gaps.critical}</div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Relacionamentos por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(categoryData).map(([name, value]) => ({ name, value }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#DC2626" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status dos Relacionamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {relationships
                  .sort((a, b) => (b.trust + b.influence) - (a.trust + a.influence))
                  .slice(0, 5)
                  .map((rel) => (
                    <div key={rel.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{rel.person}</span>
                        <span className="text-sm text-muted-foreground">
                          Conf: {rel.trust} | Inf: {rel.influence}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-prospere-red h-2 rounded-full"
                          style={{ width: `${(rel.trust + rel.influence) / 2}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Relacionamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {relationships.map((rel) => (
                <div key={rel.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold">{rel.person}</h3>
                      <span className="px-2 py-1 rounded text-xs bg-muted">
                        {rel.category}
                      </span>
                      {rel.gap > 0 && (
                        <span className="px-2 py-1 rounded text-xs bg-prospere-red text-white">
                          Gap: {rel.gap}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(rel)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(rel.id)}>
                        <Trash2 className="h-4 w-4 text-prospere-red" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Status Atual</p>
                      <p className="font-medium">{rel.currentStatus}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Necessário</p>
                      <p className="font-medium">{rel.neededLevel}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Confiança</p>
                      <p className="font-medium">{rel.trust}/100</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Influência</p>
                      <p className="font-medium">{rel.influence}/100</p>
                    </div>
                  </div>
                  {rel.actionPlan.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium mb-1">Plano de Ação:</p>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {rel.actionPlan.map((action, idx) => (
                          <li key={idx}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
