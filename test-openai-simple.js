// Teste simples da chave OpenAI

require('dotenv').config({ path: '.env.local' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ Erro: OPENAI_API_KEY não encontrada no .env.local');
  process.exit(1);
}

console.log('✅ Chave encontrada no .env.local');
console.log('🔑 Chave:', OPENAI_API_KEY.substring(0, 20) + '...' + OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 10));
console.log('📏 Tamanho:', OPENAI_API_KEY.length, 'caracteres');
console.log('🔍 Formato:', OPENAI_API_KEY.startsWith('sk-') ? '✅ Correto (sk-...)' : '❌ Formato incorreto');

async function testAuth() {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
    });

    if (response.status === 401) {
      console.log('\n❌ Chave inválida ou expirada');
      return false;
    } else if (response.status === 429) {
      console.log('\n⚠️  Chave válida, mas quota excedida');
      console.log('💡 Solução: Adicione créditos em https://platform.openai.com/account/billing');
      return true;
    } else if (response.ok) {
      console.log('\n✅ Chave válida e funcionando!');
      return true;
    } else {
      console.log('\n⚠️  Status:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('\n❌ Erro ao testar:', error.message);
    return false;
  }
}

testAuth().then(valid => {
  if (valid) {
    console.log('\n🎯 A chave está configurada corretamente!');
    console.log('📝 Para usar na aplicação, apenas adicione créditos na conta OpenAI.');
  }
});
