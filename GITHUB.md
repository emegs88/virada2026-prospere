# Como fazer push para o GitHub

## Método 1: Via Terminal (Recomendado)

1. **Crie o repositório no GitHub:**
   - Acesse: https://github.com/new
   - Nome: `painel-2026` (ou outro nome de sua escolha)
   - **NÃO** marque "Initialize with README"
   - Clique em "Create repository"

2. **Execute os comandos:**
   ```bash
   git remote add origin https://github.com/SEU-USUARIO/painel-2026.git
   git branch -M main
   git push -u origin main
   ```

   (Substitua `SEU-USUARIO` pelo seu usuário do GitHub)

## Método 2: Usando o Script

Execute o script interativo:
```bash
./push-to-github.sh
```

## Método 3: Via GitHub Desktop

1. Abra o GitHub Desktop
2. File > Add Local Repository
3. Selecione a pasta `/Users/prospere/Desktop/virada2026`
4. Publish repository

## ⚠️ Importante

- O arquivo `.env.local` com sua chave da OpenAI **NÃO** será enviado (está no .gitignore)
- Certifique-se de criar um arquivo `.env.example` no GitHub para outros desenvolvedores
