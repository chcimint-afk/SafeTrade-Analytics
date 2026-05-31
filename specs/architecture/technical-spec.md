# Technical Specification: SafeTrade Analytics
## Техническая спецификация софта — Сессия 18

## 1. Technology Stack
- **Frontend Framework:** Next.js 16 (App Router) + React 19 + TypeScript.
- **Styling & CSS:** Tailwind CSS (для быстрой и адаптивной верстки) + Framer Motion (для премиальных Bloomberg-level анимаций).
- **Icons:** Lucide React.
- **Charts:** Lightweight Charts (by TradingView) — для отрисовки графиков в реальном времени.
- **Backend & Database:** Supabase (PostgreSQL) — хранение балансов, сделок и системных логов.
- **Authentication:** Supabase Auth (Email & Password).
- **Session Management:** `@supabase/ssr` — серверная синхронизация сессий через куки (Cookies).

## 2. Architecture & Data Flow
- **State Management:** React Context API (хранение баланса трейдера, сигналов и статусов автопилота).
- **Database Connection:** Инициализация Supabase-клиента через два адаптера:
  - *Browser Client (`utils/supabase/client.ts`):* для работы на клиенте (форма входа).
  - *Server Client (`utils/supabase/server.ts`):* для работы в серверных компонентах и API.
- **Signal Engine:** Клиентский скрипт, запрашивающий котировки и проверяющий условия индикаторов (RSI/EMA).
- **Persistent Storage:** Переход с локального `localStorage` на облачную синхронизацию с PostgreSQL в Supabase с включенными политиками RLS (Row Level Security).

## 3. Security & Route Protection
- **Server-Side Route Guarding (Next.js Middleware):**
  - Защита папки `/admin` и всех вложенных страниц осуществляется на уровне сервера с помощью `middleware.ts`.
  - Любой неавторизованный запрос к `/admin/*` или защищенным API-маршрутам перехватывается, и пользователь перенаправляется на `/admin/login`.
- **Environment Variables Security:**
  - Ключи доступа (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) вынесены в файл `.env.local` на этапе локальной разработки.
  - Файл `.env.local` внесен в `.gitignore` и **никогда не коммитится на GitHub**.
  - На продакшене (Vercel) ключи прописываются в настройках окружения (Vercel Environment Variables).
- **API Read-Only Philosophy:** Терминал не требует приватных API-ключей бирж с правом вывода средств, обеспечивая абсолютную защиту капитала.

---
*Created as part of Session 18. Personal & Educational project.*
