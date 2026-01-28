# Painel 2026 — Destino x Decisão

Sistema de gestão financeira e planejamento estratégico desenvolvido para o Emerson da Prospere.

## 🚀 Funcionalidades

- **Dashboard**: Visão geral com KPIs e gráficos interativos
- **Dívidas & Credores**: Gerenciamento completo de dívidas (dinheiro e cartas)
- **Despesas Fixas**: Controle de despesas mensais recorrentes
- **Metas de Vendas**: Acompanhamento de metas e vendas reais de consórcio
- **Plano de Pagamento**: Calendário financeiro mês a mês com geração automática
- **Destino x Decisão**: Análise completa de decisões estratégicas com IA (OpenAI)

## 🛠️ Tecnologias

- **Next.js 14** com TypeScript
- **TailwindCSS** para estilização
- **shadcn/ui** para componentes
- **Recharts** para gráficos
- **Zustand** para gerenciamento de estado
- **LocalStorage** para persistência
- **OpenAI API** para conselhos inteligentes

## 📦 Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Configure a variável de ambiente:

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` e adicione sua chave da OpenAI:

```
OPENAI_API_KEY=sk-sua-chave-aqui
```

4. Execute o servidor de desenvolvimento:

```bash
npm run dev
```

5. Acesse [http://localhost:3000](http://localhost:3000)

## 🎨 Identidade Visual

- **Cores**: Preto (#000000), Branco (#FFFFFF), Vermelho (#DC2626)
- **Estilo**: Premium, executivo, confiável
- **Layout**: Dashboard com sidebar + conteúdo principal

## 📊 Dados Pré-carregados

O sistema vem com dados iniciais pré-populados:

### Dívidas em Dinheiro
- Raul (EUA): R$ 200.000
- Osvaldo: R$ 250.000
- Silvano: R$ 60.000
- Silvia: R$ 60.000
- Rick: R$ 28.000
- Horácio: R$ 30.000
- André Veículos: R$ 105.000
- Bruno: R$ 50.000
- Fabrício: R$ 10.000

### Dívidas Estruturais (Cartas)
- Ivani: Carta R$ 600.000 (entrada 30% = R$ 180.000)
- Cláudio: Carta R$ 700.000 (entrada 30% = R$ 210.000)
- Mario: Carta R$ 600.000 (entrada 30% = R$ 180.000)

### Despesas Fixas
- Pouso Alegre Futebol Clube: R$ 35.000/mês até Dez/2026

### Parâmetros Consórcio
- Comissão: 5%
- Parcelas: 20
- Vendas Ativas: R$ 30.000.000
- Comissão Mensal: R$ 75.000

## 🤖 Integração OpenAI

A funcionalidade de "Destino x Decisão" utiliza a API da OpenAI para fornecer conselhos estratégicos baseados em:
- Orientação divina (paz/sinal)
- Conselhos recebidos
- Análise matemática (ROI, risco, viabilidade)
- Contexto financeiro atual

**Importante**: Você precisa de uma chave da OpenAI para usar esta funcionalidade. Obtenha em: https://platform.openai.com/api-keys

## 💾 Persistência

Todos os dados são salvos automaticamente no LocalStorage do navegador. Os dados persistem entre sessões.

## 📝 Estrutura do Projeto

```
├── app/
│   ├── api/
│   │   └── openai/          # API route para OpenAI
│   ├── debts/               # Página de dívidas
│   ├── expenses/            # Página de despesas fixas
│   ├── sales/               # Página de metas de vendas
│   ├── payment-plan/        # Página de plano de pagamento
│   ├── decision/            # Página de decisões
│   └── page.tsx             # Dashboard principal
├── components/
│   ├── layout/             # Componentes de layout
│   └── ui/                  # Componentes shadcn/ui
├── lib/
│   └── utils.ts            # Utilitários
├── store/
│   └── useStore.ts         # Store Zustand
└── types/
    └── index.ts            # Tipos TypeScript
```

## 🎯 Próximos Passos

- [ ] Exportação para PDF/CSV
- [ ] Integração com Supabase (substituir LocalStorage)
- [ ] Drag and drop no plano de pagamento
- [ ] Notificações e alertas
- [ ] Histórico de alterações

## 📄 Licença

Desenvolvido para uso interno da Prospere.
