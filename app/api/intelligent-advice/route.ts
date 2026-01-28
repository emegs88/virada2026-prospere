import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { financialData, influencer } = await request.json()

    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key não configurada' },
        { status: 500 }
      )
    }

    const influencerPrompts = {
      'tiago-brunet': `Você é Tiago Brunet, especialista em educação financeira e investimentos. 
Seu estilo é direto, prático e focado em liberdade financeira. Você sempre usa exemplos concretos e números.
Analise a situação financeira e forneça conselhos práticos com números específicos, gráficos sugeridos e metas claras.`,

      'thiago-nigro': `Você é Thiago Nigro, criador do canal "O Primo Rico". 
Seu estilo é didático, usa analogias e sempre foca em educação financeira de longo prazo.
Forneça conselhos sobre investimentos, dívidas e planejamento com foco em construir patrimônio.`,

      'flavio-augusto': `Você é Flávio Augusto da Silva, empreendedor e autor de "Geração de Valor".
Seu estilo é motivacional, focado em empreendedorismo e crescimento de receita.
Analise oportunidades de aumentar receita, reduzir custos e criar múltiplas fontes de renda.`,

      'ai-combined': `Você é um consultor financeiro de elite que combina o melhor de Tiago Brunet, Thiago Nigro e Flávio Augusto.
Forneça uma análise completa, prática e estratégica com números, gráficos sugeridos e um plano de ação claro.`,
    }

    const prompt = `${influencerPrompts[influencer as keyof typeof influencerPrompts] || influencerPrompts['ai-combined']}

SITUAÇÃO FINANCEIRA ATUAL:
${JSON.stringify(financialData, null, 2)}

Forneça uma análise completa em português brasileiro com:

1. RESUMO EXECUTIVO: Visão geral da situação (2-3 frases com números)

2. ANÁLISE DE NÚMEROS:
   - Receita mensal: R$ ${financialData.monthlyRevenue?.toLocaleString('pt-BR') || 'N/A'}
   - Despesas totais: R$ ${financialData.totalExpenses?.toLocaleString('pt-BR') || 'N/A'}
   - Saldo mensal: R$ ${financialData.monthlyBalance?.toLocaleString('pt-BR') || 'N/A'}
   - Dívidas totais: R$ ${financialData.totalDebts?.toLocaleString('pt-BR') || 'N/A'}
   - Taxa de poupança: ${financialData.savingsRate?.toFixed(1) || 'N/A'}%

3. CONSELHOS PRÁTICOS (com números específicos):
   - O que fazer AGORA (próximos 30 dias)
   - O que fazer em 90 dias
   - Meta de 12 meses

4. GRÁFICOS SUGERIDOS:
   - Quais gráficos seriam úteis para visualizar esta situação
   - Dados específicos para cada gráfico

5. PLANO DE AÇÃO:
   - Passo 1: [ação concreta com número]
   - Passo 2: [ação concreta com número]
   - Passo 3: [ação concreta com número]

6. MÉTRICAS DE SUCESSO:
   - Meta de 3 meses: [número]
   - Meta de 6 meses: [número]
   - Meta de 12 meses: [número]

Seja específico, use números reais, e forneça conselhos acionáveis.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um consultor financeiro de elite, especializado em ajudar pessoas a alcançarem liberdade financeira através de conselhos práticos, números concretos e planos de ação claros.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API Error:', error)
      return NextResponse.json(
        { error: 'Erro ao chamar OpenAI API', details: error },
        { status: response.status }
      )
    }

    const data = await response.json()
    const advice = data.choices[0]?.message?.content || 'Não foi possível gerar conselho.'

    return NextResponse.json({ advice })
  } catch (error) {
    console.error('Error in intelligent advice API route:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
