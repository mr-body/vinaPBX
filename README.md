# vinaPBX

**vinaPBX** é uma plataforma PBX moderna, open source, focada em **observabilidade e gerenciamento de ambientes Asterisk/VoIP**.  
O projeto fornece uma UI para reduzir a complexidade operacional do dia a dia (a “dor de cabeça” de operar PBX em produção), usando **ARI (Asterisk REST Interface)** como tecnologia principal.

---

## 🎯 Objetivo do projeto

O vinaPBX foi criado para facilitar:

- administração de ambientes Asterisk;
- monitoramento de eventos e fluxo de chamadas em tempo real;
- visão operacional de ramais, filas, IVR e roteamento;
- centralização da operação VoIP numa interface web moderna.

Em vez de depender apenas de CLI/logs dispersos, a ideia é ter **visibilidade e controle** em uma camada de UI integrada ao ecossistema Asterisk.

---

## 🧱 Arquitetura (visão geral)

A arquitetura atual segue o modelo:

1. **UI Web (React + TanStack Start)**  
   Camada de apresentação e interação do operador/admin.

2. **Integração com Asterisk via ARI**  
   Cliente ARI consumindo a API do Asterisk:
   - `http://localhost:8088/ari`

3. **Persistência local com SQLite (via Prisma)**  
   Armazena dados operacionais e de aplicação com baixo overhead de infraestrutura.

4. **Camada de autenticação**  
   Baseada em Better Auth.

---

## 🛠️ Stack técnica

### Linguagens (composição do repositório)
- **TypeScript** (~93.7%)
- **CSS** (~3.7%)
- **MDX** (~2.6%)

### Frameworks e bibliotecas principais
- **React 19**
- **TanStack Start** (full-stack React app framework)
- **TanStack Router** (roteamento baseado em arquivos)
- **TanStack React Query** (cache/sincronização de dados)
- **Vite** (build/dev server)
- **Tailwind CSS v4** (estilização)
- **Prisma** + **better-sqlite3** + **@prisma/adapter-better-sqlite3** (ORM + SQLite)
- **ari-client** (integração ARI)
- **better-auth** (autenticação)
- **Storybook** (documentação e desenvolvimento de componentes)
- **Vitest + Testing Library** (testes)

---

## 📦 Dependências relevantes

Dependências chave identificadas no `package.json`:

- `@tanstack/react-start`
- `@tanstack/react-router`
- `@tanstack/react-query`
- `ari-client`
- `prisma`
- `@prisma/client`
- `better-sqlite3`
- `@prisma/adapter-better-sqlite3`
- `better-auth`
- `tailwindcss`
- `@tailwindcss/vite`
- `react` / `react-dom`
- `lucide-react`
- `class-variance-authority`, `clsx`, `tailwind-merge`

Dev tooling:

- `vitest`
- `@testing-library/react`
- `storybook` + addons (`@storybook/addon-docs`, `@storybook/addon-a11y`, etc.)
- `typescript`
- `vite`

---

## 📁 Estrutura de pastas (esperada para esta stack)

> A estrutura abaixo documenta o padrão usado por projetos TanStack Start + Prisma e serve como referência arquitetural do vinaPBX.

```text
vinaPBX/
├─ src/
│  ├─ routes/               # Rotas da aplicação (file-based routing)
│  ├─ components/           # Componentes de UI reutilizáveis
│  ├─ lib/                  # Utilitários, integrações (ARI, auth, db helpers)
│  ├─ styles.css            # Estilos globais
│  └─ ...
├─ prisma/
│  ├─ schema.prisma         # Modelagem do banco (SQLite)
│  └─ migrations/           # Histórico de migrações
├─ .env.local               # Variáveis locais de ambiente
├─ package.json             # Scripts e dependências
├─ vite.config.ts           # Configuração do Vite
├─ tsconfig.json            # Configuração TypeScript
└─ README.md
```

Se quiser, eu posso te entregar uma **segunda versão 100% fiel ao tree real** (pasta por pasta) após mapear todos os diretórios do repo.

---

## ▶️ Como rodar localmente

### Pré-requisitos
- Node.js (recomendado LTS atual)
- npm
- Asterisk com ARI habilitado
- SQLite (arquivo local, via Prisma)

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```

Aplicação em:
- `http://localhost:3000`

---

## 🧪 Scripts disponíveis

Com base no projeto atual:

- `npm run dev` — inicia ambiente de desenvolvimento na porta 3000
- `npm run build` — build de produção
- `npm run preview` — preview do build
- `npm run test` — executa testes (Vitest)
- `npm run storybook` — sobe Storybook
- `npm run build-storybook` — build do Storybook
- `npm run generate-routes` — gera rotas (TanStack Router CLI)

Banco de dados (Prisma):
- `npm run db:generate`
- `npm run db:push`
- `npm run db:migrate`
- `npm run db:studio`
- `npm run db:seed`

---

## ⚙️ Configuração de ambiente

Crie um arquivo `.env.local` na raiz do projeto.

Exemplo inicial:

```env
# ARI (Asterisk REST Interface)
ASTERISK_ARI_URL=http://localhost:8088/ari
ASTERISK_ARI_USERNAME=seu_usuario_ari
ASTERISK_ARI_PASSWORD=sua_senha_ari

# Better Auth
BETTER_AUTH_SECRET=gere_um_secret_forte

# SQLite (exemplo Prisma)
DATABASE_URL="file:./dev.db"
```

> Ajuste os nomes conforme as variáveis efetivamente usadas no código.

---

## ☎️ Integração com Asterisk (ARI)

O vinaPBX utiliza ARI como núcleo de integração para observabilidade e controle operacional.

Endpoint padrão informado:
- `http://localhost:8088/ari`

Para funcionar corretamente, garanta no Asterisk:

- ARI habilitado (`ari.conf`);
- usuário/senha com permissões corretas;
- app ARI configurada conforme necessidade do seu fluxo;
- conectividade entre aplicação e instância Asterisk.

---

## 🔍 Observabilidade VoIP no vinaPBX

O foco principal da plataforma é melhorar a visibilidade do ambiente VoIP:

- eventos de chamadas;
- estado operacional de recursos;
- apoio a troubleshooting mais rápido;
- redução de tempo de diagnóstico em incidentes de telefonia.

---

## 🔐 Autenticação

O projeto usa **Better Auth**.  
Para gerar segredo:

```bash
npx -y @better-auth/cli secret
```

Defina o valor em `.env.local` como `BETTER_AUTH_SECRET`.

---

## 🧪 Qualidade e testes

- **Vitest** para testes automatizados
- **Testing Library** para testes de componentes/comportamento
- **Storybook** para documentação visual e desenvolvimento isolado de UI

---

## 🚀 Build e deploy

Build de produção:

```bash
npm run build
```

Execução do servidor gerado:

```bash
node dist/server/index.mjs
```

---

## 🗺️ Roadmap sugerido

- dashboards de métricas em tempo real;
- correlação de eventos ARI por contexto de chamada;
- trilha de auditoria operacional;
- alertas e health checks da stack de telefonia;
- RBAC/perfis avançados para operação NOC/Suporte.

---

## 🤝 Contribuição

Contribuições são bem-vindas via issues e pull requests.  
Se possível, inclua contexto técnico (cenário Asterisk/ARI, sintomas, logs e reprodução).

---

## 📄 Licença

Definir licença do projeto (MIT, Apache-2.0, etc.) se aplicável.
