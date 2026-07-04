# Prompt Para Codex: Backend Pronto Para Producao

Use este prompt no Codex antes de publicar o backend em producao.

```text
Voce esta no projeto `omnichat_saas`, branch `main`. O app sera publicado no Railway com PostgreSQL do proprio Railway. A Hostinger sera usada apenas para DNS. O projeto e um monolito Next.js: frontend e API em `/api/*` devem continuar no mesmo dominio.

Objetivo:
Finalizar a preparacao do backend para producao sem criar um backend separado e sem rodar seed destrutivo em banco real.

Estado esperado:
- Next.js 14 App Router.
- API em `src/app/api`.
- Prisma PostgreSQL em `prisma/schema.prisma`.
- Sessao via cookie HTTP-only.
- Railway App -> Railway PostgreSQL.
- Hostinger DNS -> Railway custom domain.

Tarefas obrigatorias:
1. Validar scripts de producao no `package.json`.
   Garantir que existam:
   - `build`: `next build`
   - `start`: `next start`
   - `postinstall`: `prisma generate`
   - `db:deploy`: `prisma migrate deploy`
   - `db:bootstrap`: script nao destrutivo para criar/atualizar planos de producao
   - `prod:check-env`: valida variaveis obrigatorias
   - `prod:verify`: roda check de env, Prisma validate/generate e build

2. Nunca rodar seed em producao.
   - `db:seed` pode continuar existindo apenas para desenvolvimento/demo.
   - Confirmar que nenhum script de deploy executa `db:seed` por padrao.
   - Se houver seed no deploy, trocar por `db:bootstrap` ou remover.

3. Configurar planos reais de producao.
   - Rodar `npm run db:bootstrap` depois de `npm run db:deploy`.
   - Preencher, se Stripe estiver ativo:
     - `STRIPE_PRICE_STARTER`
     - `STRIPE_PRICE_PROFESSIONAL`
     - `STRIPE_PRICE_ENTERPRISE`
   - Confirmar que cada `Plan.stripePriceId` real existe antes de liberar checkout.

4. Validar variaveis de ambiente no Railway.
   Obrigatorias:
   - `DATABASE_URL=${{Postgres.DATABASE_URL}}`
   - `JWT_SECRET`
   - `APP_URL=https://dominio-final.com`
   - `NEXT_PUBLIC_APP_URL=https://dominio-final.com`
   Se billing estiver ativo:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_STARTER`
   - `STRIPE_PRICE_PROFESSIONAL`
   - `STRIPE_PRICE_ENTERPRISE`

5. Validar cookies e same-origin.
   - Nao adicionar CORS desnecessario.
   - Nao separar frontend/backend.
   - `APP_URL` e `NEXT_PUBLIC_APP_URL` devem ser iguais.
   - Confirmar login/logout com cookie `cber_session`.

6. Validar rotas criticas.
   Testar manualmente ou via script:
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `GET /api/auth/me`
   - `GET /api/plans`
   - `GET /api/dashboard/stats`
   - CRUD de empresas, agentes, canais e chatbot rules
   - Stripe checkout e webhook, se billing estiver ativo

7. Melhorias recomendadas antes de trafego real.
   Implementar ou abrir tarefas para:
   - Rate limit em login/register e rotas sensiveis.
   - Validacao de payload com Zod nas APIs.
   - Logs estruturados para erros de API.
   - Monitoramento do Railway e alertas de erro.
   - Politica de backup do PostgreSQL.
   - Revisao de permissoes por role.
   - Testes automatizados para auth, billing e CRUD principal.

8. Rodar verificacoes finais.
   Com variaveis reais ou equivalentes:
   - `npm run prod:check-env`
   - `npx prisma validate`
   - `npx prisma generate`
   - `npm run build`
   - `npm run db:deploy`
   - `npm run db:bootstrap`

9. Lint.
   Se `npm run lint` abrir o assistente interativo do Next.js porque ESLint nao esta configurado, nao configurar automaticamente sem decisao explicita. Reportar como pendencia.

Criterios de aceite:
- Build passa.
- Prisma validate/generate passam.
- Migrations aplicam com `db:deploy`.
- Planos existem no banco apos `db:bootstrap`.
- Seed nao roda em producao.
- Login com cookie funciona no dominio final.
- `/pricing`, `/billing` e checkout nao dependem de dados mockados.
- Documentacao explica Railway PostgreSQL e Hostinger apenas como DNS.
```
 
## Pendencias Reais Antes De Trafego Pago

- Configurar Stripe real e preencher `stripePriceId` dos planos.
- Rodar `npm run db:bootstrap` no banco Railway apos migrations.
- Testar fluxo completo de registro, pagamento, webhook e acesso ao dashboard.
- Configurar backup/restore do PostgreSQL no Railway.
- Adicionar rate limit e validacao de payload nas rotas publicas.
- Configurar observabilidade de erros e logs.
