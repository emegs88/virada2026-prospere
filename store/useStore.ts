import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Debt, FixedExpense, SalesGoal, PaymentPlan, ConsorcioParams, Decision, PersonalExpense, IntelligentAdvice } from '@/types'

interface AppState {
  // Debts
  debts: Debt[]
  addDebt: (debt: Debt) => void
  updateDebt: (id: string, debt: Partial<Debt>) => void
  removeDebt: (id: string) => void

  // Fixed Expenses
  fixedExpenses: FixedExpense[]
  addFixedExpense: (expense: FixedExpense) => void
  updateFixedExpense: (id: string, expense: Partial<FixedExpense>) => void
  removeFixedExpense: (id: string) => void

  // Sales Goals
  salesGoals: SalesGoal[]
  addSalesGoal: (goal: SalesGoal) => void
  updateSalesGoal: (month: string, goal: Partial<SalesGoal>) => void

  // Payment Plans
  paymentPlans: PaymentPlan[]
  updatePaymentPlan: (month: string, plan: Partial<PaymentPlan>) => void
  generatePaymentPlan: (fundPercentage: number) => void

  // Consorcio Params
  consorcioParams: ConsorcioParams
  updateConsorcioParams: (params: Partial<ConsorcioParams>) => void

  // Decisions
  decisions: Decision[]
  addDecision: (decision: Decision) => void
  updateDecision: (id: string, decision: Partial<Decision>) => void
  removeDecision: (id: string) => void

  // Personal Expenses
  personalExpenses: PersonalExpense[]
  addPersonalExpense: (expense: PersonalExpense) => void
  updatePersonalExpense: (id: string, expense: Partial<PersonalExpense>) => void
  removePersonalExpense: (id: string) => void

  // Intelligent Advice
  intelligentAdvices: IntelligentAdvice[]
  addIntelligentAdvice: (advice: IntelligentAdvice) => void
  updateIntelligentAdvice: (id: string, advice: Partial<IntelligentAdvice>) => void
  removeIntelligentAdvice: (id: string) => void
  generateIntelligentAdvice: () => Promise<void>
}

const initialDebts: Debt[] = [
  { id: '1', name: 'Raul (EUA)', value: 200000, type: 'money', priority: 'high', status: 'active' },
  { id: '2', name: 'Osvaldo', value: 250000, type: 'money', priority: 'high', status: 'active' },
  { id: '3', name: 'Silvano', value: 60000, type: 'money', priority: 'medium', status: 'active' },
  { id: '4', name: 'Silvia', value: 60000, type: 'money', priority: 'medium', status: 'active' },
  { id: '5', name: 'Rick', value: 28000, type: 'money', priority: 'low', status: 'active' },
  { id: '6', name: 'Horácio', value: 30000, type: 'money', priority: 'low', status: 'active' },
  { id: '7', name: 'André Veículos (quitação)', value: 105000, type: 'money', priority: 'medium', status: 'active' },
  { id: '8', name: 'Bruno', value: 50000, type: 'money', priority: 'medium', status: 'active' },
  { id: '9', name: 'Fabrício', value: 10000, type: 'money', priority: 'low', status: 'active' },
  { id: '10', name: 'Ivani', value: 200000, type: 'card', cardValue: 600000, entryPercentage: 0.30, entryValue: 180000, priority: 'high', status: 'active' },
  { id: '11', name: 'Cláudio', value: 300000, type: 'card', cardValue: 700000, entryPercentage: 0.30, entryValue: 210000, priority: 'high', status: 'active' },
  { id: '12', name: 'Mario', value: 0, type: 'card', cardValue: 600000, entryPercentage: 0.30, entryValue: 180000, priority: 'high', status: 'active' },
]

const initialFixedExpenses: FixedExpense[] = [
  {
    id: '1',
    name: 'Pouso Alegre Futebol Clube',
    monthlyValue: 35000,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    category: 'Esportes',
    status: 'active',
  },
]

const initialConsorcioParams: ConsorcioParams = {
  commissionPercentage: 5,
  commissionInstallments: 20,
  activeSales: 30000000,
  averageTicket: 50000,
}

const initialPersonalExpenses: PersonalExpense[] = [
  { id: '1', category: 'salary', name: 'Salário', monthlyValue: 0, description: 'Renda mensal', status: 'active' },
  { id: '2', category: 'housing', name: 'Casa/Aluguel', monthlyValue: 0, description: 'Moradia', status: 'active' },
  { id: '3', category: 'family', name: 'Kevialne (Esposa)', monthlyValue: 0, description: 'Despesas da esposa', status: 'active' },
  { id: '4', category: 'family', name: 'Filhos', monthlyValue: 0, description: 'Despesas com filhos', status: 'active' },
  { id: '5', category: 'health', name: 'Convênios Médicos', monthlyValue: 0, description: 'Planos de saúde', status: 'active' },
  { id: '6', category: 'education', name: 'Escola', monthlyValue: 0, description: 'Educação dos filhos', status: 'active' },
  { id: '7', category: 'lifestyle', name: 'Vida Saudável', monthlyValue: 0, description: 'Academia, nutrição, bem-estar', status: 'active' },
]

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      debts: initialDebts,
      fixedExpenses: initialFixedExpenses,
      salesGoals: [],
      paymentPlans: [],
      consorcioParams: initialConsorcioParams,
      decisions: [],
      intelligentAdvices: [],

      addDebt: (debt) =>
        set((state) => {
          const newDebt = { ...debt }
          if (debt.type === 'card' && debt.cardValue && debt.entryPercentage) {
            newDebt.entryValue = debt.cardValue * debt.entryPercentage
          }
          return { debts: [...state.debts, newDebt] }
        }),

      updateDebt: (id, updates) =>
        set((state) => ({
          debts: state.debts.map((debt) => {
            if (debt.id === id) {
              const updated = { ...debt, ...updates }
              if (updated.type === 'card' && updated.cardValue && updated.entryPercentage) {
                updated.entryValue = updated.cardValue * updated.entryPercentage
              }
              return updated
            }
            return debt
          }),
        })),

      removeDebt: (id) =>
        set((state) => ({
          debts: state.debts.filter((debt) => debt.id !== id),
        })),

      addFixedExpense: (expense) =>
        set((state) => ({
          fixedExpenses: [...state.fixedExpenses, expense],
        })),

      updateFixedExpense: (id, updates) =>
        set((state) => ({
          fixedExpenses: state.fixedExpenses.map((expense) =>
            expense.id === id ? { ...expense, ...updates } : expense
          ),
        })),

      removeFixedExpense: (id) =>
        set((state) => ({
          fixedExpenses: state.fixedExpenses.filter((expense) => expense.id !== id),
        })),

      addSalesGoal: (goal) =>
        set((state) => {
          const existing = state.salesGoals.find((g) => g.month === goal.month)
          if (existing) {
            return {
              salesGoals: state.salesGoals.map((g) =>
                g.month === goal.month ? goal : g
              ),
            }
          }
          return { salesGoals: [...state.salesGoals, goal] }
        }),

      updateSalesGoal: (month, updates) =>
        set((state) => ({
          salesGoals: state.salesGoals.map((goal) =>
            goal.month === month ? { ...goal, ...updates } : goal
          ),
        })),

      updatePaymentPlan: (month, updates) =>
        set((state) => {
          const existing = state.paymentPlans.find((p) => p.month === month)
          if (existing) {
            return {
              paymentPlans: state.paymentPlans.map((p) =>
                p.month === month ? { ...p, ...updates } : p
              ),
            }
          }
          return {
            paymentPlans: [...state.paymentPlans, { month, ...updates } as PaymentPlan],
          }
        }),

      generatePaymentPlan: (fundPercentage) =>
        set((state) => {
          const months = [
            '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06',
            '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12',
          ]

          const monthlyCommission =
            state.consorcioParams.activeSales *
            (state.consorcioParams.commissionPercentage / 100) /
            state.consorcioParams.commissionInstallments

          const monthlyFixed = state.fixedExpenses
            .filter((e) => e.status === 'active')
            .reduce((sum, e) => sum + e.monthlyValue, 0)

          const plans: PaymentPlan[] = months.map((month) => {
            const available = monthlyCommission - monthlyFixed
            const fundForCards = available * (fundPercentage / 100)
            const availableForDebts = available - fundForCards

            const moneyDebts = state.debts
              .filter((d) => d.type === 'money' && d.status === 'active')
              .sort((a, b) => {
                const priorityOrder = { low: 1, medium: 2, high: 3 }
                if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                  return priorityOrder[b.priority] - priorityOrder[a.priority]
                }
                return a.value - b.value
              })

            const payments: PaymentPlan['payments'] = []
            let remaining = availableForDebts

            for (const debt of moneyDebts) {
              if (remaining >= debt.value) {
                payments.push({
                  debtId: debt.id,
                  debtName: debt.name,
                  amount: debt.value,
                })
                remaining -= debt.value
              }
            }

            const balance = monthlyCommission - monthlyFixed - payments.reduce((sum, p) => sum + p.amount, 0)
            const alerts: string[] = []

            if (balance < 0) {
              alerts.push('Faltou caixa')
            }

            const cardEntries = state.debts
              .filter((d) => d.type === 'card' && d.status === 'active' && d.entryValue)
              .reduce((sum, d) => sum + (d.entryValue || 0), 0)

            if (cardEntries > fundForCards * 12) {
              alerts.push('Entrada de carta não coberta')
            }

            if (balance < -50000) {
              alerts.push('Mês com risco alto')
            }

            return {
              month,
              revenue: monthlyCommission,
              fixedExpenses: monthlyFixed,
              payments,
              balance,
              alerts,
            }
          })

          return { paymentPlans: plans }
        }),

      updateConsorcioParams: (params) =>
        set((state) => ({
          consorcioParams: { ...state.consorcioParams, ...params },
        })),

      addDecision: (decision) =>
        set((state) => ({
          decisions: [...state.decisions, decision],
        })),

      updateDecision: (id, updates) =>
        set((state) => ({
          decisions: state.decisions.map((decision) =>
            decision.id === id ? { ...decision, ...updates } : decision
          ),
        })),

      removeDecision: (id) =>
        set((state) => ({
          decisions: state.decisions.filter((decision) => decision.id !== id),
        })),

      // Personal Expenses
      personalExpenses: initialPersonalExpenses,
      addPersonalExpense: (expense) =>
        set((state) => ({
          personalExpenses: [...state.personalExpenses, expense],
        })),
      updatePersonalExpense: (id, updates) =>
        set((state) => ({
          personalExpenses: state.personalExpenses.map((expense) =>
            expense.id === id ? { ...expense, ...updates } : expense
          ),
        })),
      removePersonalExpense: (id) =>
        set((state) => ({
          personalExpenses: state.personalExpenses.filter((expense) => expense.id !== id),
        })),

      // Intelligent Advice
      addIntelligentAdvice: (advice) =>
        set((state) => ({
          intelligentAdvices: [...state.intelligentAdvices, advice],
        })),
      updateIntelligentAdvice: (id, updates) =>
        set((state) => ({
          intelligentAdvices: state.intelligentAdvices.map((advice) =>
            advice.id === id ? { ...advice, ...updates } : advice
          ),
        })),
      removeIntelligentAdvice: (id) =>
        set((state) => ({
          intelligentAdvices: state.intelligentAdvices.filter((advice) => advice.id !== id),
        })),
      generateIntelligentAdvice: async () => {
        // Esta função será implementada na página de conselhos
        // Ela chamará a API OpenAI para gerar conselhos
      },
    }),
    {
      name: 'painel-2026-storage',
    }
  )
)
