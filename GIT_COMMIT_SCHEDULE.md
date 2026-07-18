# 🚀 CivicPulse — Git Commit & Push Schedule

> **Agent Instruction**: This document defines the exact, ordered, feature-wise commit plan for the CivicPulse repository.
> The developer will stage the files listed under each commit, write the exact commit message provided, and push after every commit.

---

## ⚙️ Pre-Flight Checklist (Run Once Before Starting)

Before executing any commit, verify the following:

- [ ] `.env` is listed in `.gitignore` and will **not** be committed.
- [ ] `node_modules/` is listed in `.gitignore` and will **not** be committed.
- [ ] A remote named `origin` is configured pointing to `https://github.com/Shahir-09/CivicPulse`.
- [ ] The branch being pushed to is `main`.

---

## 📦 Commit Categories & File Map (Split by Dates)

The codebase delivery is organized into **2 parts**: 
1. **Part 1 (Today — 15/16 July)**: Working Citizen Portal MVP, 5-Page Pitch Deck, and Gnani.ai Real-Time Voice STT.
2. **Part 2 (Final Release — 19 July)**: Back-of-house admin panels, AI automation engines (Mem0, Claude fallbacks, Keploy test suites), and full documentation.

---

### 📅 Part 1: Today (15/16 July)

#### ✅ Commit 1 — `feat: civicpulse citizen mvp, pitch deck, and gnani.ai real-time voice`

**Files to Stage**:
```
server.ts
src/hooks/useGnaniVoice.ts
src/services/gnaniService.ts
src/pages/ReportPage.tsx
src/pages/MapPage.tsx
src/pages/CommunityPage.tsx
src/pages/LeaderboardPage.tsx
src/pages/PitchDeckPage.tsx
src/components/PitchDeck.tsx
src/config/firebase.ts
src/contexts/LanguageContext.tsx
src/contexts/AuthContext.tsx
src/App.tsx
src/index.css
src/main.tsx
src/components/Navbar.tsx
src/components/ErrorBoundary.tsx
src/components/LocalitySelect.tsx
src/components/OnboardingModal.tsx
src/components/Skeleton.tsx
src/pages/HomePage.tsx
src/pages/IssueDetailPage.tsx
src/pages/ProfilePage.tsx
.gitignore
index.html
tsconfig.json
vite.config.ts
public/favicon.svg
firestore.rules
firebase-applet-config.json
src/i18n/bn.ts
src/i18n/en.ts
src/i18n/hi.ts
src/i18n/index.ts
src/types/roles.ts
src/utils/localities.ts
src/utils/geohash.ts
src/utils/errorHandlers.ts
src/utils/logger.ts
src/utils/pointsEngine.ts
```
*(Plus all basic citizen/client UI view files. Do NOT stage any admin-only panels, Mem0 backend files, or test suites today)*

**Commit Message**:
```
feat: civicpulse citizen mvp, pitch deck, and gnani.ai real-time voice

- Citizen portal MVP: report public safety issues (potholes, streetlights, waste, water)
- Interactive MapLibre page: geohash pins mapped across Kolkata wards
- Community boards: localized neighborhood discussion feeds
- Gamification: points engine, citizen profile status badges, and leaderboard
- 5-Page Pitch Deck: interactive presentation integrated into the platform
- Gnani.ai STT: WebSocket PCM audio proxy bridging browser microphone input to wss://api.vachana.ai/stt/v3/stream
- Live fallback hierarchy: Gnani Real-Time STT -> Web Speech API -> presentation voice simulator
```

---

### 📅 Part 2: Final Release (19 July)

#### ✅ Commit 2 — `feat: admin panels and advanced AI automation (mem0, claude, keploy)`

**Files to Stage**:
```
src/pages/AdminDashboard.tsx
src/pages/SuperAdminDashboard.tsx
src/services/mem0Service.ts
src/utils/geminiRetry.ts
package.json
package-lock.json
keploy.yml
vitest.config.ts
.github/workflows/ci.yml
src/agents/AgentOrchestrator.ts
src/agents/duplicateAgent.ts
src/agents/escalationAgent.ts
src/agents/index.ts
src/agents/predictiveAgent.ts
src/agents/summaryAgent.ts
src/agents/verificationAgent.ts
src/agents/weatherAgent.ts
src/config/firebaseAdmin.ts
src/components/shared/AccessDenied.tsx
src/components/shared/RequireRole.tsx
src/pages/AdminLoginPage.tsx
src/pages/SuperAdminLoginPage.tsx
src/pages/DashboardPage.tsx
src/pages/InsightsPage.tsx
src/pages/admin/AdminAnalyticsPage.tsx
src/pages/admin/AdminAssignmentsPage.tsx
src/pages/admin/AdminComplaintsPage.tsx
src/pages/admin/AdminDashboardPage.tsx
src/pages/admin/AdminDepartmentsPage.tsx
src/pages/admin/AdminDependenciesPage.tsx
src/pages/admin/AdminEscalationDetails.tsx
src/pages/admin/AdminInspectorPage.tsx
src/pages/admin/AdminKanbanBoard.tsx
src/pages/admin/AdminLayout.tsx
src/pages/admin/AdminMapPage.tsx
src/pages/admin/AdminNotificationsPage.tsx
src/pages/admin/AdminSettingsPage.tsx
src/pages/admin/AdminWorkersPage.tsx
src/pages/admin/ProgressTimeline.tsx
src/pages/super-admin/AIMonitoringPage.tsx
src/pages/super-admin/AdminsPage.tsx
src/pages/super-admin/AllUsersPage.tsx
src/pages/super-admin/AnalyticsPage.tsx
src/pages/super-admin/AuditReportsPage.tsx
src/pages/super-admin/ConfigurationPage.tsx
src/pages/super-admin/DepartmentsPage.tsx
src/pages/super-admin/IntegrationsPage.tsx
src/pages/super-admin/MunicipalitiesPage.tsx
src/pages/super-admin/NationalMapPage.tsx
src/pages/super-admin/RolesPage.tsx
src/pages/super-admin/SettingsPage.tsx
src/pages/super-admin/SuperAdminDashboardPage.tsx
src/pages/super-admin/SuperAdminLayout.tsx
src/pages/super-admin/SystemLogsPage.tsx
src/tests/api.auth.test.ts
src/tests/api.geocode.test.ts
src/tests/api.vision.test.ts
src/tests/api.clean-voice.test.ts
src/tests/api.gnani.test.ts
src/tests/api.chat.test.ts
.env.example
src/utils/createDummyUsers.ts
src/utils/migrateToKolkata.ts
src/utils/pointsEngineAdmin.ts
src/utils/seedData.ts
src/utils/testFirebaseConnection.ts
src/utils/triggerSeed.ts
```

**Commit Message**:
```
feat: admin panels and advanced AI automation (mem0, claude, keploy)

- Admin Dashboard: inspector assignments, complaints queue, kanban resolution
- Super Admin Portal: platform governance, system log inspector, municipality management
- Mem0 SDK integration: User memory retrieval & logging for chat and summary context
- Claude fallback orchestration: Anthropic API translation within geminiRetry.ts
- Keploy integration: 6 Vitest integration test suites covering all REST/WS routes
```

#### ✅ Commit 3 — `docs: partner integration guides and readme`

**Files to Stage**:
```
README.md
GIT_COMMIT_SCHEDULE.md
docs/PARTNER_INTEGRATIONS.md
docs/KEPLOY_GUIDE.md
metadata.json
security_spec.md
assets/screenshots/community.png
assets/screenshots/dasboard.png
assets/screenshots/home.png
assets/screenshots/map.png
assets/screenshots/report.png
```

**Commit Message**:
```
docs: partner integration guides and readme

- Add docs/PARTNER_INTEGRATIONS.md for Gnani, Mem0, Claude setup
- Add docs/KEPLOY_GUIDE.md for Vitest and Keploy run instructions
- Update README.md with partner config tables and instructions
```

---

## 📅 Execution Order Summary

| Part / Date | # | Commit (short) | Developer |
|---|---|---|---|
| **Part 1 (Today)** | 1 | `feat: civicpulse citizen mvp, pitch deck, and gnani.ai real-time voice` | **You** |
| **Part 2 (19 July)** | 2 | `feat: admin panels and advanced AI automation (mem0, claude, keploy)` | **You** |
| **Part 2 (19 July)** | 3 | `docs: partner integration guides and readme` | **You** |

---

*Generated: 2026-07-16 | Project: CivicPulse | Repo: github.com/Shahir-09/CivicPulse*
