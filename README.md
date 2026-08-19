# BPTech Challenge - Sistema de Reserva de Salas

Um sistema completo de agendamento e reserva de salas, englobando uma API construída com Node.js (NestJS) e uma interface de usuário rica, responsiva e elegante desenvolvida em React com Chakra UI.

Esta aplicação permite o registro de usuários, autenticação segura (JWT) e o gerenciamento (CRUD) de reservas, garantindo regras de negócio essenciais como a proibição de conflitos de horários e validações de duração de reservas.

## 🚀 Stack Tecnológico

**Back-end:**
- [NestJS](https://nestjs.com/) - Framework Node.js progressivo para APIs eficientes e escaláveis.
- [Prisma ORM](https://www.prisma.io/) - ORM moderno para interações seguras e tipadas com o banco de dados.
- [SQLite](https://sqlite.org/index.html) - Banco de dados relacional leve e embutido (perfeito para o escopo do projeto).
- [JWT & Bcrypt](https://jwt.io/) - Autenticação segura e hash de senhas.
- [Helmet](https://helmetjs.github.io/) - Blindagem de cabeçalhos HTTP contra vulnerabilidades comuns.
- [Jest](https://jestjs.io/) - Suíte de testes unitários para confiabilidade.

**Front-end:**
- [React (Vite)](https://vitejs.dev/) - Biblioteca moderna e de altíssima performance para construção da interface.
- [Chakra UI v2](https://v2.chakra-ui.com/) - Biblioteca de componentes acessível e focada na produtividade.
- [Axios](https://axios-http.com/) - Cliente HTTP configurado com interceptadores inteligentes para gerenciamento do token JWT.
- [React Router DOM](https://reactrouter.com/) - Roteamento dinâmico no lado do cliente.

---

## 🛠️ Como Rodar o Projeto Localmente

### 1. Configurando o Backend (API)
Abra um terminal, navegue até o diretório `backend` e execute os passos abaixo:

```bash
cd backend

# Instalar as dependências
npm install

# Rodar as migrations para criar as tabelas no banco de dados SQLite
npx prisma migrate dev

# Iniciar o servidor em modo de desenvolvimento
npm run start:dev
```
A API estará rodando localmente, por padrão na porta 3000 (`http://localhost:3000`).

### 2. Configurando o Frontend (Interface)
Abra um **novo** terminal (mantenha o backend rodando), navegue até a pasta `frontend` e siga as instruções:

```bash
cd frontend

# Instalar as dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```
Acesse a aplicação no seu navegador pelo link gerado pelo Vite (geralmente `http://localhost:5173`).

---

## 🧪 Rodando os Testes Unitários

O backend conta com uma suíte de testes unitários construída com Jest. Estes testes cobrem extensivamente as regras de negócio dos *Services* de Autenticação e Reservas (como por exemplo o impedimento de sobreposição de horários e datas passadas).

Para executar, no diretório `backend`, rode:
```bash
npm run test
```

---

## 🏗️ Notas de Arquitetura e Decisões de Design (Front-end)

Ao inspecionar o código-fonte, especialmente o front-end, você notará que a página principal (`DashboardPage.tsx`) possui um tamanho considerável, abrigando múltiplos elementos (como a listagem em tabela, lógicas de formulários, modais de criação/edição e barra de filtros).

**Por que não investimos em uma micro-componentização maior?**

Esta foi uma decisão arquitetural consciente. Em uma aplicação de escopo reduzido (um desafio técnico focado em entregas precisas e agilidade), a extração prematura de subcomponentes (`<TableRows />`, `<ActionModals />`, `<FilterInputs />`) exigiria a passagem massiva de estados e funções via *prop drilling* ou demandaria a introdução precoce de um gerenciador de estados global (como Redux ou Zustand). 

A manutenção de todos esses estados coligados num mesmo contexto viabilizou um desenvolvimento mais rápido e pragmático. Por tratar-se de uma aplicação menor, essa centralização não causa um impacto perceptível na performance (rendering) ou na legibilidade imediata do que foi proposto. 

Naturalmente, num cenário de produção real em que a tela passe a ganhar mais regras de negócio, a refatoração extraindo as partes visuais para componentes mais puros e limpos seria o próximo passo orgânico.
