# Tech Stack

## Frontend (Web)

- Framework: **Next.js (App Router)** + TypeScript
- UI:
  - **Tailwind CSS**
  - **shadcn/ui**
- Chat / State Management:
  - React Hooks + Context or Zustand etc. (Preference)
- Testing:
  - **Vitest** + @testing-library/react

## Mobile

- **React Native**

  - Navigation: React Navigation
  - State Management: React Query / Zustand etc.
  - Build: Expo or bare React Native (Decide separately)

- 3D:
  - **Unity** managed as a separate project
  - Coordinate with React Native via "Unity as a Library" pattern (iOS / Android)

## 3D

- **Unity**
  - Model: **VRM Model created with VRoid** (Convert if necessary)
  - Animation:
    - Setup Idle / Talk / Emotion etc.
    - Lip-sync control matching voice volume and timing
  - Build:
    - Web: WebGL
    - iOS / Android: Each platform build + Coordinate with React Native

## Backend / API

- Framework: **Next.js (App Router Route Handlers)**
- Language: TypeScript
- Auth:
  - **Better Auth** (Successor to Auth.js) + users table on Supabase
- DB / ORM:
  - **Supabase (Postgres)**
  - **Drizzle ORM**
- AI:
  - **OpenAI API**
    - Chat (3D Character Personality)
    - TTS (Voice Output)
    - STT (Voice Input → Text)
- Testing:
  - **Vitest** (API Logic, Service Layer Tests)

## Infrastructure / DevOps

- Hosting:
  - Web / API: **Vercel**
  - DB: **Supabase**
- Local Development:
  - `docker-compose` if necessary (e.g. for middleware added in future)
- Lint / Format:
  - ESLint, Prettier
- Type Check:
  - TypeScript strict mode
