'use client'

import { useState, useRef } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { Upload, FileText, Download, Trash2, FileCheck, Building2, User, Bank } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import type { Document, BankStatement, BankTransaction } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [bankStatements, setBankStatements] = useState<BankStatement[]>([])
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isExtractOpen, setIsExtractOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadData, setUploadData] = useState<Partial<Document>>({
    type: 'receipt',
    accountType: 'pf',
  })
  const [extractData, setExtractData] = useState<Partial<BankStatement>>({
    accountType: 'pf',
    bankName: '',
    accountNumber: '',
    period: {
      start: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
      end: format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'yyyy-MM-dd'),
    },
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string

      const newDocument: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: uploadData.type || 'receipt',
        fileType: file.type.includes('pdf') ? 'pdf' : file.type.includes('image') ? 'image' : 'other',
        size: file.size,
        url: base64,
        uploadedAt: new Date().toISOString(),
        description: uploadData.description,
        tags: uploadData.tags,
        accountType: uploadData.accountType,
        bankName: uploadData.bankName,
        accountNumber: uploadData.accountNumber,
        period: uploadData.period,
      }

      setDocuments([...documents, newDocument])
      setIsUploadOpen(false)
      setUploadData({ type: 'receipt', accountType: 'pf' })
    }

    reader.readAsDataURL(file)
  }

  const handleExtractStatement = async () => {
    // Simulação de extração de extrato bancário
    // Em produção, isso chamaria uma API real de extração de PDF/OFX
    
    setIsExtractOpen(false)
    
    // Simular processamento
    const mockTransactions: BankTransaction[] = [
      {
        id: '1',
        date: extractData.period?.start || new Date().toISOString(),
        description: 'Salário',
        type: 'credit',
        amount: 15000,
        balance: 15000,
        category: 'salary',
      },
      {
        id: '2',
        date: new Date().toISOString(),
        description: 'Pagamento fornecedor',
        type: 'debit',
        amount: 5000,
        balance: 10000,
        category: 'supplier',
      },
    ]

    const newStatement: BankStatement = {
      id: Date.now().toString(),
      accountType: extractData.accountType || 'pf',
      bankName: extractData.bankName || '',
      accountNumber: extractData.accountNumber || '',
      period: extractData.period || { start: '', end: '' },
      balance: {
        initial: 0,
        final: mockTransactions[mockTransactions.length - 1]?.balance || 0,
      },
      transactions: mockTransactions,
      extractedAt: new Date().toISOString(),
      status: 'processed',
    }

    setBankStatements([...bankStatements, newStatement])
    alert('Extrato extraído com sucesso! (Simulação - em produção usaria API real)')
  }

  const handleDeleteDocument = (id: string) => {
    if (confirm('Tem certeza que deseja remover este documento?')) {
      setDocuments(documents.filter((d) => d.id !== id))
    }
  }

  const handleDeleteStatement = (id: string) => {
    if (confirm('Tem certeza que deseja remover este extrato?')) {
      setBankStatements(bankStatements.filter((s) => s.id !== id))
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Documentos e Comprovantes</h1>
            <p className="text-muted-foreground">Gerencie comprovantes e extratos bancários (PJ e PF)</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isExtractOpen} onOpenChange={setIsExtractOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Bank className="mr-2 h-4 w-4" />
                  Extrair Extrato
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Extrair Extrato Bancário</DialogTitle>
                  <DialogDescription>
                    Configure os dados para extração automática do extrato
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="accountType">Tipo de Conta</Label>
                    <Select
                      value={extractData.accountType}
                      onValueChange={(value) => setExtractData({ ...extractData, accountType: value as 'pf' | 'pj' })}
                    >
                      <SelectTrigger id="accountType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pf">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Pessoa Física (PF)
                          </div>
                        </SelectItem>
                        <SelectItem value="pj">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Pessoa Jurídica (PJ)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bankName">Banco</Label>
                    <Input
                      id="bankName"
                      value={extractData.bankName}
                      onChange={(e) => setExtractData({ ...extractData, bankName: e.target.value })}
                      placeholder="Ex: Banco do Brasil, Itaú, Bradesco..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="accountNumber">Número da Conta</Label>
                    <Input
                      id="accountNumber"
                      value={extractData.accountNumber}
                      onChange={(e) => setExtractData({ ...extractData, accountNumber: e.target.value })}
                      placeholder="00000-0"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="periodStart">Período Início</Label>
                      <Input
                        id="periodStart"
                        type="date"
                        value={extractData.period?.start}
                        onChange={(e) =>
                          setExtractData({
                            ...extractData,
                            period: { ...extractData.period!, start: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="periodEnd">Período Fim</Label>
                      <Input
                        id="periodEnd"
                        type="date"
                        value={extractData.period?.end}
                        onChange={(e) =>
                          setExtractData({
                            ...extractData,
                            period: { ...extractData.period!, end: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Nota:</strong> Em produção, esta funcionalidade se conectaria com APIs bancárias
                      ou processaria arquivos OFX/PDF automaticamente para extrair transações.
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsExtractOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleExtractStatement}>
                    <FileCheck className="mr-2 h-4 w-4" />
                    Extrair
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Anexar Documento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Anexar Documento</DialogTitle>
                  <DialogDescription>
                    Faça upload de comprovantes, recibos ou extratos
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="file">Arquivo</Label>
                    <Input
                      id="file"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.ofx"
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Selecionar Arquivo
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="docType">Tipo de Documento</Label>
                    <Select
                      value={uploadData.type}
                      onValueChange={(value) => setUploadData({ ...uploadData, type: value as any })}
                    >
                      <SelectTrigger id="docType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receipt">Comprovante</SelectItem>
                        <SelectItem value="invoice">Nota Fiscal</SelectItem>
                        <SelectItem value="bank_statement">Extrato Bancário</SelectItem>
                        <SelectItem value="contract">Contrato</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="accountTypeDoc">Tipo de Conta</Label>
                    <Select
                      value={uploadData.accountType}
                      onValueChange={(value) => setUploadData({ ...uploadData, accountType: value as 'pf' | 'pj' })}
                    >
                      <SelectTrigger id="accountTypeDoc">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pf">Pessoa Física (PF)</SelectItem>
                        <SelectItem value="pj">Pessoa Jurídica (PJ)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {uploadData.type === 'bank_statement' && (
                    <>
                      <div>
                        <Label htmlFor="bankNameDoc">Banco</Label>
                        <Input
                          id="bankNameDoc"
                          value={uploadData.bankName || ''}
                          onChange={(e) => setUploadData({ ...uploadData, bankName: e.target.value })}
                          placeholder="Nome do banco"
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountNumberDoc">Número da Conta</Label>
                        <Input
                          id="accountNumberDoc"
                          value={uploadData.accountNumber || ''}
                          onChange={(e) => setUploadData({ ...uploadData, accountNumber: e.target.value })}
                          placeholder="00000-0"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="descriptionDoc">Descrição</Label>
                    <Textarea
                      id="descriptionDoc"
                      value={uploadData.description || ''}
                      onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                      placeholder="Descrição do documento"
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Extratos Processados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bankStatements.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">PF</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {documents.filter((d) => d.accountType === 'pf').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">PJ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {documents.filter((d) => d.accountType === 'pj').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Extratos Bancários */}
        {bankStatements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Extratos Bancários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bankStatements.map((statement) => (
                  <div key={statement.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Bank className="h-5 w-5 text-muted-foreground" />
                          <h3 className="font-semibold">{statement.bankName}</h3>
                          <span className="px-2 py-1 rounded text-xs bg-muted">
                            {statement.accountType.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 rounded text-xs bg-muted">
                            {statement.accountNumber}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(statement.period.start), 'dd/MM/yyyy', { locale: ptBR })} até{' '}
                          {format(new Date(statement.period.end), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteStatement(statement.id)}>
                        <Trash2 className="h-4 w-4 text-prospere-red" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Saldo Inicial</p>
                        <p className="font-semibold">{formatCurrency(statement.balance.initial)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Saldo Final</p>
                        <p className="font-semibold">{formatCurrency(statement.balance.final)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Transações</p>
                        <p className="font-semibold">{statement.transactions.length}</p>
                      </div>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Data</th>
                            <th className="text-left p-2">Descrição</th>
                            <th className="text-right p-2">Valor</th>
                            <th className="text-right p-2">Saldo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {statement.transactions.map((tx) => (
                            <tr key={tx.id} className="border-b">
                              <td className="p-2">{format(new Date(tx.date), 'dd/MM/yyyy')}</td>
                              <td className="p-2">{tx.description}</td>
                              <td className={`p-2 text-right ${tx.type === 'credit' ? 'text-green-600' : 'text-prospere-red'}`}>
                                {tx.type === 'credit' ? '+' : '-'} {formatCurrency(tx.amount)}
                              </td>
                              <td className="p-2 text-right">{formatCurrency(tx.balance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documentos */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos Anexados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{doc.name}</h3>
                        <span className="px-2 py-1 rounded text-xs bg-muted">{doc.type}</span>
                        <span className="px-2 py-1 rounded text-xs bg-muted">
                          {doc.accountType?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatFileSize(doc.size)} • {format(new Date(doc.uploadedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                      {doc.description && (
                        <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                      )}
                      {doc.bankName && (
                        <p className="text-sm text-muted-foreground">
                          {doc.bankName} - {doc.accountNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => window.open(doc.url, '_blank')}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteDocument(doc.id)}>
                      <Trash2 className="h-4 w-4 text-prospere-red" />
                    </Button>
                  </div>
                </div>
              ))}
              {documents.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum documento anexado ainda.</p>
                  <p className="text-sm mt-2">Clique em &quot;Anexar Documento&quot; para começar.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
