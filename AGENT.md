# AGENT.md - LibreChat Development Guide

## Build/Test/Lint Commands
- **Build Frontend:** `npm run frontend` (builds all packages + client)
- **Build Backend:** `npm run build:api` 
- **Run Tests:** `npm run test:api` (backend), `npm run test:client` (frontend)
- **Run Single Test:** `cd api && npx jest path/to/test.test.js` or `cd client && npm test -- --testPathPattern=path/to/test`
- **Lint & Format:** `npm run lint:fix`, `npm run format`
- **Dev Servers:** `npm run backend:dev` (API), `npm run frontend:dev` (client)
- **E2E Tests:** `npm run e2e`, `npm run e2e:headed` (with UI)

## Architecture & Structure
- **Monorepo:** Uses npm workspaces with `api/`, `client/`, `packages/`
- **Backend:** Express.js API in `api/` with MongoDB, optional Redis, MeiliSearch
- **Frontend:** React/Vite SPA in `client/` with TailwindCSS, Radix UI
- **Packages:** `data-provider` (API client), `data-schemas` (Mongoose models), `api` (shared utilities)
- **Databases:** MongoDB (main), PostgreSQL+PGVector (RAG), MeiliSearch (search), Redis (optional cache)
- **Key APIs:** AI models, file upload/processing, conversation management, user auth, agent system

## Code Style & Conventions
- **Formatting:** Prettier with ESLint, import sorting with `simple-import-sort`
- **TypeScript:** Strict mode, Zod for validation, proper type definitions
- **Imports:** Use `~` alias for api root, relative paths for client
- **React:** Functional components, hooks, avoid class components
- **Error Handling:** Structured error responses, proper HTTP status codes
- **Naming:** camelCase for variables/functions, PascalCase for components/types
