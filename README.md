# Sistema de Controle de Estoque 📦

Um sistema moderno e intuitivo para gerenciamento de estoque, construído com **Next.js (App Router)** e **TypeScript**. Focado em performance, acessibilidade e uma excelente experiência de usuário.

## 🚀 Funcionalidades

- **Dashboard Resumo:** Visualização rápida do total de produtos e dos últimos itens cadastrados.
- **Cadastro de Produtos:** Formulário completo com validação para adicionar novos itens ao estoque.
- **Consulta em Tempo Real:** Busca instantânea (case-insensitive) de produtos.
- **Gestão Completa (CRUD):** Edição e exclusão de produtos com modais de confirmação.
- **Feedback Visual:** Sistema de notificações (Toasts) amigáveis para ações de sucesso ou erro.
- **Design Responsivo:** Layout adaptativo para Desktop, Tablets e Mobile.
- **Acessibilidade:** Navegação por teclado, foco visível e suporte a leitores de tela com atributos ARIA.

## 💻 Tecnologias Utilizadas

- **[Next.js 14+](https://nextjs.org/)** (React framework - App Router)
- **[TypeScript](https://www.typescriptlang.org/)** (Tipagem estática)
- **CSS Modules & Variáveis Nativas** (Sem dependências externas para UI/estilização)
- **Node.js `fs`** (Armazenamento de dados local temporário em formato JSON)

## 🛠️ Como executar o projeto localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/estoque-app.git
   ```

2. Acesse o diretório do projeto:
   ```bash
   cd estoque-app
   ```

3. Instale as dependências:
   ```bash
   npm install
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Acesse no seu navegador: [http://localhost:3000](http://localhost:3000)

## ⚠️ Hospedagem na Vercel (Aviso Importante)

Este projeto foi construído utilizando um arquivo JSON local (`database/produtos.json`) para persistência de dados através do módulo `fs` do Node.js. 

**Ao hospedar na Vercel**, é importante saber que o ambiente de execução (Serverless Functions) possui um **Sistema de Arquivos Somente Leitura (Read-Only)**. Isso significa que a aplicação funcionará para *leitura* inicial, mas **ações de cadastro, edição e exclusão de produtos falharão no ambiente de produção da Vercel** porque a aplicação não terá permissão para gravar no arquivo `produtos.json`.

**Como resolver para Produção:**
Para que o sistema funcione 100% na Vercel, será necessário substituir a camada de `FileStorage` (`src/lib/fileStorage.ts`) por um banco de dados real (como Vercel Postgres, Vercel KV, Supabase, MongoDB, Firebase, etc.). Como a arquitetura do projeto foi construída seguindo o padrão Repository, você precisará alterar apenas a implementação da persistência, sem afetar a interface ou as regras de negócio!

## 📄 Licença

Este projeto está sob a licença MIT. Sinta-se livre para usá-lo e modificá-lo.
