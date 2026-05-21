# Nobal eduadviser — Frontend Implementation Plan

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · TanStack Query v5 · Zustand · React Hook Form + Zod  
**Backend:** `http://localhost:8000` · OpenAPI 3.1.0 (107 KB spec, полностью изучен)  
**Design:** Figma `V89xlk3ttsGTDx7m3ea661`

---

## Open Questions

> [!IMPORTANT]
> **Figma-доступ:** Ссылка на Figma требует входа. Нужен ли экспорт токенов (цвета, шрифты, отступы) вручную, или вы предоставите DESIGN.md / tokens.json?

> [!IMPORTANT]
> **Язык интерфейса по умолчанию:** Спецификация требует EN + RU через `next-intl`. Начинать с EN-only и добавить RU позже, или сразу оба?

> [!IMPORTANT]
> **Деплой / хостинг:** Приложение будет запускаться только локально (dev) или нужен production build (Vercel, Docker)?

> [!IMPORTANT]
> **GitHub:** Пушить в существующий репозиторий `NovalEdu` (из прошлой сессии) или создать отдельный фронтенд-репо?

---

## Proposed Changes

### Phase 0 — Project Bootstrap

#### [NEW] Next.js 14 App Router проект

```
npx create-next-app@latest ./ \
  --typescript --tailwind --eslint \
  --app --src-dir --import-alias "@/*"
```

Дополнительные зависимости одной командой:
```
@tanstack/react-query axios zustand
react-hook-form zod @hookform/resolvers
framer-motion date-fns recharts
@radix-ui/react-dialog @radix-ui/react-dropdown-menu
@radix-ui/react-popover @radix-ui/react-tabs
@radix-ui/react-tooltip @radix-ui/react-toast
react-hot-toast react-dropzone
@dnd-kit/core @dnd-kit/sortable
lucide-react next-intl
@tanstack/react-virtual
```

#### [NEW] `.env.local`
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_CHAT_POLL_INTERVAL=10000
NEXT_PUBLIC_NOTIFICATION_POLL_INTERVAL=30000
```

---

### Phase 1 — Design System & UI Kit

#### [NEW] `src/styles/tokens.css`
CSS custom properties из Figma:
- Цвета: primary, secondary, accent, surface, border, text, success/warning/error/info
- Типографика: font-display, font-body, размеры xs–3xl
- Отступы: 4pt сетка (space-1 … space-16)
- Радиусы: sm/md/lg/xl/full
- Тени: sm/md/lg

#### [NEW] `src/styles/globals.css`
Tailwind директивы + импорт tokens.css + базовые reset-стили.

#### [NEW] `src/components/ui/` — 20 базовых компонентов

| Компонент | Варианты |
|---|---|
| `Button` | primary/secondary/ghost/danger · sm/md/lg · loading/disabled |
| `Input` | default/error/disabled · label/hint/error-message |
| `Textarea` | те же варианты |
| `Select` | single, clearable |
| `Checkbox` | с label |
| `Toggle` | switch |
| `Badge` | статус/приоритет/кастом цвет |
| `Card` | default/elevated/interactive |
| `Avatar` | sm/md/lg · fallback на инициалы |
| `Modal` | Radix Dialog · sm/md/lg/fullscreen |
| `Drawer` | right-side slide |
| `Tabs` | horizontal · URL-sync опционально |
| `Table` | sortable · sticky header · row actions |
| `Pagination` | prev/next + номера страниц |
| `Skeleton` | placeholder shapes |
| `EmptyState` | icon + title + description + CTA |
| `ConfirmDialog` | confirm/cancel |
| `Toast` | через react-hot-toast |
| `SearchInput` | debounce 300ms · clear button |
| `ProgressBar` | linear с label |

#### [NEW] `src/components/layout/`
- `Sidebar` — 240px expanded / 64px collapsed, иконки + labels, активные состояния, badges
- `Topbar` — breadcrumb, notification bell, user avatar dropdown
- `PageHeader` — title + subtitle + action slot

---

### Phase 2 — Infrastructure Layer

#### [NEW] `src/types/api.ts`
Полные TypeScript-интерфейсы для всех 50+ OpenAPI schemas:
```typescript
// Envelope pattern (все ответы API)
interface ApiEnvelope<T> { success: boolean; data: T }

// Auth
interface TokenResponse { access_token: string; refresh_token: string; user: UserBrief }
interface UserBrief { id: string; email: string; full_name: string; role: string }
interface UserOut extends UserBrief { is_active: boolean; avatar_url: string | null; created_at: string }

// Students
interface StudentListItem { id: string; full_name: string; email: string; group_type?: string; course_year?: number; gpa?: number; ielts_passed?: boolean; sat_passed?: boolean; avatar_url?: string; tasks_total: number; tasks_done: number; unread_messages: number }
interface StudentDetail { user: UserOut; profile: ProfileOut | null; documents: DocumentOut[]; active_roadmap: object | null; tasks_summary: object; next_appointment: object | null }

// ... (все остальные схемы из OpenAPI)
interface PaginatedMeta { page: number; page_size: number; total: number }
```

#### [NEW] `src/lib/apiClient.ts`
```typescript
// Axios instance с interceptors:
// - Request: Authorization: Bearer <access_token>
// - Response 401: auto-refresh → retry → redirect /login
// - Non-2xx: нормализация в ApiError { status, message, detail? }
```

#### [NEW] `src/lib/queryClient.ts`
TanStack Query config: staleTime 30s (списки), 5min (статика), gcTime 5min.

#### [NEW] `src/stores/authStore.ts`
Zustand: `{ user, isAuthenticated, setSession, clearSession }`

#### [NEW] `src/stores/uiStore.ts`
Zustand: `{ sidebarCollapsed, notificationDrawerOpen, toggleSidebar, setNotificationDrawer }`

#### [NEW] `src/hooks/` — 17 хуков по доменам

```
useAuth.ts          login, logout, refresh, me
useStudents.ts      listStudents, getStudent, inviteStudent, deleteStudent
useProfile.ts       getStudentProfile, updateStudentProfile
useDocuments.ts     listDocuments, uploadDocument, deleteDocument
useTasks.ts         listTasks, createTask, updateTask, deleteTask, patchTaskStatus
useAppointments.ts  listSlots, createSlot, listAppointments, bookAppointment, cancelAppointment, completeAppointment
useMessages.ts      listConversations, getMessages, sendMessage, broadcast
useUniversities.ts  listUniversities, getUniversity, createUniversity, updateUniversity, deleteUniversity
useRoadmaps.ts      listRoadmaps, getRoadmap, createRoadmap, updateRoadmap, deleteRoadmap, assignRoadmap, listStudentRoadmaps
useNews.ts          listNews, getNews, createNews, updateNews, deleteNews, addToCalendar
useCalendar.ts      listEvents, createEvent, updateEvent, deleteEvent
useFAQ.ts           listFAQs, createFAQ, updateFAQ, deleteFAQ, reorderFAQs
useAlumni.ts        listAlumni, getAlumni, createAlumni, updateAlumni, deleteAlumni
useNotifications.ts listNotifications, unreadCount, markRead, markAllRead
useReports.ts       overview, studentsReport, universitiesReport
usePaginated.ts     обёртка usePaginatedQuery для page/page_size/meta
```

---

### Phase 3 — App Layout & Routing

#### [NEW] `src/app/layout.tsx`
Root layout: шрифты (Google Fonts), Providers (QueryClient, Theme, Locale), Toaster.

#### [NEW] `src/app/(auth)/layout.tsx`
Центрированный layout для страниц логина.

#### [NEW] `src/app/(ADVISER)/layout.tsx`
Protected layout: ProtectedRoute guard + Sidebar + Topbar.

#### [NEW] `src/components/layout/ProtectedRoute.tsx`
- Проверяет `isAuthenticated`
- Проверяет `user.role === "ADVISER"`
- Спиннер при валидации сессии
- Redirect `/login?next=<path>`

**Полная структура роутов:**
```
/login
/forgot-password
/reset-password
/dashboard
/students
/students/[studentId]
/students/[studentId]/profile
/students/[studentId]/documents
/students/[studentId]/tasks
/students/[studentId]/roadmaps
/tasks
/appointments
/messages
/messages/[convoId]
/universities
/universities/new
/universities/[universityId]
/roadmaps
/roadmaps/new
/roadmaps/[roadmapId]
/news
/news/new
/news/[newsId]
/calendar
/alumni
/alumni/new
/alumni/[storyId]
/faq
/reports
/settings
```

---

### Phase 4 — Auth Pages

#### [NEW] `src/app/(auth)/login/page.tsx`
- Поля: email (email validation), password (min 8)
- `POST /api/v1/auth/login` → store tokens → redirect `/dashboard`
- 401 → inline error "Invalid email or password"
- Show/hide password toggle
- Loading state на submit

#### [NEW] `src/app/(auth)/forgot-password/page.tsx`
- Поле: email
- `POST /api/v1/auth/forgot-password`
- Success state: "Check your email"

#### [NEW] `src/app/(auth)/reset-password/page.tsx`
- Поля: email, OTP (6 отдельных инпутов), new password, confirm password
- `POST /api/v1/auth/reset-password`
- Success → redirect `/login` с toast

---

### Phase 5 — Core Feature Modules

---

#### 5.1 Dashboard (`/dashboard`)

**API:** `GET /api/v1/reports/overview`

**Компоненты:**
- `OverviewKPIGrid` — 6 карточек (total_students, ielts_passed, sat_passed, avg_gpa, tasks_completed_this_month, appointments_this_month)
- `GroupDonutChart` — recharts, by_group breakdown
- `RecentStudentsTable` — топ-5 студентов с GPA badge, IELTS/SAT badge, progress bar
- `UpcomingAppointmentsList` — из `GET /api/v1/appointments/my`
- `UpcomingCalendarEvents` — из `GET /api/v1/calendar?from=today`

---

#### 5.2 Students (`/students`, `/students/[id]`)

**[NEW] `src/components/students/`:**
- `StudentTable` — сортируемая таблица с аватаром, email, GPA (цвет), IELTS/SAT badges, task progress bar, unread badge, actions
- `StudentFilters` — toggle D/F/All, year 2/3/All, IELTS yes/no/all, SAT yes/no/all, SearchInput с debounce 300ms
- `InviteModal` — form: email, full_name, password → `POST /api/v1/ADVISER/students/invite`
- `StudentDetailTabs` — 5 вкладок: Overview / Profile / Documents / Tasks / Roadmaps
- `ProfileForm` — все поля ProfileUpdate с Zod-валидацией, DatePicker, Toggle
- `DocumentsGrid` — карточки документов + react-dropzone upload area
- `DocumentCard` — doc_type, size, date, download link, delete

**URL state:** `?group_type=D&course_year=2&page=1&tab=profile`

---

#### 5.3 Tasks (`/tasks`, `/students/[id]/tasks`)

**[NEW] `src/components/tasks/`:**
- `TaskBoard` — Kanban 3 колонки (Todo / In Progress / Done), @dnd-kit drag-and-drop → `PATCH /api/v1/tasks/{id}/status` (оптимистичное обновление)
- `TaskList` — list view с теми же карточками
- `TaskCard` — title, status badge, priority badge, deadline, overdue indicator (красная рамка)
- `TaskForm` — create/edit: title, description, priority select, deadline datetime, roadmap link
- `ViewToggle` — переключатель List/Kanban

> **STUB:** Глобальный `/tasks` — агрегация с первых страниц студентов, помечено `// STUB: no list-all endpoint`

---

#### 5.4 Appointments (`/appointments`)

**[NEW] `src/components/appointments/`:**
- `AppointmentTabs` — My Appointments / All Appointments / Manage Slots
- `AppointmentCard` — status badge (pending/confirmed/completed/cancelled), student name (resolve from cache), notes, actions (Complete, Cancel)
- `SlotManager` — список слотов с is_available индикатором, delete action
- `SlotCreateForm` — start_time, end_time, duration_min (5–240)
- `BatchSlotForm` — создание нескольких слотов за раз

> **STUB:** Student name resolution — `// TODO: resolve student name from cache`

---

#### 5.5 Messages (`/messages`, `/messages/[convoId]`)

**[NEW] `src/components/messages/`:**
- `ConversationList` — список conversations, student name (cache), last_message_at, unread indicator
- `MessageThread` — chat bubbles (ADVISER right, student left), auto-scroll
- `MessageInput` — textarea + send button + Enter key
- `BroadcastModal` — body (max 2000), filter_group, ielts_passed → `POST /api/v1/messages/broadcast` → "Sent to N students"

**Polling:** каждые `NEXT_PUBLIC_CHAT_POLL_INTERVAL` ms (10s) в активном чате.  
**Mark read:** `PATCH .../read` при открытии conversation.

---

### Phase 6 — Content Modules

---

#### 6.1 Universities (`/universities`, `/universities/[id]`)

**[NEW] `src/components/universities/`:**
- `UniversityCard` — logo, name, country/city, QS ranking, acceptance rate, language, program count, published toggle
- `UniversityFilters` — country, field, min_gpa, max_tuition, degree_level, has_scholarship, search
- `UniversityForm` — все поля UniversityCreate/Update
- `UniversityDetailTabs` — Overview + Programs
- `ProgramList` — список программ с add/edit/delete
- `ProgramForm` — все поля UniversityProgramCreate

---

#### 6.2 Roadmaps (`/roadmaps`, `/roadmaps/[id]`)

> Раздел добавлен в sidebar (не в Figma), секция "Tools"

**[NEW] `src/components/roadmaps/`:**
- `RoadmapCard` — title, description, target_type, is_public badge, created date
- `RoadmapForm` — title, description, target_type, is_public + template tasks inline
- `TemplateTaskList` — drag-to-reorder (@dnd-kit), каждый task: title, description, order_index, days_offset
- `RoadmapAssignModal` — student_id select + опциональные deadline overrides по template tasks

---

#### 6.3 News & Calendar (`/news`, `/calendar`)

**[NEW] `src/components/news/`:**
- `NewsCard` — cover image, title, category badge, event_date, views_count, published toggle
- `NewsForm` — title, body, cover_url, category (enum select), event_date, external_url, is_published
- `AddToCalendarButton` — reminder_days_before input (0–30)

**[NEW] `src/components/calendar/`:**
- `CalendarView` — monthly/weekly view, события цветами по event_type
- `EventForm` — title, description, event_type select, start_time, end_time, all_day toggle, color picker

---

#### 6.4 Alumni (`/alumni`, `/alumni/[id]`)

**[NEW] `src/components/alumni/`:**
- `AlumniCard` — photo, student_name, graduation_year, university_name, scholarship_type badge, GPA/IELTS/SAT at time, published toggle
- `AlumniForm` — все поля AlumniCreate/Update + university_id select (из кэша universities)

---

#### 6.5 FAQ (`/faq`)

**[NEW] `src/components/faq/`:**
- `FAQList` — accordion-style, draggable rows (@dnd-kit) с handle icon
- `FAQItem` — question/answer/category/is_active toggle
- `FAQForm` — create/edit: question, answer, category, order_index, is_active

**Reorder:** на drop вычислить новые order_index → `PATCH /api/v1/faqs/reorder`

---

### Phase 7 — Analytics & Settings

#### 7.1 Reports (`/reports`)

**[NEW] `src/components/reports/`:**
- `OverviewTab` — KPI grid + GroupDonutChart (by_group) + applied_abroad callout
- `StudentsProgressTab` — sortable table с progress bars + recharts BarChart (GPA distribution) + grouped bar (IELTS vs SAT) + CSV export (// STUB: client-side json2csv)
- `UniversitiesTab` — 2x horizontal bar chart (top 10 target countries, top 10 majors)

#### 7.2 Settings (`/settings`)

**Tabs:**
1. **My Profile** — `GET/PUT /api/v1/users/me` · full_name, avatar_url (URL input // STUB)
2. **Change Password** — old_password, new_password (min 8, max 128), confirm → `POST /api/v1/auth/change-password`

#### 7.3 Notifications

- `NotificationBell` в Topbar — polling unread-count каждые 30s
- `NotificationDrawer` — список NotificationOut, иконки по type, unread highlight
- Mark single: `PATCH /api/v1/notifications/{id}/read` (оптимистичное)
- Mark all: `PATCH /api/v1/notifications/read-all`

---

### Phase 8 — Polish & QA

#### Error Handling
- 401 → redirect `/login` + toast "Session expired"
- 403 → inline "You don't have permission"
- 404 → `<EmptyState>`
- 422 → field-level form errors из `detail` array
- 500 → toast "Something went wrong"
- Network error → toast "No connection" + auto-retry

#### Loading States
- Skeleton placeholders на каждой странице
- Button loading state при submit
- Page-level spinner при route transitions

#### i18n (`next-intl`)
- `/messages/en.json` — все строки EN
- `/messages/ru.json` — все строки RU
- Locale switcher в Topbar (или Settings)

#### Performance
- `@tanstack/react-virtual` для списка студентов > 50 записей
- `React.lazy` для Calendar и Charts
- `next/image` для всех изображений

---

## Stub Summary

| # | Фича | Причина | Маркировка |
|---|---|---|---|
| 1 | Global `/tasks` list | Нет endpoint list-all | `// STUB: no list-all endpoint` |
| 2 | Student name в AppointmentCard | API возвращает только student_id | `// STUB: resolve from cache` |
| 3 | Last message preview | Conversations не возвращает preview | `// STUB: show timestamp only` |
| 4 | CSV export в Reports | Нет export endpoint | `// STUB: client-side json2csv` |
| 5 | Real-time chat | REST only | Polling каждые 10s |
| 6 | Avatar upload | UserUpdate принимает только URL | `// STUB: URL input only` |
| 7 | Notification push | REST only | Polling каждые 30s |

---

## Verification Plan

### Automated
```bash
npm run build          # TypeScript compile check
npm run lint           # ESLint clean
npx vitest run         # unit tests (target 80%+ hooks/utils)
npx playwright test    # E2E: 5 critical flows
```

### E2E Critical Flows (Playwright)
1. Login → Dashboard KPI cards loaded
2. Invite student → appears in student list
3. Create task → drag to In Progress → drag to Done → API calls verified
4. Send message → appears in conversation thread
5. Create slot → student books → ADVISER completes

### Manual
- Открыть все 14 разделов sidebar, проверить empty states
- Форму инвайта студента с валидацией
- Kanban drag-and-drop
- Broadcast modal → "Sent to N students"
- Notification bell polling

---

## Delivery Order (Фазы в порядке реализации)

```
Phase 0 → Project init + deps install
Phase 1 → Design system + UI Kit (tokens + 20 компонентов)
Phase 2 → Infrastructure (types, apiClient, stores, hooks)
Phase 3 → Layout + routing + ProtectedRoute
Phase 4 → Auth pages (Login, ForgotPassword, ResetPassword)
Phase 5 → Dashboard
Phase 5 → Students (list + detail tabs)
Phase 5 → Tasks (Kanban + list)
Phase 5 → Appointments
Phase 5 → Messages
Phase 6 → Universities
Phase 6 → Roadmaps
Phase 6 → News + Calendar
Phase 6 → Alumni + FAQ
Phase 7 → Reports + Settings + Notifications
Phase 8 → i18n (RU) + Error handling + Performance + QA
```

**Оценка объёма:** ~120–150 файлов, ~15,000–20,000 строк TypeScript/TSX.
