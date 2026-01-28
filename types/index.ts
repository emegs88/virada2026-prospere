export type DebtType = 'money' | 'card'
export type Priority = 'high' | 'medium' | 'low'
export type Status = 'active' | 'negotiated' | 'paid'

export interface Debt {
  id: string
  name: string
  value: number
  type: DebtType
  cardValue?: number
  entryPercentage?: number
  entryValue?: number
  priority: Priority
  status: Status
  notes?: string
  dueDate?: string
  // Novos campos para mentoria
  importance?: number // 1-10 (importância estratégica)
  paymentPlan?: {
    totalPaid: number
    installments: number
    currentInstallment: number
    monthlyValue: number
    startDate: string
    isOverdue: boolean
    overdueDays?: number
  }
  salesRelated?: {
    salesMade: number
    salesAmount: number
    canPayWithSales: boolean
  }
  mentorshipAdvice?: string
  actionPlan?: string[]
}

export interface FixedExpense {
  id: string
  name: string
  monthlyValue: number
  startDate: string
  endDate: string
  category?: string
  status: 'active' | 'inactive'
}

export interface SalesGoal {
  month: string // YYYY-MM
  target: number
  actual: number
}

export interface PaymentPlan {
  month: string // YYYY-MM
  revenue: number
  fixedExpenses: number
  payments: Array<{
    debtId: string
    debtName: string
    amount: number
  }>
  balance: number
  alerts: string[]
}

export interface ConsorcioParams {
  commissionPercentage: number
  commissionInstallments: number
  activeSales: number
  averageTicket?: number
}

export interface Decision {
  id: string
  title: string
  orientation?: {
    peace?: boolean
    sign?: string
    notes?: string
  }
  advice?: {
    who?: string
    date?: string
    cost?: number
    conclusion?: string
  }
  math?: {
    roi?: number
    risk?: string
    worstCase?: string
    viability?: string
  }
  result?: 'green' | 'yellow' | 'red'
  score?: DecisionScore
  relationships?: RelationshipLevel[]
  createdAt: string
  updatedAt: string
}

export interface DecisionScore {
  total: number // 0-100
  financial: number // 0-25
  strategic: number // 0-25
  relational: number // 0-25
  spiritual: number // 0-25
  breakdown: {
    financial: {
      roi: number
      risk: number
      cashflow: number
      timing: number
    }
    strategic: {
      alignment: number
      opportunity: number
      scalability: number
      competitive: number
    }
    relational: {
      trust: number
      network: number
      influence: number
      support: number
    }
    spiritual: {
      peace: number
      purpose: number
      integrity: number
      legacy: number
    }
  }
  recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no'
  confidence: number // 0-100
}

export interface RelationshipLevel {
  id: string
  person: string
  category: 'strategic' | 'financial' | 'emotional' | 'spiritual' | 'operational'
  level: 'critical' | 'high' | 'medium' | 'low' | 'none'
  currentStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'broken'
  neededLevel: 'critical' | 'high' | 'medium' | 'low'
  gap: number // diferença entre atual e necessário
  actionPlan: string[]
  influence: number // 0-100
  trust: number // 0-100
  value: number // valor que essa pessoa traz/representa
  notes?: string
}

export interface PersonalExpense {
  id: string
  category: 'salary' | 'housing' | 'family' | 'health' | 'education' | 'lifestyle' | 'other'
  name: string
  monthlyValue: number
  description?: string
  status: 'active' | 'inactive'
}

export interface IntelligentAdvice {
  id: string
  title: string
  influencer: 'tiago-brunet' | 'thiago-nigro' | 'flavio-augusto' | 'ai-combined'
  category: 'financial' | 'investment' | 'debt' | 'lifestyle' | 'family' | 'health'
  advice: string
  metrics: {
    currentValue?: number
    targetValue?: number
    percentage?: number
    timeframe?: string
  }
  charts?: {
    type: 'bar' | 'line' | 'pie' | 'donut'
    data: any[]
  }
  createdAt: string
}

export interface FinancialEvent {
  id: string
  title: string
  description?: string
  date: string
  type: 'payment' | 'receipt' | 'deadline' | 'meeting' | 'reminder' | 'other'
  amount?: number
  category?: string
  status: 'pending' | 'completed' | 'cancelled'
  attachments?: Document[]
  relatedDebtId?: string
  relatedExpenseId?: string
  createdAt: string
  updatedAt: string
}

export interface Document {
  id: string
  name: string
  type: 'receipt' | 'invoice' | 'bank_statement' | 'contract' | 'other'
  fileType: 'pdf' | 'image' | 'excel' | 'other'
  size: number // bytes
  url: string // base64 ou URL
  uploadedAt: string
  description?: string
  tags?: string[]
  accountType?: 'pf' | 'pj'
  bankName?: string
  accountNumber?: string
  period?: {
    start: string
    end: string
  }
}

export interface BankStatement {
  id: string
  accountType: 'pf' | 'pj'
  bankName: string
  accountNumber: string
  period: {
    start: string
    end: string
  }
  balance: {
    initial: number
    final: number
  }
  transactions: BankTransaction[]
  documentId?: string
  extractedAt: string
  status: 'pending' | 'processed' | 'error'
}

export interface BankTransaction {
  id: string
  date: string
  description: string
  type: 'credit' | 'debit'
  amount: number
  balance: number
  category?: string
  tags?: string[]
}
