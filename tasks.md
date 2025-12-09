# Project Tasks

## Phase 0: Repository & Project Preparation

- [ ] GitHub / Git Management Setup
- [ ] Monorepo Structure Consideration (e.g., turbo repo)
  - `apps/web` (Next.js)
  - `apps/mobile` (React Native)
  - `apps/unity` (Unity Project can be separate)
  - `packages/shared` (For sharing types/domain logic) _If spare time_
- [ ] Common Coding Style (ESLint / Prettier / TypeScript Settings)

---

## Phase 1: Backend (Next.js API + Supabase + Auth)

- [ ] Create Supabase Project (Postgres)
- [ ] Schema Definition for Drizzle
  - [ ] `users` table (Profile Info)
  - [ ] `user_settings` table (App Settings)
  - [ ] `character_states` table (User-specific Character Personality State)
  - [ ] `chat_logs` table (Conversation Logs or Summary)
- [ ] Drizzle + Supabase Connection Settings
- [ ] Better Auth Introduction
  - [ ] Email/Password or OAuth (Decide which to use)
  - [ ] Session Management (Cookie-based)
- [ ] API Route Design (Next.js Route Handlers)
  - [ ] `/api/auth/*` Authentication
  - [ ] `/api/profile` User Profile Get / Update
  - [ ] `/api/chat` Character Conversation Endpoint
    - Input: UserID, Message, Context Info
    - Process: Get User Info & Character State from DB → Query OpenAI → Save Response
  - [ ] `/api/tts` Voice Generation
  - [ ] `/api/stt` Voice → Text (If necessary)
- [ ] "Character Personality Drift" Logic Foundation
  - [ ] Function to update `character_states` based on conversation result
  - [ ] Mechanism to reflect character state in OpenAI Prompt
- [ ] Add Service Layer Tests with Vitest

---

## Phase 2: Web UI (Next.js)

- [ ] Create Next.js Project (App Router, TypeScript)
- [ ] Tailwind / shadcn/ui Setup
- [ ] Page Structure
  - [ ] `/` Landing
  - [ ] `/login` / `/signup`
  - [ ] `/chat` Chat + 3D Embedding
  - [ ] `/settings` User Profile / Settings Edit
- [ ] Chat Component
  - [ ] Text Input
  - [ ] History Display
  - [ ] Coordinate with API `/api/chat`
- [ ] User Settings Screen
  - [ ] DOB / Gender / Hometown / Current Residence / Hobbies etc.
  - [ ] Call API `/api/profile` on Save
- [ ] Unity WebGL Embedding
  - [ ] Place Unity Build in public
  - [ ] Display via iframe or custom wrapper component
  - [ ] Design Message Coordination between Web ↔ Unity (postMessage etc.)
- [ ] Add UI Component Tests with Vitest + Testing Library

---

## Phase 3: Mobile UI (React Native)

- [ ] Create React Native Project (Expo if needed)
- [ ] Navigation Structure
  - [ ] Auth Stack (Login / Signup)
  - [ ] Main Stack (Chat / Settings / 3D Screen)
- [ ] API Client
  - [ ] Implement fetch client to call Next.js API
- [ ] Chat Screen
  - [ ] Use same `/api/chat` as Web
- [ ] Settings Screen
  - [ ] Coordinate with `/api/profile`
- [ ] Minimum Logic Tests with Vitest or Jest (Optional)

---

## Phase 4: Unity (3D Character) Foundation

- [ ] Create Unity Project
- [ ] Import Model exported from VRoid
- [ ] Lip-sync / Expression Animation Control
  - [ ] Simple Lip-sync from Audio Waveform or Text
- [ ] Animation State (Idle / Talking / Emotion) Implementation
- [ ] WebGL Build Pipeline
  - [ ] Organize WebGL Build Output Destination (Next.js public etc.)
  - [ ] Message API with Browser (JavaScript ↔ Unity)

---

## Phase 5: Unity × Mobile Coordination

- [ ] iOS / Android Build Settings
- [ ] Coordination Design with React Native
  - [ ] Plan to integrate via Unity as a Library
  - [ ] Message Transmission from RN to Unity (Lines / Animation Specification)
  - [ ] Event Transmission from Unity to RN (Conversation Completion Notification etc.)

---

## Phase 6: Personalization Logic Enhancement

- [ ] Create Conversation Log Summary periodically
- [ ] Data Model Design representing "Relationship between User and Character"
  - e.g., Intimacy Score / Frequent Topics / Character Tone Fine-tuning Parameters
- [ ] OpenAI Prompt Design
  - [ ] Pass Base Personality + Individual Difference Parameters + Recent Conversation Summary
  - [ ] Document rules for "Similar to long-term relationship" image
- [ ] Personality Drift Test (Vitest + Snapshot etc.)

---

## Phase 7: Test / Deploy / Operation

- [ ] Unit Test (Vitest) Setup
- [ ] E2E Test (Playwright etc. if spare time)
- [ ] Production Deployment to Vercel
- [ ] Environment Variable Management (OpenAI Key / Supabase URL & Key / Auth Secrets)
- [ ] Log / Monitoring (Vercel Analytics, Supabase logs etc.)
