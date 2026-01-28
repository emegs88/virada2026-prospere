import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { decisionData, context } = await request.json()

    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key não configurada. Configure OPENAI_API_KEY no .env.local' },
        { status: 500 }
      )
    }

    const prompt = `Você é um consultor financeiro experiente e sábio, especializado em tomadas de decisão estratégicas. 
Analise a seguinte situação de decisão e forneça conselhos práticos, objetivos e baseados em dados.

CONTEXTO FINANCEIRO:
${context ? JSON.stringify(context, null, 2) : 'Não fornecido'}

DECISÃO A SER ANALISADA:
Título: ${decisionData.title || 'Não informado'}
Orientação Divina: ${decisionData.orientation?.peace ? 'Há paz/sinal positivo' : 'Sem paz/sinal negativo'}
${decisionData.orientation?.sign ? `Sinal específico: ${decisionData.orientation.sign}` : ''}
${decisionData.orientation?.notes ? `Notas: ${decisionData.orientation.notes}` : ''}

Conselho Recebido:
${decisionData.advice?.who ? `De: ${decisionData.advice.who}` : ''}
${decisionData.advice?.date ? `Data: ${decisionData.advice.date}` : ''}
${decisionData.advice?.cost ? `Custo: R$ ${decisionData.advice.cost.toLocaleString('pt-BR')}` : ''}
${decisionData.advice?.conclusion ? `Conclusão: ${decisionData.advice.conclusion}` : ''}

Análise Matemática:
${decisionData.math?.roi ? `ROI: ${decisionData.math.roi}%` : ''}
${decisionData.math?.risk ? `Risco: ${decisionData.math.risk}` : ''}
${decisionData.math?.worstCase ? `Pior Cenário: ${decisionData.math.worstCase}` : ''}
${decisionData.math?.viability ? `Viabilidade: ${decisionData.math.viability}` : ''}

Forneça uma análise estruturada em português brasileiro com:
1. RESUMO EXECUTIVO: Uma visão geral da decisão (2-3 frases)
2. ANÁLISE DE ALINHAMENTO: Verifique se há coerência entre orientação divina, conselhos e números
3. PONTOS FORTES: O que favorece esta decisão
4. PONTOS DE ATENÇÃO: Riscos e preocupações
5. RECOMENDAÇÃO: Baseado em todos os fatores, recomende:
   - VERDE (prosseguir): Se tudo está alinhado e os números são favoráveis
   - AMARELO (esperar): Se há incertezas ou necessidade de mais informações
   - VERMELHO (não entrar): Se há sinais claros de que não é o momento ou os riscos são altos
6. PRÓXIMOS PASSOS: Ações concretas recomendadas

Seja direto, prático e objetivo. Use linguagem executiva mas acessível.`

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
            content: 'Você é um consultor financeiro experiente, sábio e objetivo, especializado em ajudar empreendedores a tomar decisões estratégicas baseadas em dados, intuição e conselhos.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
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
    console.error('Error in OpenAI API route:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
