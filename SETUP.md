# Guia de Configuração - Painel 2026

## Passo a Passo para Iniciar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar OpenAI API Key

Crie um arquivo `.env.local` na raiz do projeto:

```bash
OPENAI_API_KEY=sk-sua-chave-aqui
```

**Como obter a chave:**
1. Acesse https://platform.openai.com/api-keys
2. Faça login ou crie uma conta
3. Clique em "Create new secret key"
4. Copie a chave e cole no arquivo `.env.local`

**Nota:** A funcionalidade de conselhos da IA só funcionará com a chave configurada. O resto do sistema funciona normalmente sem ela.

### 3. Executar o Projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

### 4. Estrutura de Dados

Todos os dados são salvos automaticamente no LocalStorage do navegador. Não é necessário configuração adicional de banco de dados.

## Funcionalidades Principais

### ✅ Dashboard
- KPIs em tempo real
- Gráficos interativos
- Visão geral do planejamento

### ✅ Dívidas & Credores
- Adicionar/editar/remover dívidas
- Suporte para dívidas em dinheiro e cartas
- Cálculo automático de entradas (30%)

### ✅ Despesas Fixas
- Gerenciamento de despesas mensais
- Período de vigência
- Categorização

### ✅ Metas de Vendas
- Definir metas mensais
- Registrar vendas reais
- Cálculo automático de comissão
- Gráficos de acompanhamento

### ✅ Plano de Pagamento
- Geração automática de plano
- Calendário mês a mês
- Alertas de risco
- Fundo para cartas configurável

### ✅ Destino x Decisão
- Análise completa de decisões
- Integração com OpenAI para conselhos
- Semáforo de decisão (Verde/Amarelo/Vermelho)
- Análise de ROI, risco e viabilidade

## Melhorias Implementadas

1. **Integração OpenAI**: Conselhos inteligentes baseados em contexto financeiro
2. **UI Premium**: Design moderno e profissional
3. **Responsivo**: Funciona em desktop, tablet e mobile
4. **Persistência**: Dados salvos automaticamente
5. **Cálculos Automáticos**: Comissões, entradas e saldos calculados automaticamente
6. **Alertas Inteligentes**: Sistema de alertas para meses com risco

## Próximos Passos Sugeridos

- Exportação PDF/CSV
- Integração com Supabase
- Notificações push
- Histórico de alterações
- Dashboard compartilhado
