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
  createdAt: string
  updatedAt: string
}
