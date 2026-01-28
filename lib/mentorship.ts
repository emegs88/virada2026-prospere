// Sistema de Mentoria Financeira estilo Tiago Brunet
// Análise prática e direta com números e ações concretas

import type { Debt, ConsorcioParams, SalesGoal } from '@/types'

export interface MentorshipAnalysis {
  debtId: string
  debtName: string
  currentSituation: string
  recommendation: string
  actionPlan: string[]
  priority: 'urgent' | 'high' | 'medium' | 'low'
  estimatedTime: string
  financialImpact: {
    current: number
    afterAction: number
    savings: number
  }
}

export function analyzeDebtWithMentorship(
  debt: Debt,
  consorcioParams: ConsorcioParams,
  salesGoals: SalesGoal[],
  monthlyCommission: number
): MentorshipAnalysis {
  const analysis: MentorshipAnalysis = {
    debtId: debt.id,
    debtName: debt.name,
    currentSituation: '',
    recommendation: '',
    actionPlan: [],
    priority: 'medium',
    estimatedTime: '',
    financialImpact: {
      current: debt.value,
      afterAction: debt.value,
      savings: 0,
    },
  }

  // Análise de situação atual
  if (debt.paymentPlan) {
    const { totalPaid, installments, currentInstallment, isOverdue, monthlyValue } = debt.paymentPlan
    
    if (isOverdue) {
      analysis.currentSituation = `⚠️ ATENÇÃO: Esta dívida está em ATRASO! Você já pagou R$ ${totalPaid.toLocaleString('pt-BR')} de R$ ${debt.value.toLocaleString('pt-BR')} (${currentInstallment}/${installments} parcelas), mas está com ${debt.paymentPlan.overdueDays || 0} dias de atraso.`
      analysis.priority = 'urgent'
    } else {
      analysis.currentSituation = `Você está pagando R$ ${monthlyValue.toLocaleString('pt-BR')}/mês. Já pagou R$ ${totalPaid.toLocaleString('pt-BR')} de R$ ${debt.value.toLocaleString('pt-BR')} (${currentInstallment}/${installments} parcelas).`
    }
  } else {
    analysis.currentSituation = `Dívida de R$ ${debt.value.toLocaleString('pt-BR')} ainda não iniciou pagamento.`
  }

  // Análise de vendas relacionadas
  const recentSales = salesGoals
    .filter((g) => {
      const goalDate = new Date(g.month + '-01')
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
      return goalDate >= threeMonthsAgo && g.actual > 0
    })
    .reduce((sum, g) => sum + g.actual, 0)

  const salesCommission = recentSales * (consorcioParams.commissionPercentage / 100) / consorcioParams.commissionInstallments

  // Recomendações estilo Tiago Brunet
  if (debt.paymentPlan?.isOverdue) {
    analysis.recommendation = `🚨 URGENTE: Você precisa regularizar esta dívida IMEDIATAMENTE. Atrasos geram juros, multas e prejudicam seu relacionamento com o credor.`
    analysis.actionPlan = [
      `1. NEGOCIE HOJE: Entre em contato com ${debt.name} e explique a situação`,
      `2. USE SUAS VENDAS: Você tem R$ ${salesCommission.toLocaleString('pt-BR')}/mês de comissão. Use parte para quitar o atraso`,
      `3. PROPOSTA: Ofereça pagar ${debt.paymentPlan.overdueDays ? Math.ceil((debt.paymentPlan.overdueDays || 0) / 30) : 1} parcela(s) atrasada(s) + juros agora`,
      `4. COMPROMISSO: Se não conseguir quitar tudo, comprometa-se com um plano de pagamento realista`,
    ]
    analysis.estimatedTime = 'Imediato (hoje)'
    analysis.priority = 'urgent'
  } else if (debt.importance >= 8) {
    analysis.recommendation = `💎 ALTA IMPORTÂNCIA: Esta dívida tem impacto estratégico (${debt.importance}/10). Priorize a quitação para liberar fluxo de caixa e melhorar relacionamento.`
    analysis.actionPlan = [
      `1. ACELERE PAGAMENTO: Com sua comissão de R$ ${monthlyCommission.toLocaleString('pt-BR')}/mês, você pode aumentar as parcelas`,
      `2. META: Quitar em ${Math.ceil(debt.value / (monthlyCommission * 0.3))} meses usando 30% da comissão`,
      `3. NEGOCIE DESCONTO: Se pagar à vista, negocie desconto de 5-10%`,
      `4. MONITORE: Acompanhe mês a mês o progresso`,
    ]
    analysis.estimatedTime = `${Math.ceil(debt.value / (monthlyCommission * 0.3))} meses`
    analysis.priority = 'high'
  } else if (salesCommission > 0 && debt.value <= salesCommission * 6) {
    analysis.recommendation = `💰 OPORTUNIDADE: Com suas vendas recentes gerando R$ ${salesCommission.toLocaleString('pt-BR')}/mês, você pode quitar esta dívida em ${Math.ceil(debt.value / salesCommission)} meses.`
    analysis.actionPlan = [
      `1. DESTINE COMISSÃO: Reserve ${Math.ceil((debt.value / salesCommission / 6) * 100)}% da sua comissão mensal para esta dívida`,
      `2. ACELERE: Se fizer vendas extras, use para quitar antes`,
      `3. NEGOCIE: Tente negociar desconto por pagamento antecipado`,
      `4. AUTOMATIZE: Configure débito automático para não esquecer`,
    ]
    analysis.estimatedTime = `${Math.ceil(debt.value / salesCommission)} meses`
    analysis.priority = 'high'
    analysis.financialImpact.afterAction = 0
    analysis.financialImpact.savings = debt.value
  } else if (debt.value > monthlyCommission * 12) {
    analysis.recommendation = `📊 PLANO DE LONGO PRAZO: Esta dívida é grande (R$ ${debt.value.toLocaleString('pt-BR')}) comparada à sua receita mensal. Precisa de estratégia.`
    analysis.actionPlan = [
      `1. NEGOCIE PRAZO: Estenda o prazo para reduzir parcela mensal`,
      `2. AUMENTE VENDAS: Foque em aumentar vendas ativas para aumentar comissão`,
      `3. PRIORIZE: Pague primeiro as dívidas menores para liberar caixa`,
      `4. REAVALIE: A cada 3 meses, reavalie a situação e ajuste o plano`,
    ]
    analysis.estimatedTime = '12+ meses'
    analysis.priority = 'medium'
  } else {
    analysis.recommendation = `✅ SITUAÇÃO CONTROLÁVEL: Esta dívida está dentro da sua capacidade de pagamento. Mantenha o plano atual.`
    analysis.actionPlan = [
      `1. MANTENHA: Continue pagando as parcelas em dia`,
      `2. MONITORE: Acompanhe para não entrar em atraso`,
      `3. ACELERE (opcional): Se sobrar caixa, adiante parcelas`,
    ]
    analysis.estimatedTime = debt.paymentPlan ? `${debt.paymentPlan.installments - debt.paymentPlan.currentInstallment} meses` : 'A definir'
    analysis.priority = 'low'
  }

  // Adicionar conselho específico baseado em vendas
  if (debt.salesRelated?.salesMade && debt.salesRelated.salesMade > 0) {
    analysis.actionPlan.push(
      `💡 BÔNUS: Você já fez ${debt.salesRelated.salesMade} venda(s) relacionada(s) (R$ ${debt.salesRelated.salesAmount.toLocaleString('pt-BR')}). Use parte dessa comissão para acelerar o pagamento!`
    )
  }

  return analysis
}

export function generateMentorshipSummary(
  debts: Debt[],
  consorcioParams: ConsorcioParams,
  salesGoals: SalesGoal[]
): string {
  const monthlyCommission =
    consorcioParams.activeSales *
    (consorcioParams.commissionPercentage / 100) /
    consorcioParams.commissionInstallments

  const overdueDebts = debts.filter((d) => d.paymentPlan?.isOverdue)
  const highImportanceDebts = debts.filter((d) => d.importance >= 8 && d.status === 'active')
  const totalDebts = debts
    .filter((d) => d.status === 'active')
    .reduce((sum, d) => sum + (d.type === 'money' ? d.value : d.entryValue || 0), 0)

  let summary = `# 📊 ANÁLISE FINANCEIRA - MENTORIA TIAGO BRUNET\n\n`

  if (overdueDebts.length > 0) {
    summary += `## 🚨 SITUAÇÃO CRÍTICA\n\n`
    summary += `Você tem ${overdueDebts.length} dívida(s) em ATRASO. Isso é PRIORIDADE MÁXIMA.\n\n`
    summary += `**AÇÃO IMEDIATA:**\n`
    summary += `1. Liste todas as dívidas em atraso\n`
    summary += `2. Entre em contato HOJE com cada credor\n`
    summary += `3. Use sua comissão de R$ ${monthlyCommission.toLocaleString('pt-BR')}/mês para regularizar\n\n`
  }

  summary += `## 💰 SITUAÇÃO ATUAL\n\n`
  summary += `- Comissão Mensal: R$ ${monthlyCommission.toLocaleString('pt-BR')}\n`
  summary += `- Total de Dívidas: R$ ${totalDebts.toLocaleString('pt-BR')}\n`
  summary += `- Dívidas em Atraso: ${overdueDebts.length}\n`
  summary += `- Dívidas de Alta Importância: ${highImportanceDebts.length}\n\n`

  if (totalDebts > monthlyCommission * 12) {
    summary += `## ⚠️ ALERTA\n\n`
    summary += `Suas dívidas (R$ ${totalDebts.toLocaleString('pt-BR')}) são maiores que sua receita anual (R$ ${(monthlyCommission * 12).toLocaleString('pt-BR')}).\n\n`
    summary += `**ESTRATÉGIA:**\n`
    summary += `1. Negocie prazos maiores\n`
    summary += `2. Foque em AUMENTAR VENDAS para aumentar comissão\n`
    summary += `3. Priorize quitar as menores primeiro\n\n`
  } else {
    summary += `## ✅ SITUAÇÃO CONTROLÁVEL\n\n`
    summary += `Suas dívidas estão dentro da sua capacidade. Mantenha o foco em:\n`
    summary += `1. Pagar em dia\n`
    summary += `2. Acelerar quando possível\n`
    summary += `3. Aumentar vendas para ter mais margem\n\n`
  }

  summary += `## 🎯 PRÓXIMOS PASSOS\n\n`
  summary += `1. Regularize atrasos (se houver)\n`
  summary += `2. Revise dívidas de alta importância\n`
  summary += `3. Aumente vendas ativas para aumentar comissão\n`
  summary += `4. Monitore mês a mês\n`

  return summary
}
