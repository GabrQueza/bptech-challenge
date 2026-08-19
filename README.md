# BPTech Challenge - Sistema de Reserva de Salas

Um sistema corporativo completo de agendamento e reserva de salas, englobando uma API construída com Node.js (NestJS) e uma interface de usuário rica, responsiva e elegante desenvolvida em React com Chakra UI v2.

O escopo da aplicação atende 100% dos requisitos propostos: autenticação via JWT, criptografia de senhas com bcrypt, proteção contra vulnerabilidades via Helmet e um CRUD protegido de reservas contendo validação estrita de horários (impedindo reservas no passado, duração mínima de 1 hora e bloqueio total de sobreposições de horários).

## 🚀 Setup e Inicialização

### 1. Configurando o Backend (API)
Abra um terminal, navegue até o diretório `backend` e execute:

```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```
A API rodará localmente na porta 3000 (`http://localhost:3000`).

### 2. Configurando o Frontend (Interface)
Abra um **novo** terminal, navegue até a pasta `frontend` e execute:

```bash
cd frontend
npm install
npm run dev
```
A aplicação abrirá no endereço local fornecido pelo Vite (`http://localhost:5173`).

---

## 🧪 Suíte de Testes (Unitários e E2E)

A aplicação possui altíssima confiabilidade validada através de testes rigorosos com Jest e Supertest. Foram testados todos os cenários limites: criação com sucesso, tentativas de sobreposição (HTTP 409), datas retroativas (HTTP 400) e tentativas não autorizadas (HTTP 401).

Para rodar os **Testes Unitários** no backend:
```bash
npm run test
```

Para rodar os **Testes de Integração (E2E)** simulando chamadas HTTP reais:
```bash
npm run test:e2e
```

---

## 🏗️ Decisões de Arquitetura e Trade-offs

Ao longo do desenvolvimento, escolhas arquiteturais foram feitas priorizando a entrega eficiente de valor (MVP) sem comprometer a escalabilidade futura. A seguir justificamos as principais direções tomadas:

### Banco de Dados (SQLite vs Docker/Postgres)
**Decisão:** Optou-se pela utilização do SQLite local em detrimento de uma arquitetura baseada em containers Docker (com Postgres ou MySQL).
**Justificativa:** O foco primário do desafio é a validação de lógicas de negócio e da segurança da API. O SQLite cumpre perfeitamente o requisito de persistência relacional com o Prisma ORM, removendo todo o atrito (fricção) da infraestrutura para os avaliadores. A aplicação torna-se "plug and play". Migrar para um banco mais robusto exigiria apenas uma alteração em uma única linha no `schema.prisma`.

### Autenticação (JWT Local vs IAM Externo)
**Decisão:** Utilização do `@nestjs/jwt` e `bcrypt` gerando Tokens localmente ao invés de usar um provedor externo de Identidade (como AWS Cognito, Auth0 ou Keycloak).
**Justificativa:** Novamente, a simplicidade de setup do avaliador foi priorizada. O JWT local valida a proficiência na manipulação de autenticação (Hash/Salt, Guards, Tokens). Graças ao acoplamento com a camada abstrata do `Passport` no NestJS, escalar esta aplicação futuramente para um IAM corporativo robusto (OAuth2) não envolveria reescrever os controladores, apenas a implementação da estratégia do Passport.

### Componentização do Front-end
**Decisão:** A tela de `DashboardPage` concentra múltiplas responsabilidades de marcação (Modais, Tabelas, Filtros) em um mesmo arquivo, diferentemente de uma micro-componentização rígida.
**Justificativa:** A fragmentação prematura (overengineering) geraria uma camada densa de passagem de estados via `prop drilling` (ou a inserção imediata de ferramentas complexas como Redux/Zustand), o que diminuiria a velocidade da entrega de um MVP conciso. Apesar de extensa, a página se manteve legível e as lógicas bem segmentadas. Numa aplicação real em crescimento contínuo, a extração de um `<ReservationTable />` e um `<ActionModals />` seria um refatoramento orgânico agendado.

### UI Library: Chakra UI v2
**Decisão:** Uso do Chakra UI v2.
**Justificativa:** O Chakra UI foi escolhido especificamente por oferecer um desenvolvimento absurdamente focado em produtividade e acessibilidade. A documentação do v2 é excepcional. Ao ser comparado com o Material UI (MUI), ele oferece uma curva de personalização muito mais amigável, e, em comparação com o Tailwind CSS, ele já entrega componentes completos e acessíveis prontos para o uso, garantindo extrema velocidade para construção de layouts modernos e consistentes.
