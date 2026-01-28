// Script para testar a chave da API do OpenAI

require('dotenv').config({ path: '.env.local' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ Erro: OPENAI_API_KEY não encontrada no .env.local');
  process.exit(1);
}

console.log('🔑 Chave encontrada:', OPENAI_API_KEY.substring(0, 20) + '...');
console.log('🧪 Testando conexão com OpenAI...\n');

async function testOpenAI() {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erro na API:', response.status, response.statusText);
      console.error('Detalhes:', error);
      process.exit(1);
    }

    const data = await response.json();
    console.log('✅ Conexão bem-sucedida!');
    console.log(`📊 Modelos disponíveis: ${data.data.length}`);
    console.log('\n🧠 Testando geração de resposta...\n');

    // Teste de geração
    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente útil.',
          },
          {
            role: 'user',
            content: 'Responda apenas: "Teste bem-sucedido!"',
          },
        ],
        max_tokens: 50,
      }),
    });

    if (!chatResponse.ok) {
      const error = await chatResponse.text();
      console.error('❌ Erro na geração:', chatResponse.status, chatResponse.statusText);
      console.error('Detalhes:', error);
      process.exit(1);
    }

    const chatData = await chatResponse.json();
    const message = chatData.choices[0]?.message?.content || 'Sem resposta';
    
    console.log('✅ Geração bem-sucedida!');
    console.log('📝 Resposta:', message);
    console.log('\n🎉 Chave da OpenAI está funcionando perfeitamente!');
    
  } catch (error) {
    console.error('❌ Erro ao testar:', error.message);
    process.exit(1);
  }
}

testOpenAI();
