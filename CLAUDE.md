  # CLAUDE.md                                                                                                                                                                            
                                                                                                                                                                                         
  This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.                                                                                 
                                                                                                                                                                                         
  ## What This Is                                                                                                                                                                        
                                                                                                                                                                                       
  A **tinnitus habituation app** — a structured 12-week cognitive-behavioral therapy program for tinnitus patients. Users work through weekly chapters with exercises (ABC cognitive     
  restructuring, exposure ladders, mindfulness, daily distress logging) and track their progress over time.
                                                                                                                                                                                         
  ## Architecture                                                                                                                                                                      
                                                                                                                                                                                       
  | Layer | Stack | Location |                                                                                                                                                           
  |-------|-------|----------|
  | **Frontend** | React Native + Expo SDK 54, expo-router (file-based routing), Zustand for state | `frontend/` |                                                                       
  | **Backend** | FastAPI (Python), Pydantic models, async Motor driver | `backend/server.py` (single file) |                                                                            
  | **Database** | MongoDB (via Motor async client) | configured via `MONGO_URL` and `DB_NAME` env vars in `backend/.env` |                                                            
  | **Deployment** | Emergent Agent cloud (see `.emergent/emergent.yml`) | — |                                                                                                           
                                                                                                                                                                                       
  ### Key architectural decisions                                                                                                                                                        
                                                                                                                                                                                       
  - **No auth** — users are identified by `device_id` (stored in AsyncStorage), not accounts                                                                                             
  - **All state management** lives in a single Zustand store: `frontend/src/store/useAppStore.ts`
  - **All type definitions** are in `frontend/src/types/index.ts` — backend Pydantic models and frontend TS interfaces must stay in sync manually                                        
  - **All API models + routes** live in `backend/server.py` (monolith) — Pydantic models at the top, routes below, all under `/api` prefix                                               
  - **Program content** (chapters, weeks, exercises) is static data in `frontend/src/data/programContent.ts`                                                                           
  - **Path alias:** `@/*` maps to `frontend/*` (not `frontend/src/*`)                                                                                                                    
                                                                                                                                                                                       
  ### Frontend routing (expo-router)                                                                                                                                                     
                                                                                                                                                                                       
  - `app/(tabs)/` — bottom tab navigator: home (`index`), progress, tools, emergency                                                                                                     
  - `app/chapter/[id].tsx` — individual chapter view (dynamic route)
  - `app/program/index.tsx` — full program overview                                                                                                                                      
                                                                                                                                                                                       
  ## Commands                                                                                                                                                                          

  ```bash
  # Frontend (run from frontend/)
  yarn install              # Install dependencies (uses Yarn 1.x)
  npx expo start            # Start dev server (Expo Go / dev build)                                                                                                                     
  npx expo start --android  # Android emulator                                                                                                                                           
  npx expo start --web      # Web browser                                                                                                                                                
  npx expo lint             # ESLint                                                                                                                                                     
                                                                                                                                                                                         
  # Backend (run from backend/)                                                                                                                                                        
  pip install -r requirements.txt                                                                                                                                                        
  uvicorn server:app --reload         # Start dev server
  python -m pytest ../backend_test.py # Run API integration tests (requires running server)
  ```

  ## API Endpoints

  All routes are prefixed with `/api`. Key resource collections:

  | Endpoint prefix | MongoDB collection | Purpose |
  |---|---|---|
  | `/progress` | `user_progress` | Week/chapter tracking, commitment |
  | `/daily-logs` | `daily_logs` | Daily distress level + reflection |
  | `/abc-records` | `abc_records` | Cognitive restructuring (situation → belief → consequence) |
  | `/exposure-ladder` | `exposure_ladders` | Graduated anxiety exposure steps |
  | `/emergency-kit` | `emergency_kit` | Crisis coping items |
  | `/factor-logs` | `factor_logs` | Aggravating factors (sleep, caffeine, stress) |
  | `/mindfulness-sessions` | `mindfulness_sessions` | Mindfulness practice logs |
  | `/questionnaire` | `questionnaire_responses` | Weekly distress questionnaire (7 items, 0–4 scale) |
  | `/settings` | `user_settings` | Reminder prefs, sound masking |

  ## Conventions

  - **Spanish** for all user-facing strings and UI labels (capítulo, ejercicio, nivel de estrés…)
  - **English** for code identifiers
  - Backend env vars: `MONGO_URL`, `DB_NAME` (loaded from `backend/.env`)
  - Frontend env var: `EXPO_PUBLIC_BACKEND_URL` (API base URL)
