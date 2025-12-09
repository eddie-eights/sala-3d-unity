# Global Architecture

## 1. Overall Architecture Overview

- **Common Backend**: **Next.js (App Router)**

  - API / Auth / Character Personality Logic / User Settings Management
  - Deployed to Vercel (SSR/Edge Functions available)

- **Web Client**

  - UI: **Next.js (React, TypeScript, Tailwind, shadcn/ui)**
  - 3D: **Unity WebGL Build Embedded** (Using the same VRoid model)
  - Chat screen and user settings screen implemented on Next.js side
  - 3D area embedded via iframe or WebGL using Unity

- **Mobile App**

  - UI: **React Native**
    - Handles Chat Screen / Settings Screen / Login etc.
  - 3D: **Unity** (Assumed coordination via Unity as Library etc.)
    - Uses the same VRoid model for 3D representation
  - Backend API is common with Web (Next.js API)

- **AI Layer**

  - **OpenAI API**
    - Chat: 3D Character's conversation (Personality: Base + User-specific Custom Context)
    - TTS: Character voice output
    - STT: Voice input → Text conversion
  - Personalization
    - Save user info, conversation logs, summary to Supabase (Postgres)
    - Reflect "Relation with User & Character Fine-tuning" in prompt every conversation

- **Database / Auth**

  - **Supabase (Postgres + Auth functionality, but mainly DB this time)**
  - ORM: **Drizzle ORM**
  - Auth: **Better Auth (Successor to Auth.js)** integrated into Next.js
  - Main data to save:
    - Users: Basic Profile (DOB, Gender, Hometown, Current Address, Hobbies, etc.)
    - UserSettings: Conversation Settings / App Flags
    - CharacterState: User-specific "Character Personality Drift" (Summary + Parameters)
    - ChatLogs: Conversation Logs (Summary if needed)

- **Infrastructure / Others**
  - Hosting: **Vercel** (Next.js)
  - Supabase: Managed Postgres (DB is cloud, Docker Postgres is basicially unnecessary)
  - Testing: **Vitest** (Logic / Component Tests)
  - Docker:
    - Not mandatory, but docker-compose for necessary things only (e.g., if adding local helper services later)

---

## 2. Data Flow (Rough)

1. User logs in from Web or Mobile (Better Auth + Supabase).
2. Text or Voice input in Chat Screen.
3. Next.js API receives:
   - Loads User Profile + Conversation History Summary + Character State
   - Constructs Prompt and queries OpenAI
4. Saves response text, updates personality drift info if necessary (CharacterState).
5. Sends text to TTS, passes to Unity (3D Character) side.
6. Unity side plays lip-sync / expression animation matching received text/audio.
7. Web: Unity WebGL, Mobile: Unity Library does similar flow.

---

## 3. DB Strategy (RDB vs Key-Value)

- MVP: **Supabase (Postgres) only is OK**
  - Data with relations like User / Settings / Logs / Character Personality State → Suitable for RDB.
- Future:
  - If full-text search of conversation history or embedding search becomes necessary, consider adding Vector Store or KV Store.
