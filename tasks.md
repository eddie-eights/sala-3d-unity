# Project Tasks

## Phase 0: Repository & Project Preparation

- [x] GitHub / Git Management Setup
- [x] Monorepo Structure Consideration (e.g., turbo repo)
  - `apps/web` (Next.js)
  - `apps/mobile` (React Native)
  - `apps/unity` (Unity Project can be separate)
  - `packages/shared` (For sharing types/domain logic) _If spare time_
- [x] Common Coding Style (ESLint / Prettier / TypeScript Settings)

---

## Phase 1: Backend (Next.js API + Supabase + Auth)

- [x] Create Supabase Project (Postgres)
- [x] Schema Definition for Drizzle
  - [x] `users` table (Profile Info)
  - [x] `user_settings` table (App Settings)
  - [x] `character_states` table (User-specific Character Personality State)
  - [x] `chat_logs` table (Conversation Logs or Summary)
- [x] Drizzle + Supabase Connection Settings
- [x] Better Auth Introduction
  - [x] Email/Password or OAuth (Both implemented: email/password + Google OAuth)
  - [x] Session Management (Cookie-based)
- [x] API Route Design (Next.js Route Handlers)
  - [x] `/api/auth/*` Authentication
  - [x] `/api/profile` User Profile Get / Update
  - [x] `/api/chat` Character Conversation Endpoint
    - Input: UserID, Message, Context Info
    - Process: Get User Info & Character State from DB → Query OpenAI → Save Response
  - [x] `/api/tts` Voice Generation (text-to-speech)
  - [x] `/api/stt` Voice → Text (speech-to-text)
- [ ] "Character Personality Drift" Logic Foundation
  - [ ] Function to update `character_states` based on conversation result
  - [ ] Mechanism to reflect character state in OpenAI Prompt
- [x] Add Service Layer Tests with Vitest

---

## Phase 2: Web UI (Next.js)

- [x] Create Next.js Project (App Router, TypeScript)
- [x] Tailwind / shadcn/ui Setup
- [x] Page Structure
  - [x] `/` Landing
  - [x] `/login` / `/signup`
  - [x] `/chat` Chat + 3D Embedding
  - [x] `/mypage` (added) User Profile
  - [x] `/welcome` (added) Welcome screen
- [x] Chat Component
  - [x] Text Input
  - [x] History Display
  - [x] Coordinate with API `/api/chat`
- [x] User Settings Screen
  - [x] DOB / Gender / Hometown / Current Residence / Hobbies etc.
  - [x] Call API `/api/profile` on Save
- [x] Unity WebGL Embedding
  - [x] Place Unity Build in public (`unity-build-chat`, `unity-build-welcome`)
  - [x] Display via custom wrapper component (`UnityPlayer.tsx`)
  - [x] Design Message Coordination between Web ↔ Unity (speakWithAudio, lipSync control)
- [x] Add UI Component Tests with Vitest + Testing Library

---

## Phase 3: Mobile UI (React Native)

- [x] Create React Native Project (Expo)
- [x] Navigation Structure
  - [x] Auth Stack (Login - Email/Google/Passkey UI)
  - [x] Main Stack (Chat / Settings)
- [x] API Client
  - [x] Implement fetch client to call Next.js API (`lib/api-client.ts`)
- [x] Chat Screen (Voice-first, mobile-optimized)
  - [x] 3D character area (full screen)
  - [x] Voice input button (primary)
  - [x] Text input toggle
  - [x] Chat history modal
- [x] Settings Screen
  - [x] UI implemented
- [ ] Mobile Google OAuth (requires public URL or ngrok for development)
- [x] Mobile Passkey Authentication - **Skipped** (Web only, requires development build on mobile)
- [ ] Speech-to-Text integration (expo-speech or native)
- [ ] Minimum Logic Tests with Vitest or Jest (Optional)

---

## Phase 4: Unity (3D Character) Foundation

- [x] Create Unity Project
- [x] Import Model exported from VRoid (`sala.vrm`)
- [x] Lip-sync / Expression Animation Control
  - [x] `LipSyncController.cs` - Lip-sync from Audio Waveform
- [x] Animation State (Idle / Talking / Emotion) Implementation
  - [x] `SalaCharacterController.cs`
  - [x] `VRMModel.cs`
  - [x] `AudioManager.cs`
- [x] WebGL Build Pipeline
  - [x] Organize WebGL Build Output Destination (Next.js public)
  - [x] Message API with Browser (JavaScript ↔ Unity via UnityPlayer.tsx)

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
