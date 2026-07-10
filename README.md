# vinaPBX

Plataforma PBX moderna e de código aberto para gerenciamento de comunicações VoIP, oferecendo suporte a SIP, ramais, roteamento de chamadas, IVR, filas e administração em tempo real.

## Visão geral

O **vinaPBX** é um projeto focado em entregar uma central telefônica IP moderna, flexível e acessível. A proposta é simplificar a operação de ambientes de comunicação empresarial com recursos típicos de PBX, combinando uma interface web moderna com backend escalável.

A plataforma foi pensada para atender desde pequenos ambientes até operações com maior volume de chamadas, mantendo uma base aberta para evolução contínua pela comunidade.

## Principais funcionalidades

- ✅ Gerenciamento de contas SIP
- ✅ Criação e administração de ramais
- ✅ Roteamento inteligente de chamadas
- ✅ URA/IVR (Unidade de Resposta Audível)
- ✅ Filas de atendimento
- ✅ Painel de administração em tempo real
- ✅ Estrutura orientada a APIs para integrações

## Stack e composição do projeto

Com base na composição atual do repositório:

- **TypeScript (~93,7%)**: base principal da aplicação
- **CSS (~3,7%)**: estilização da interface
- **MDX (~2,6%)**: documentação e conteúdo técnico

## Arquitetura (alto nível)

Embora a estrutura possa evoluir, a proposta do projeto é organizada em camadas:

1. **Interface Web/Admin**
   - Gestão operacional de telefonia
   - Configurações de ramais, rotas, filas e IVR

2. **Camada de aplicação (API/serviços)**
   - Regras de negócio da PBX
   - Orquestração de chamadas e entidades de comunicação

3. **Integrações de telefonia**
   - Interoperabilidade SIP
   - Conexão com infraestrutura VoIP/operadoras

## Casos de uso comuns

- Configurar ramais para equipes internas
- Criar fluxos de atendimento com IVR
- Direcionar chamadas por horário, fila ou departamento
- Monitorar operação de atendimento em tempo real
- Integrar recursos de telefonia com sistemas internos

## Como começar

> **Observação:** esta seção pode variar conforme a estrutura atual do repositório (monorepo, frontend/backend separados, etc.).

### 1) Pré-requisitos

- Node.js (versão LTS recomendada)
- npm, yarn ou pnpm
- Ambiente SIP/VoIP para testes (opcional, dependendo do escopo)

### 2) Instalação

```bash
# clone o repositório
git clone https://github.com/mr-body/vinaPBX.git

# acesse a pasta
cd vinaPBX

# instale as dependências
npm install
```

### 3) Execução local

```bash
npm run dev
```

### 4) Build para produção

```bash
npm run build
npm run start
```

> Se o projeto usar scripts diferentes, ajuste os comandos acima de acordo com o `package.json`.

## Estrutura sugerida de configuração

Crie um arquivo `.env` com as variáveis necessárias para o ambiente local (ex.: portas, endpoints de serviços, credenciais SIP de homologação, etc.).

Exemplo genérico:

```env
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000
```

## Boas práticas de contribuição

Contribuições são bem-vindas! Para colaborar:

1. Faça um fork do repositório
2. Crie uma branch para sua feature/correção
3. Abra um Pull Request com descrição clara
4. Inclua contexto técnico e evidências de teste

## Roadmap (proposta)

- [ ] Melhorias de observabilidade e métricas de chamadas
- [ ] Templates avançados de IVR
- [ ] Regras de roteamento por SLA
- [ ] Integrações adicionais com CRMs/Helpdesks
- [ ] Hardening de segurança para ambientes multi-tenant

## Licença

Defina aqui a licença oficial do projeto (ex.: MIT, Apache-2.0, GPL-3.0).

---

Se você quiser, eu também posso preparar uma versão mais curta para perfil comercial e outra mais técnica para contribuidores.