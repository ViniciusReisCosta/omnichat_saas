# Backend Production Notes

The old monolithic Next.js API prompt was removed because the project now uses a separate backend.

Current architecture:

- Frontend: this Next.js repository.
- Backend: `D:\nodeprojects\omnichat_backend`.
- API runtime variable in the frontend: `NEXT_PUBLIC_API_URL`.
- Backend stack: NestJS, TypeORM, PostgreSQL.
- Backend CORS variable: `FRONTEND_ORIGIN`.
- Seed data must remain structural only: plans, channel types, and super admin.

