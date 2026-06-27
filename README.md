# AG Directory Manager - Samba4 AD Web Console

Sistema Web moderno para administração de Samba 4 Active Directory (AD DC), substituindo o ADUC (Active Directory Users and Computers) com uma interface centralizada, segura e baseada em navegador.

---

## 1. Objetivo

Criar uma aplicação Web corporativa para gerenciamento completo de um Samba 4 Active Directory, permitindo:

- Gerenciamento de usuários
- Gerenciamento de computadores
- Gerenciamento de grupos
- Gerenciamento de OUs (Organizational Units)
- Movimentação de objetos entre OUs
- Reset e alteração de senhas
- Controle de permissões por perfil (RBAC)
- Auditoria completa de ações

A aplicação será instalada no mesmo servidor do Samba AD DC.

---

## 2. Stack Tecnológica

### Backend

- Node.js 22+
- NestJS (arquitetura modular)
- TypeScript
- LDAPJS (integração LDAP)
- `child_process` (execução do `samba-tool`)
- Prisma ORM
- SQLite (configuração e RBAC)
- JWT Authentication
- Socket.IO (tempo real)
- Swagger (documentação API)
- Winston (logs)

### Frontend

- React 18+
- TypeScript
- Vite
- TailwindCSS
- Shadcn/UI
- React Query
- Zustand
- React Router
- React Hook Form
- Zod
- React DnD (drag and drop OU)

---

## 3. Arquitetura

```text
Frontend (React)
        ↓
API Gateway (NestJS)
        ↓
┌───────────────────────┐
│                       │
LDAP (Samba AD)   samba-tool CLI
│                       │
└──────────┬────────────┘
           ↓
   Samba 4 Active Directory
```

### Princípios de arquitetura

- **Modularidade**: separação por domínios (`users`, `groups`, `ous`, `computers`, `auth`, `audit`).
- **Baixo acoplamento**: camada de aplicação desacoplada de LDAP e CLI via adapters.
- **Segurança por padrão**: autorização por perfil/permissão em todas as rotas.
- **Auditabilidade completa**: toda ação sensível gera evento de auditoria com trilha detalhada.

---

## 4. Funcionalidades (MVP + Evolução)

### 4.1 Usuários

- Listar, buscar e filtrar usuários
- Criar usuário com atributos AD básicos
- Editar usuário (nome, e-mail, descrição, status)
- Habilitar/desabilitar conta
- Resetar senha e forçar troca no próximo logon
- Mover usuário entre OUs

### 4.2 Grupos

- Criar/editar/remover grupos
- Adicionar/remover membros
- Visualizar associação usuário ↔ grupos

### 4.3 Computadores

- Listar objetos de computador
- Criar/remover conta de computador
- Mover entre OUs

### 4.4 OUs

- Criar, renomear e remover OUs
- Navegação hierárquica em árvore
- Drag and drop para mover objetos entre OUs

### 4.5 Segurança e acesso

- Login com conta administrativa do AD (fluxo seguro)
- Emissão de JWT para sessão Web
- RBAC interno para funções da plataforma (ex.: admin, operador, auditor)

### 4.6 Auditoria

- Registro de quem fez o quê, quando e de onde
- Antes/depois de atributos alterados
- Exportação de relatórios (CSV/JSON)

---

## 5. Módulos do Backend (NestJS)

### `auth`

- Login, refresh token, logout
- Guards (`JwtAuthGuard`, `PermissionsGuard`)
- Estratégias e decorators de permissão

### `directory`

- Operações LDAP genéricas
- Normalização de DN e atributos
- Tratamento de erro de diretório

### `users`

- CRUD de usuários
- Reset de senha
- Move de OU

### `groups`

- CRUD de grupos
- Gestão de membros

### `computers`

- CRUD de objetos de computador

### `ous`

- Árvore de OUs
- Movimentação de objetos

### `audit`

- Persistência de eventos em SQLite (Prisma)
- Consulta e exportação de logs

### `realtime`

- Gateway Socket.IO para eventos de atualização e auditoria

---

## 6. Modelo de dados local (SQLite / Prisma)

A base local não replica o AD. Ela armazena apenas metadados de aplicação:

- `UserProfile` (perfil interno e vínculo ao `sAMAccountName`)
- `Role`
- `Permission`
- `RolePermission`
- `ProfileRole`
- `AuditEvent`
- `AppConfig` (configurações do console)
- `Session` (sessões e refresh tokens, opcional)

---

## 7. Contratos de API (alto nível)

### Autenticação

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

### Diretório

- `GET /users`
- `POST /users`
- `PATCH /users/:id`
- `POST /users/:id/reset-password`
- `POST /users/:id/move`
- `GET /groups`
- `POST /groups`
- `POST /groups/:id/members`
- `DELETE /groups/:id/members/:memberId`
- `GET /computers`
- `POST /computers`
- `GET /ous/tree`
- `POST /ous`
- `POST /objects/:id/move`

### Auditoria

- `GET /audit/events`
- `GET /audit/events/:id`
- `GET /audit/export`

---

## 8. Frontend (React)

### Estrutura de páginas

- Login
- Dashboard
- Usuários
- Grupos
- Computadores
- Estrutura de OUs (árvore)
- Auditoria
- Administração RBAC

### Estado e dados

- **React Query**: cache e sincronização com API
- **Zustand**: estado de UI e sessão local
- **React Hook Form + Zod**: validação de formulários

### UX

- Tabelas com filtros e paginação
- Drawer/modal para edição rápida
- Notificações de sucesso/erro
- DnD para movimentação entre OUs com confirmação explícita

---

## 9. Segurança

- TLS obrigatório (proxy reverso com Nginx/Caddy)
- Credenciais nunca persistidas em texto puro
- JWT curto + refresh token rotativo
- Rate limiting em autenticação e operações sensíveis
- Logging com mascaramento de dados sensíveis
- Princípio do menor privilégio na conta de serviço AD
- Cabeçalhos de segurança (CSP, HSTS, X-Frame-Options)

---

## 10. Auditoria e observabilidade

- Logs estruturados com Winston
- Correlação por request ID
- Eventos críticos em trilha de auditoria persistente
- Health checks (`/health`, `/ready`)
- Métricas operacionais (opcional com Prometheus)

---

## 11. Implantação no servidor Samba AD DC

### Pré-requisitos

- Node.js 22+
- Acesso ao `samba-tool` no host
- Permissões adequadas para operações LDAP/AD
- Porta interna para API e frontend (via reverse proxy)

### Topologia recomendada

- `ag-directory-manager-api` (serviço systemd)
- `ag-directory-manager-web` (build estático servido por Nginx)
- Reverse proxy com TLS e autenticação segura

### Boas práticas de operação

- Backup periódico da base SQLite local
- Rotação de logs
- Atualizações controladas com rollback

---

## 12. Roadmap técnico

### Fase 1 - Fundação

- Estrutura inicial backend/frontend
- Autenticação e RBAC básico
- CRUD de usuários, grupos e OUs

### Fase 2 - Operação

- Movimentação entre OUs com DnD
- Gestão de computadores
- Auditoria avançada e exportações

### Fase 3 - Enterprise

- Fluxos de aprovação para ações críticas
- Relatórios avançados e dashboards
- Hardening de segurança e testes de carga

---

## 13. Critérios de aceite (MVP)

- Operações básicas de AD (usuários, grupos, OUs) funcionam via Web
- Reset de senha e movimentação entre OUs concluídos com sucesso
- RBAC aplicado em 100% das rotas sensíveis
- Auditoria registra todas as operações críticas
- Deploy funcional no mesmo servidor do Samba AD DC

---

## 14. Próximos passos de implementação

1. Inicializar monorepo (`apps/api`, `apps/web`, `packages/shared`)
2. Implementar módulo de autenticação e base RBAC
3. Entregar CRUD de usuários + reset de senha
4. Entregar árvore de OUs + movimentação de objetos
5. Finalizar auditoria, documentação Swagger e hardening
