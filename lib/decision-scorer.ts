// Sistema de scoring de decisões baseado em múltiplos critérios
// Inspirado em conceitos de "Especialista em Pessoas" e análise decisória

import type { Decision, DecisionScore, RelationshipLevel } from '@/types'

export function calculateDecisionScore(decision: Decision, relationships: RelationshipLevel[] = []): DecisionScore {
  // Score Financeiro (0-25)
  const roi = decision.math?.roi || 0
  const financialScore = Math.min(25, Math.max(0, (roi / 50) * 25)) // ROI de 50% = score máximo

  const risk = decision.math?.risk?.toLowerCase() || ''
  const riskScore = risk.includes('baixo') ? 25 : risk.includes('médio') ? 15 : risk.includes('alto') ? 5 : 10

  const financialBreakdown = {
    roi: Math.min(10, (roi / 50) * 10),
    risk: riskScore / 25 * 10,
    cashflow: decision.math?.viability?.toLowerCase().includes('positivo') ? 10 : 5,
    timing: 10, // assumir timing adequado se não especificado
  }

  const financial = (financialBreakdown.roi + financialBreakdown.risk + financialBreakdown.cashflow + financialBreakdown.timing) / 4 * 25

  // Score Estratégico (0-25)
  const strategicBreakdown = {
    alignment: decision.orientation?.peace ? 10 : 5,
    opportunity: decision.math?.viability?.toLowerCase().includes('alta') ? 10 : 5,
    scalability: 7.5, // valor médio
    competitive: 7.5,
  }

  const strategic = (strategicBreakdown.alignment + strategicBreakdown.opportunity + strategicBreakdown.scalability + strategicBreakdown.competitive) / 4 * 25

  // Score Relacional (0-25) - baseado em "Especialista em Pessoas"
  const relevantRelationships = relationships.filter((r) => 
    r.category === 'strategic' || r.category === 'financial' || r.category === 'operational'
  )

  const trustScore = relevantRelationships.length > 0
    ? relevantRelationships.reduce((sum, r) => sum + r.trust, 0) / relevantRelationships.length / 100 * 10
    : 5

  const influenceScore = relevantRelationships.length > 0
    ? relevantRelationships.reduce((sum, r) => sum + r.influence, 0) / relevantRelationships.length / 100 * 10
    : 5

  const supportScore = relevantRelationships.filter((r) => r.currentStatus === 'excellent' || r.currentStatus === 'good').length / Math.max(1, relevantRelationships.length) * 10

  const relationalBreakdown = {
    trust: trustScore,
    network: relevantRelationships.length > 0 ? Math.min(10, relevantRelationships.length * 2) : 5,
    influence: influenceScore,
    support: supportScore,
  }

  const relational = (relationalBreakdown.trust + relationalBreakdown.network + relationalBreakdown.influence + relationalBreakdown.support) / 4 * 25

  // Score Espiritual (0-25)
  const spiritualBreakdown = {
    peace: decision.orientation?.peace ? 10 : 3,
    purpose: decision.orientation?.sign ? 8 : 5,
    integrity: 8, // assumir integridade se não especificado
    legacy: 7, // valor médio
  }

  const spiritual = (spiritualBreakdown.peace + spiritualBreakdown.purpose + spiritualBreakdown.integrity + spiritualBreakdown.legacy) / 4 * 25

  // Score Total
  const total = financial + strategic + relational + spiritual

  // Confiança (baseada na consistência dos scores)
  const scores = [financial, strategic, relational, spiritual]
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length
  const confidence = Math.max(0, 100 - (variance * 2)) // menor variância = maior confiança

  // Recomendação
  let recommendation: DecisionScore['recommendation']
  if (total >= 80 && confidence >= 70) {
    recommendation = 'strong_yes'
  } else if (total >= 65 && confidence >= 60) {
    recommendation = 'yes'
  } else if (total >= 50 && confidence >= 50) {
    recommendation = 'maybe'
  } else if (total >= 35) {
    recommendation = 'no'
  } else {
    recommendation = 'strong_no'
  }

  return {
    total: Math.round(total),
    financial: Math.round(financial),
    strategic: Math.round(strategic),
    relational: Math.round(relational),
    spiritual: Math.round(spiritual),
    breakdown: {
      financial: financialBreakdown,
      strategic: strategicBreakdown,
      relational: relationalBreakdown,
      spiritual: spiritualBreakdown,
    },
    recommendation,
    confidence: Math.round(confidence),
  }
}

export function getRelationshipGap(relationships: RelationshipLevel[]): {
  critical: number
  high: number
  medium: number
  low: number
} {
  const gaps = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  }

  relationships.forEach((rel) => {
    const levelValues = { critical: 4, high: 3, medium: 2, low: 1, none: 0 }
    const currentValue = levelValues[rel.currentStatus === 'excellent' ? 'high' : rel.currentStatus === 'good' ? 'medium' : rel.currentStatus === 'fair' ? 'low' : 'none']
    const neededValue = levelValues[rel.neededLevel]
    const gap = neededValue - currentValue

    if (rel.neededLevel === 'critical' && gap > 0) gaps.critical += gap
    else if (rel.neededLevel === 'high' && gap > 0) gaps.high += gap
    else if (rel.neededLevel === 'medium' && gap > 0) gaps.medium += gap
    else if (rel.neededLevel === 'low' && gap > 0) gaps.low += gap
  })

  return gaps
}

export function generateRelationshipActionPlan(relationship: RelationshipLevel): string[] {
  const actions: string[] = []

  // Baseado em "Especialista em Pessoas" - Dale Carnegie principles
  if (relationship.gap > 0) {
    if (relationship.trust < 70) {
      actions.push('Aumentar confiança: encontros regulares, cumprir promessas, transparência')
    }
    if (relationship.influence < 60) {
      actions.push('Construir influência: oferecer valor primeiro, ajudar sem esperar retorno')
    }
    if (relationship.currentStatus === 'poor' || relationship.currentStatus === 'broken') {
      actions.push('Reparar relacionamento: pedir desculpas se necessário, mostrar mudança genuína')
    }
    if (relationship.level === 'none') {
      actions.push('Iniciar relacionamento: primeiro contato, apresentação, interesse genuíno')
    }
  }

  // Ações específicas por categoria
  if (relationship.category === 'strategic') {
    actions.push('Alinhar objetivos comuns, criar win-win situations')
  }
  if (relationship.category === 'financial') {
    actions.push('Demonstrar confiabilidade financeira, histórico de pagamentos')
  }
  if (relationship.category === 'emotional') {
    actions.push('Investir tempo em conversas profundas, mostrar interesse genuíno')
  }

  return actions.length > 0 ? actions : ['Manter relacionamento atual']
}
