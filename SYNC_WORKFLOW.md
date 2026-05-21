# Frontend ↔ Backend Sync Workflow

Source of truth: `openapi.json` (both at repo root and `Frontend/openapi.json`). Hand-written types live in `src/types/api.ts`; generated types in `src/types/api.generated.ts` serve as a drift oracle only.

---

## Tooling

| Script | Purpose |
|---|---|
| `npm run types:gen` | Regenerate `src/types/api.generated.ts` from `./openapi.json`. |
| `npm run sync:check` | Regenerate + fail if `api.generated.ts` differs from committed baseline. |

`api.generated.ts` is the **diff oracle**. The app imports from `api.ts`. Do not import the generated file in app code.

---

## Per-screen checklist

Apply for each Figma screen iteration.

1. **Drift gate.** Run `npm run sync:check`. On failure, read the regenerated `api.generated.ts` for the affected schemas — those are canonical.
2. **Endpoint inventory.** From the mapping table, list every OpenAPI path the screen consumes.
3. **Type verify.** Compare each response schema in `api.generated.ts` against `src/types/api.ts`. Note added / removed / renamed / retyped fields. Update only the affected slice of `api.ts`.
4. **Hook verify.** Confirm `src/hooks/useX.ts` covers each path: queryKey conventions, params shape, envelope unwrap (`{ success, data, meta? }`), `invalidateQueries` on mutations.
5. **Page/component verify.** Props, `zod` schemas, table columns, modal payloads align with types.
6. **State coverage.** Loading skeleton, error toast, empty state, 401 → `/login?reason=session_expired`, 422 → field-level errors, 403 → `/unauthorized`.
7. **i18n keys.** Every Figma string exists under the screen's namespace in `messages/en.json` and `messages/ru.json`.
8. **Figma pixel-match.** Spacing, color tokens (`src/styles/tokens.css`), typography, Radix variants.
9. **Test.** One MSW + RTL test for the happy path of the most important interaction.

---

## Mapping — Figma screen → OpenAPI paths → Hook

| # | Figma screen | OpenAPI paths | Hook |
|---|---|---|---|
| 1 | Login | `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh` | useAuth |
| 2 | Forgot / Reset password | `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password` | useAuth |
| 3 | Dashboard (Панель управления) | `GET /api/v1/reports/overview`, `GET /api/v1/notifications/unread-count`, `GET /api/v1/appointments` | useReports, useNotifications, useAppointments |
| 4 | Students grid (Студенты) ⭐ | `GET /api/v1/students`, `POST /api/v1/ADVISER/students/invite`, `DELETE /api/v1/students/{id}` | useStudents |
| 5 | Student profile | `GET /api/v1/students/{id}`, `GET /api/v1/students/{id}/tasks`, `GET /api/v1/students/{id}/enrollments` | useStudents, useTasks, useEnrollments |
| 6 | Student documents | `GET/POST/DELETE /api/v1/students/{id}/documents` | useStudents |
| 7 | Student roadmaps | `GET /api/v1/students/{id}/roadmaps`, `POST /api/v1/roadmaps/{id}/assign` | useRoadmaps |
| 8 | Create Task modal | `POST /api/v1/students/{id}/tasks`, `GET /api/v1/students` | useTasks, useStudents |
| 9 | Tasks list | `GET /api/v1/tasks`, `PATCH /api/v1/tasks/{id}/status`, `GET /api/v1/students/{id}/tasks/stats` | useTasks |
| 10 | Appointments | `GET/POST /api/v1/appointments`, `GET /api/v1/appointments/slots`, `PATCH /api/v1/appointments/{id}/cancel`/`complete` | useAppointments |
| 11 | Calendar / Записи | `GET/POST /api/v1/calendar`, `POST /api/v1/news/{id}/add-to-calendar` | useCalendar, useNews |
| 12 | Chat (Личные сообщения) | `GET /api/v1/messages/conversations`, `GET /api/v1/messages/conversations/{id}/messages`, message POST + image upload, broadcast | useMessages |
| 13 | University catalog (Каталог вузов) | `GET /api/v1/universities` | useUniversities |
| 14 | University detail | `GET /api/v1/universities/{id}`, programs CRUD, logo/cover upload | useUniversities |
| 15 | Applications list (Список заявок) | `GET /api/v1/universities/{id}/enrollments` | useEnrollments |
| 16 | News list (Новости) | `GET /api/v1/news` | useNews |
| 17 | News editor | `POST/PUT/DELETE /api/v1/news`, `POST /api/v1/news/{id}/cover` | useNews |
| 18 | Profile / Settings | `GET/PUT /api/v1/users/me`, avatar, notification-settings, `POST /api/v1/auth/change-password` | useProfile, useAuth |

⭐ = Reference iteration screen.

---

## Reusable prompt

Paste with a Figma screenshot:

```
Sync Figma screen <NAME> with the backend.

Read first:
- openapi.json (source of truth)
- Frontend/CLAUDE.md
- Frontend/SYNC_WORKFLOW.md

Steps:
1. Run `npm run sync:check`. If drift, treat api.generated.ts as canonical for the affected schemas.
2. From the mapping table, list the OpenAPI paths this screen consumes.
3. For each path, verify and update only the relevant slice of:
   - src/types/api.ts (hand-written)
   - src/hooks/useX.ts
   - src/components/<feature>/*
   - src/app/(ADVISER)/<feature>/page.tsx (or (auth) for auth screens)
4. Walk the per-screen checklist (1-9 above).
5. Add/update one MSW + RTL test for the happy path.
6. Output: files changed, drift items closed, any remaining backend gaps.

Figma reference: [attached]
```

---

## Changelog

Append a one-liner per iteration: `YYYY-MM-DD — <Screen> — drift closed: <summary>`.

- 2026-05-17 — Tooling bootstrap: added `openapi-typescript`, `types:gen`, `sync:check`. Baseline `api.generated.ts` committed.
- 2026-05-17 — Students grid (⭐ reference) — drift closed: Added `students.*` i18n namespace to `messages/en.json` + `messages/ru.json` (46 keys). Converted hard-coded strings in `page.tsx`, `StudentFilters.tsx`, `StudentTable.tsx`, `InviteModal.tsx` to `useTranslations('students')`. Updated `StudentsPage.test.tsx` (mock next-intl). Types: `StudentListItem`, `InviteStudentRequest`, `StudentListParams`, `PaginatedStudents` all in sync with OpenAPI — no drift. Hooks: `useStudents`/`useInviteStudent`/`useDeleteStudent` cover all 4 endpoints. States: loading/empty/error already implemented. **Deferred:** UI rework table → card grid (Figma shows 4-column card grid with progress bars + action buttons; current impl is a data table — separate UI iteration needed).
- 2026-05-17 — Calendar / Chat / University catalog (screens #11–13) — drift closed: `CalendarEventOut` — 4 fields (`description`, `end_time`, `source_id`, `source_type`) changed from optional to required-nullable. `SendMessageRequest.body` changed from optional to required `string` (matching OpenAPI spec). `BroadcastRequest.body` left optional (image-broadcast path legitimately omits body). `add-to-calendar` hook already exists in `useNews.ts`. `UniversityOut`, `ConversationOut`, `MessageOut` all clean. Added `CalendarPage.test.tsx` (4 tests). 75 tests passing.
- 2026-05-17 — Appointments (screen #10) — drift closed: `AppointmentOut` gained `consultation_type: ConsultationType` from mobile gap fix; `BookRequest` gained optional `consultation_type`; added `ConsultationType = 'video' | 'audio' | 'chat'` type. Updated `AppointmentCard.test.tsx` fixture. Added `AppointmentDashboard.test.tsx` (3 tests: happy path, slots tab, empty state). All hooks cover the 4 screen endpoints. 71 tests passing.
- 2026-05-17 — Create Task modal + Tasks list (screens #8–9) — drift closed: Added `TaskType = 'deadline' | 'assignment'`; `TaskOut.task_type` narrowed from `string` to `TaskType`; `TaskCreate` and `TaskUpdate` each gained 5 fields (`task_type`, `time_from`, `time_to`, `location`, `reminder_minutes`). Added `TaskStatsOut` type and `useStudentTaskStats` hook for `GET /students/{id}/tasks/stats`. Added `TasksPage.test.tsx` (3 tests: initial state, task list after selection, empty state). 68 tests passing.
- 2026-05-17 — Student roadmaps (screen #7) — drift closed: `RoadmapOut.description` and `target_type` changed from optional to required-nullable to match OpenAPI spec. `StudentRoadmapOut` and both hooks (`useStudentRoadmaps`, `useAssignRoadmap`) are clean. Added `StudentRoadmaps.test.tsx` (3 tests). 65 tests passing.
- 2026-05-17 — Student documents (screen #6) — drift closed: `DocumentOut` gained 3 required fields from mobile gap fix (`category`, `status`, `expires_at`); added `DocumentCategory` and `DocumentStatus` union types. `DocumentUploadResponse` gained `category` and `status`. Hooks (`useStudentDocuments`, `useUploadDocument`, `useDeleteDocument`) correct. Added `StudentDocuments.test.tsx` (4 tests). 62 tests passing.
- 2026-05-17 — Student profile (screens #5) — drift closed: `TaskOut` gained 5 required fields from mobile gap fix (`task_type`, `time_from`, `time_to`, `location`, `reminder_minutes`). `ProfileOut` and `ProfileUpdate` gained 7 fields (`phone`, `gender`, `birth_date`, `school_name`, `degree_level`, `target_countries`, `budget_max`). Hooks `useStudent`, `useStudentTasks`, `useStudentEnrollments` all cover the 3 screen endpoints. Added `StudentOverview.test.tsx` (3 tests: happy path, loading, not-found). 58 tests passing.
- 2026-05-17 — Dashboard (Панель управления) — drift closed: `NotificationOut.body` changed from optional (`body?: string | null`) to required nullable (`body: string | null`) to match OpenAPI spec. **Backend gap documented:** `OverviewReport.total_budget_usd` is used in the page and in `api.ts` but absent from `openapi.json` — backend needs to add the field to the spec. Hooks (`useOverviewReport`, `useStudents`), states (loading/empty), and 13 dashboard tests all confirmed green. **Deferred:** i18n wiring for `dashboard/page.tsx` — existing `dashboard.*` keys in JSON don't match the metric labels used in the page; requires adding ~15 new keys and updating all 13 test assertions (separate iteration).
- 2026-05-18 — University detail + Applications list (screens #14–15) — drift closed: `UniversityOut`, `UniversityProgramOut`, `EnrollmentWithStudentOut` all clean — no drift. All hooks (`useUniversity`, `useUpdateUniversity`, `useCreateProgram`, `useDeleteProgram`, `useUploadLogo`, `useUploadCover`, `useUniversityEnrollments`, `useUpdateEnrollment`) already implemented and cover all screen paths. Added `UniversityDetailPage.test.tsx` (3 tests: header render, programs tab, empty enrollments state). 84 tests passing.
- 2026-05-18 — News list + News editor (screens #16–17) — drift closed: `NewsOut`, `NewsCreate`, `NewsUpdate`, `AddToCalendarRequest` all clean — no drift. Hooks (`useNews`, `useCreateNews`, `useUpdateNews`, `useDeleteNews`, `useToggleNewsPublished`, `useUploadNewsCover`, `useAddNewsToCalendar`) cover all 4 OpenAPI paths. Added `NewsPage.test.tsx` (3 tests: news cards, empty state, create form toggle). 84 tests passing.
- 2026-05-18 — Profile / Settings (screen #18) — drift closed: `NotificationOut.read_at`, `source_id`, `source_type` changed from optional to required-nullable to match OpenAPI spec. Added `NotificationSettingsOut` (8 required booleans) and `NotificationSettingsUpdate` (8 optional-nullable booleans) — both were completely missing from `api.ts`. Added `notificationSettings` query key. Added `useNotificationSettings` and `useUpdateNotificationSettings` hooks to `useProfile.ts` covering `GET/PUT /api/v1/users/me/notification-settings`. Auth hooks (`useMe`, `useUpdateMe`, `useUploadAvatar`, `useChangePassword`) already cover `GET/PUT /users/me` and avatar. Added `SettingsPage.test.tsx` (3 tests: profile + security sections render, avatar upload, password mismatch validation). 84 tests passing.
- 2026-05-18 — Dashboard i18n (deferred from screen #3) — closed: Replaced all 21 hard-coded Russian strings in `dashboard/page.tsx` with `useTranslations('dashboard')` calls. Replaced stale `dashboard` namespace in `messages/en.json` and `messages/ru.json` with 24 accurate keys matching actual page strings (including interpolated `courseYear: "{year}-й курс"` and `forPeriod`). Added `vi.mock('next-intl', ...)` fake-translation mock to `dashboard.test.tsx` (maps keys → Russian strings) — all 13 existing assertions pass unchanged. 84 tests passing.
- 2026-05-18 — Students UI rework (deferred from screen #4) — closed: Replaced `StudentTable` (data table) with a card-grid layout matching Figma. Created `StudentCard.tsx` (avatar + name + course/group badges + task progress bar + GPA/IELTS/SAT stats row + unread badge + view/delete actions) and `StudentGrid.tsx` (CSS `auto-fill minmax(240px,1fr)` grid). Updated `students/page.tsx` to import `StudentGrid`. Updated `StudentsPage.test.tsx` mock from `StudentTable` → `StudentGrid`. 84 tests passing.
