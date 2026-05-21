# Nobal Education — Frontend Technical Specification
**ADVISER Dashboard (Web Application)**
Version 1.0 | May 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Architecture](#2-tech-stack--architecture)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [API Integration Layer](#4-api-integration-layer)
5. [Application Structure](#5-application-structure)
6. [Pages & Components](#6-pages--components)
   - 6.1 [Auth Pages](#61-auth-pages)
   - 6.2 [Dashboard / Overview](#62-dashboard--overview)
   - 6.3 [Students](#63-students)
   - 6.4 [Tasks](#64-tasks)
   - 6.5 [Appointments](#65-appointments)
   - 6.6 [Messages](#66-messages)
   - 6.7 [Universities](#67-universities)
   - 6.8 [Roadmaps](#68-roadmaps)
   - 6.9 [News & Calendar](#69-news--calendar)
   - 6.10 [Alumni](#610-alumni)
   - 6.11 [FAQ](#611-faq)
   - 6.12 [Reports](#612-reports)
   - 6.13 [Profile / Settings](#613-profile--settings)
   - 6.14 [Notifications](#614-notifications)
7. [State Management](#7-state-management)
8. [UI Kit & Design System](#8-ui-kit--design-system)
9. [Mock Data & Stubs](#9-mock-data--stubs)
10. [Routing & Navigation](#10-routing--navigation)
11. [Error Handling & Loading States](#11-error-handling--loading-states)
12. [Accessibility & i18n](#12-accessibility--i18n)
13. [Testing Strategy](#13-testing-strategy)
14. [Performance Requirements](#14-performance-requirements)
15. [Deliverables & Acceptance Criteria](#15-deliverables--acceptance-criteria)

---

## 1. Project Overview

### 1.1 Context

**Nobal eduadviser** is a Student Admission Management Platform. The frontend described in this document is the **ADVISER Dashboard** — a web application used by admission ADVISERs (counselors) to manage their student portfolio: track progress, assign tasks, schedule appointments, send messages, and monitor overall analytics.

### 1.2 User Role

The application is exclusively for users with `role: ADVISER`. Students have a separate mobile/web interface. All UI decisions, data access, and routing must be scoped to the ADVISER role.

### 1.3 Design Source

Reference Figma file: `https://www.figma.com/design/V89xlk3ttsGTDx7m3ea661/Nobal-Edu?node-id=0-1`
Focus: ADVISER interface panels only. Analyze all frames, auto-layouts, color styles, and text styles before implementation.

### 1.4 Backend Source of Truth

All data shapes, field names, validation rules, and HTTP methods are derived **exclusively** from the OpenAPI specification available at `http://localhost:8000/api/openapi.json` (provided as attachment). Base URL for all API requests: `http://localhost:8000`.

---

## 2. Tech Stack & Architecture

### 2.1 Framework

- **Next.js 14+** with App Router
- **TypeScript** (strict mode, no `any` unless explicitly justified)
- **React 18+**

### 2.2 Styling

- **Tailwind CSS** — utility-first, configured with the design system tokens derived from Figma
- **CSS Modules** — for complex component-level scoped styles
- **Framer Motion** — for page transitions and micro-interactions

### 2.3 Data Fetching & API

- **TanStack Query (React Query) v5** — server state management, caching, background refetching
- **Axios** — HTTP client with interceptors for auth token injection and error normalization
- All API types auto-generated or manually typed from the OpenAPI schema (see Section 4)

### 2.4 State Management

- **Zustand** — lightweight global state for auth session, UI state (sidebar collapse, notification drawer)
- **React Context** — for theme and locale

### 2.5 Forms

- **React Hook Form** + **Zod** — form state and validation schemas derived from OpenAPI constraints

### 2.6 Other Libraries

| Library | Purpose |
|---|---|
| `date-fns` | Date formatting, offset calculation |
| `recharts` | Charts in Reports section |
| `@radix-ui/react-*` | Accessible headless primitives (Dialog, DropdownMenu, Popover, Toast) |
| `react-hot-toast` | Notifications/toasts |
| `react-dropzone` | Document upload UI |
| `@dnd-kit/core` | Drag-and-drop for FAQ reorder, Kanban tasks |
| `lucide-react` | Icon set |

### 2.7 Development Tools

- ESLint + Prettier (Airbnb config)
- Husky + lint-staged (pre-commit hooks)
- Storybook (component documentation)
- Vitest + React Testing Library (unit & integration tests)
- Playwright (E2E tests for critical flows)

---

## 3. Authentication & Authorization

### 3.1 Flow

```
POST /api/v1/auth/login
  → { access_token, refresh_token, user: { id, email, full_name, role } }
```

1. On successful login, store `access_token` and `refresh_token` in **httpOnly cookies** (preferred) or `localStorage` as fallback.
2. Decode JWT to verify `role === "ADVISER"`. If role is different, redirect to an "Access Denied" page.
3. Axios request interceptor attaches `Authorization: Bearer <access_token>` to every outgoing request.
4. Axios response interceptor catches `401` responses and calls `POST /api/v1/auth/refresh` automatically. If refresh fails, clear session and redirect to `/login`.

### 3.2 Session Persistence

- On app bootstrap, check for stored tokens and call `GET /api/v1/users/me` to validate session.
- If valid → hydrate auth store and proceed to dashboard.
- If invalid → redirect to `/login`.

### 3.3 Logout

```
POST /api/v1/auth/logout  { refresh_token }
```
Clear all stored tokens. Redirect to `/login`. Invalidate all React Query caches.

### 3.4 Password Management Pages

- **Forgot Password**: `POST /api/v1/auth/forgot-password` — form with email field, send OTP.
- **Reset Password**: `POST /api/v1/auth/reset-password` — form with email + 6-digit OTP + new password.
- **Change Password**: `POST /api/v1/auth/change-password` — available in Profile Settings, requires old password.

### 3.5 Auth Store (Zustand)

```typescript
interface AuthState {
  user: UserBrief | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setSession: (tokens, user) => void;
  clearSession: () => void;
}
```

### 3.6 Route Guard

All routes under `/(ADVISER)/*` are wrapped in a `<ProtectedRoute>` component that:
- Checks `isAuthenticated`
- Verifies `user.role === "ADVISER"`
- Shows a loading spinner during session validation
- Redirects to `/login` if not authenticated

---

## 4. API Integration Layer

### 4.1 Type Generation

Manually type all OpenAPI schemas as TypeScript interfaces in `/src/types/api.ts`. Key types to implement (mapped from OpenAPI `components/schemas`):

```
UserBrief, UserOut, UserUpdate
RegisterRequest, LoginRequest, TokenResponse
StudentListItem, StudentDetail, StudentDetailResponse
ProfileOut, ProfileUpdate
DocumentOut, DocumentUploadResponse
TaskOut, TaskCreate, TaskUpdate, TaskStatusUpdate
AppointmentOut, SlotOut, SlotCreate, BookRequest
ConversationOut, MessageOut, SendMessageRequest, BroadcastRequest
UniversityOut, UniversityDetail, UniversityProgramOut
NewsOut, NewsCreate
CalendarEventOut, CalendarEventCreate
RoadmapOut, RoadmapDetail, StudentRoadmapOut
FAQOut, AlumniOut
OverviewReport, StudentProgressItem, UniversityStats
PaginatedMeta, PaginatedStudents, PaginatedTasks, PaginatedUniversities
NotificationOut, UnreadCountOut
```

### 4.2 API Client

```
/src/lib/
  apiClient.ts       — Axios instance with interceptors
  queryClient.ts     — TanStack Query client config
```

### 4.3 Query/Mutation Hooks

Organized per domain in `/src/hooks/`:

```
useAuth.ts              — login, logout, refresh, me
useStudents.ts          — listStudents, getStudent, inviteStudent, deleteStudent
useProfile.ts           — getStudentProfile, updateStudentProfile
useDocuments.ts         — listDocuments, uploadDocument, deleteDocument
useTasks.ts             — listTasks, createTask, updateTask, deleteTask, patchTaskStatus
useAppointments.ts      — listSlots, createSlot, listAppointments, bookAppointment, cancelAppointment, completeAppointment
useMessages.ts          — listConversations, getMessages, sendMessage, broadcast
useUniversities.ts      — listUniversities, getUniversity, createUniversity, updateUniversity
useRoadmaps.ts          — listRoadmaps, getRoadmap, createRoadmap, assignRoadmap, listStudentRoadmaps
useNews.ts              — listNews, getNews, createNews, updateNews, deleteNews
useCalendar.ts          — listEvents, createEvent, updateEvent, deleteEvent
useFAQ.ts               — listFAQs, createFAQ, updateFAQ, deleteFAQ, reorderFAQs
useAlumni.ts            — listAlumni, createAlumni, updateAlumni, deleteAlumni
useNotifications.ts     — listNotifications, unreadCount, markRead, markAllRead
useReports.ts           — overview, studentsReport, universitiesReport
```

Each hook returns typed query/mutation results from React Query.

### 4.4 Pagination

Reusable `usePaginatedQuery` wrapper that handles `page`, `page_size` params and maps `PaginatedMeta` to a `{ data, meta, hasNextPage }` structure.

### 4.5 Error Handling

API errors are normalized into:
```typescript
interface ApiError {
  status: number;
  message: string;
  detail?: ValidationError[];
}
```
A global Axios response interceptor converts all non-2xx responses to this shape and triggers toast notifications for common errors (401, 403, 404, 422, 500).

---

## 5. Application Structure

```
/src
  /app
    /layout.tsx                  — Root layout (fonts, providers, toasts)
    /(auth)
      /login/page.tsx
      /forgot-password/page.tsx
      /reset-password/page.tsx
    /(ADVISER)
      /layout.tsx                — Protected layout with sidebar + topbar
      /dashboard/page.tsx
      /students
        /page.tsx                — Student list
        /[studentId]
          /page.tsx              — Student detail
          /profile/page.tsx
          /documents/page.tsx
          /tasks/page.tsx
          /roadmaps/page.tsx
      /tasks/page.tsx            — Global task view (ADVISER's tasks)
      /appointments/page.tsx
      /messages
        /page.tsx                — Conversation list
        /[convoId]/page.tsx      — Chat view
      /universities
        /page.tsx
        /[universityId]/page.tsx
        /new/page.tsx
      /roadmaps
        /page.tsx
        /[roadmapId]/page.tsx
        /new/page.tsx
      /news
        /page.tsx
        /[newsId]/page.tsx
        /new/page.tsx
      /calendar/page.tsx
      /faq/page.tsx
      /alumni
        /page.tsx
        /new/page.tsx
        /[storyId]/page.tsx
      /reports/page.tsx
      /settings/page.tsx
  /components
    /ui/                         — Base UI kit (Button, Input, Badge, Card, Modal, etc.)
    /layout/                     — Sidebar, Topbar, PageHeader, BreadcrumbNav
    /students/                   — StudentCard, StudentTable, StudentFilters, InviteModal
    /tasks/                      — TaskCard, TaskBoard (Kanban), TaskList, TaskForm
    /appointments/               — SlotPicker, AppointmentCard, AppointmentCalendar
    /messages/                   — ConversationList, MessageThread, MessageInput, BroadcastModal
    /universities/               — UniversityCard, UniversityForm, ProgramList, ProgramForm
    /roadmaps/                   — RoadmapCard, RoadmapForm, RoadmapAssignModal
    /reports/                    — OverviewMetrics, StudentProgress Chart, UniversityStats Chart
    /notifications/              — NotificationBell, NotificationDrawer, NotificationItem
    /common/                     — Pagination, SearchInput, FilterBar, EmptyState, ConfirmDialog
  /hooks/                        — API hooks (see 4.3)
  /stores/                       — Zustand stores
  /lib/                          — apiClient, queryClient, utils
  /types/
    api.ts                       — OpenAPI-mapped types
    app.ts                       — App-specific types
  /styles/
    globals.css
    tokens.css                   — CSS variables from Figma design tokens
```

---

## 6. Pages & Components

---

### 6.1 Auth Pages

#### `/login`

**Fields**: email (email validation), password (min 8 chars)
**API**: `POST /api/v1/auth/login`
**Behavior**:
- On success: store tokens, redirect to `/dashboard`
- On 401: show "Invalid email or password" inline error
- Show/hide password toggle
- Link to `/forgot-password`
- Loading state on submit button

#### `/forgot-password`

**Fields**: email
**API**: `POST /api/v1/auth/forgot-password`
**Behavior**: Success state shows "Check your email" message. Link back to `/login`.

#### `/reset-password`

**Fields**: email, OTP (6-digit, separate inputs recommended), new password, confirm password
**API**: `POST /api/v1/auth/reset-password`
**Behavior**: On success redirect to `/login` with success toast.

---

### 6.2 Dashboard / Overview

**Route**: `/dashboard`
**API**: `GET /api/v1/reports/overview` → `OverviewReport`

#### Layout

Split into three sections:

**Top KPI Cards** (6 cards):

| Card | Field | Type |
|---|---|---|
| Total Students | `total_students` | number |
| IELTS Passed | `ielts_passed` | number |
| SAT Passed | `sat_passed` | number |
| Average GPA | `avg_gpa` | number (2 decimals) |
| Tasks Completed (Month) | `tasks_completed_this_month` | number |
| Appointments (Month) | `appointments_this_month` | number |

> **Mock Stub**: `applied_abroad` and `by_group` breakdown chart — use `OverviewReport.applied_abroad` and `by_group` object for a donut chart. Label: "Applied Abroad" and "Students by Group (D/F)".

**Middle Section**:
- Recent Students table (reuse `GET /api/v1/students?page=1&page_size=5`) — show name, group, GPA, IELTS/SAT badges, task progress bar.
- Upcoming Appointments (reuse `GET /api/v1/appointments/my` filtered to upcoming).

**Bottom Section**:
- Upcoming calendar events (reuse `GET /api/v1/calendar` with `from=today`).

---

### 6.3 Students

#### `/students` — Student List

**API**: `GET /api/v1/students` with query params:
- `group_type` (D | F)
- `course_year` (2 | 3)
- `ielts_passed` (boolean)
- `sat_passed` (boolean)
- `search` (string, max 100)
- `page`, `page_size`

**Response**: `PaginatedStudents` → array of `StudentListItem`

**UI Components**:

1. **Filter Bar**: Group Type (toggle D/F/All), Course Year (2/3/All), IELTS Passed (yes/no/all), SAT Passed (yes/no/all), Search input with debounce (300ms).

2. **Student Table** columns:
   - Avatar + Full Name (link to student detail)
   - Email
   - Group / Year
   - GPA (colored: green ≥3.5, yellow 2.5–3.49, red <2.5)
   - IELTS badge (green "Passed" / gray "—")
   - SAT badge (green "Passed" / gray "—")
   - Tasks progress (`tasks_done / tasks_total`, progress bar)
   - Unread messages badge
   - Actions: View, Delete

3. **Invite Student Button** → opens `InviteModal`:
   - Fields: email, full_name, password
   - API: `POST /api/v1/ADVISER/students/invite`

4. **Pagination** component, linked to `meta.total`, `meta.page`, `meta.page_size`.

5. **Delete Student**: `DELETE /api/v1/students/{student_id}` → confirm dialog → success toast + cache invalidation.

#### `/students/[studentId]` — Student Detail

**API**: `GET /api/v1/students/{student_id}` → `StudentDetail`

`StudentDetail` contains:
- `user`: `UserOut`
- `profile`: `ProfileOut` (may be null)
- `documents`: array
- `active_roadmap`: object (may be null)
- `tasks_summary`: object with task counts
- `next_appointment`: object (may be null)

**Layout**: Tab-based navigation:
1. **Overview** — user info card, profile snapshot, next appointment card, active roadmap card, task summary counters
2. **Profile** (see 6.3.1)
3. **Documents** (see 6.3.2)
4. **Tasks** (see 6.4 scoped to student)
5. **Roadmaps** (see 6.8 scoped to student)

#### 6.3.1 Student Profile Tab

**API**: `GET /api/v1/students/{student_id}/profile` → `ProfileOut`
**Edit**: `PUT /api/v1/students/{student_id}/profile` with `ProfileUpdate`

**Displayed/Editable Fields** from `ProfileOut`:

| Field | Display | Validation |
|---|---|---|
| `group_type` | Select: D / F | Required |
| `course_year` | Select: 2 / 3 | Required |
| `gpa` | Number input | 0.0–4.0 |
| `ielts_passed` | Toggle | — |
| `ielts_score` | Number input | 0.0–9.0 |
| `ielts_date` | Date picker | — |
| `sat_passed` | Toggle | — |
| `sat_score` | Number input | 400–1600 |
| `sat_date` | Date picker | — |
| `ent_score` | Number input | 0–140 |
| `kta_score` | Number input | — |
| `target_country` | Text input | max 100 |
| `target_major` | Text input | max 200 |
| `notes` | Textarea | — |

#### 6.3.2 Student Documents Tab

**API**: `GET /api/v1/students/{student_id}/documents` → `DocumentsResponse`

**Upload**: `POST /api/v1/students/{student_id}/documents?doc_type=<type>` (multipart/form-data)

**Delete**: `DELETE /api/v1/students/{student_id}/documents/{doc_type}`

**UI**:
- Grid of document cards showing: doc_type label, file size, upload date, download link (`url`), delete button.
- Upload area (react-dropzone) with `doc_type` selector dropdown.
- `doc_type` is a free string — suggest common values: `passport`, `transcript`, `ielts_certificate`, `sat_certificate`, `recommendation_letter`, `personal_statement`, `other`.

---

### 6.4 Tasks

#### Global `/tasks` — ADVISER's Personal Tasks

**API**: `POST /api/v1/tasks/personal` for creation; display via student task lists.

> **Note**: There is no dedicated endpoint to list all tasks across all students. **Mock Stub**: Aggregate from student list or add a UI note. Alternatively, implement a ADVISER-level task view that fetches tasks per student in parallel (up to page 1 of each). Mark this as a **STUB** in code comments.

#### Student Tasks `/students/[studentId]/tasks`

**API**: `GET /api/v1/students/{student_id}/tasks` with params:
- `status` (todo | in_progress | done)
- `is_ADVISER_task` (boolean)
- `page`, `page_size`

**Create Task**: `POST /api/v1/students/{student_id}/tasks` with `TaskCreate`:
```
title (required, max 300)
description (optional, max 2000)
priority: low | medium | high  (default: medium)
deadline (datetime)
student_roadmap_id (optional UUID)
```

**Task Card** fields from `TaskOut`:
- `title`, `description`, `status`, `priority`, `deadline`, `completed_at`, `is_ADVISER_task`
- Status badge: todo (gray), in_progress (blue), done (green)
- Priority badge: low (green), medium (yellow), high (red)
- Overdue indicator: if `deadline < now && status !== "done"` → red border

**Update Task**: `PUT /api/v1/tasks/{task_id}` with `TaskUpdate`
**Update Status**: `PATCH /api/v1/tasks/{task_id}/status` with `TaskStatusUpdate`
- Status values: `todo`, `in_progress`, `done`

**Delete Task**: `DELETE /api/v1/tasks/{task_id}`

**View Modes**: Toggle between **List view** and **Kanban board** (3 columns: To Do, In Progress, Done). Kanban supports drag-and-drop via `@dnd-kit/core` triggering `PATCH .../status`.

---

### 6.5 Appointments

**Route**: `/appointments`

#### Tabs:
1. **My Appointments** — `GET /api/v1/appointments/my` → `AppointmentsResponse`
2. **All Appointments** — `GET /api/v1/appointments` → `AppointmentsResponse`
3. **Manage Slots** — `GET /api/v1/appointments/slots?ADVISER_id=<me>`

#### Appointment Card fields (`AppointmentOut`):
- `status`: pending / confirmed / completed / cancelled (colored badges)
- `student_id`, `ADVISER_id` (resolve names via student store or cache)
- `notes`, `cancel_reason`
- `created_at`, `cancelled_at`
- Actions: **Complete** (`PATCH .../complete`), **Cancel** (`PATCH .../cancel` with optional reason)

#### Slot Management:
- **List Slots**: `GET /api/v1/appointments/slots` filtered by `ADVISER_id` and optionally `from_time`
- **Create Single Slot**: `POST /api/v1/appointments/slots` with `SlotCreate`:
  ```
  start_time (required datetime)
  end_time (optional)
  duration_min: 5–240
  ```
- **Batch Create Slots**: same endpoint with `SlotsBatchCreate` body `{ slots: SlotCreate[] }`
- **Delete Slot**: `DELETE /api/v1/appointments/slots/{slot_id}`
- Slot availability indicator: `is_available` field shown as green/gray tag

#### Calendar View:
- Optional monthly/weekly calendar visualization of appointments and slots.
- Show appointment blocks color-coded by status.

> **Mock Stub**: Student name resolution in appointment cards — join against cached student list or show truncated UUID with tooltip. Mark as `// TODO: resolve student name from cache`.

---

### 6.6 Messages

#### `/messages` — Conversation List

**API**: `GET /api/v1/messages/conversations` → `ConversationsResponse`
- Each `ConversationOut`: `id`, `student_id`, `ADVISER_id`, `last_message_at`
- Show student name (resolved from cache), last message preview (mock — API doesn't return it directly), timestamp, unread indicator.

**My Conversation**: `GET /api/v1/messages/conversations/my` → own conversation object.

#### `/messages/[convoId]` — Chat View

**API**: `GET /api/v1/messages/conversations/{convo_id}/messages?limit=50&offset=0`
- Returns `MessagesResponse` → array of `MessageOut`:
  - `sender_id`, `sender_name`, `sender_role`, `body`, `is_read`, `read_at`, `created_at`

**Send Message**: `POST /api/v1/messages/conversations/{convo_id}/messages` with `{ body: string }`

**Mark Read**: `PATCH /api/v1/messages/conversations/{convo_id}/read`

**UI**:
- Chat bubble layout: ADVISER messages right-aligned, student messages left-aligned.
- Message input with send button, supports Enter key.
- Auto-scroll to latest message on load and new message.
- Load more messages (infinite scroll upward using offset).
- Mark conversation as read on focus/open.

#### Broadcast Modal

**Trigger**: "Broadcast" button in Messages list
**API**: `POST /api/v1/messages/broadcast` with:
```
body (required, max 2000)
filter_group (optional: "D" | "F")
ielts_passed (optional boolean)
```
**Response**: `{ sent: number }` — show "Sent to N students" confirmation.

---

### 6.7 Universities

**Route**: `/universities`

#### List Page

**API**: `GET /api/v1/universities` with filters:
- `country`, `field`, `min_gpa` (0–4.0), `max_tuition` (integer), `degree_level`, `has_scholarship` (boolean), `search`, `page`, `page_size`

**University Card** (`UniversityOut`):
- Logo, name, country/city, QS ranking, acceptance rate, language of instruction
- Program count badge
- Published/Unpublished status toggle

**Create University**: `POST /api/v1/universities` with `UniversityCreate`
**Update**: `PUT /api/v1/universities/{university_id}`
**Delete**: `DELETE /api/v1/universities/{university_id}`

#### `/universities/[universityId]` — Detail

**API**: `GET /api/v1/universities/{university_id}` → `UniversityDetail` (university + programs array)

**Tabs**:
1. **Overview**: full university info fields
2. **Programs**: list of `UniversityProgramOut`, add/edit/delete

**Program fields** (`UniversityProgramCreate`/`UniversityProgramOut`):
- `name`, `degree_level` (bachelor/master/phd/foundation), `field`
- `min_gpa`, `min_ielts`, `min_sat`, `tuition_usd`, `application_fee`
- `scholarship_info`, `intake_seasons`, `deadline`, `campus_life`
- `requirements_text`, `apply_url`, `is_active`

**Add Program**: `POST /api/v1/universities/{university_id}/programs`
**Update Program**: `PUT /api/v1/universities/{university_id}/programs/{program_id}`
**Delete Program**: `DELETE /api/v1/universities/{university_id}/programs/{program_id}`

---

### 6.8 Roadmaps

> Roadmaps is a full feature not in the Figma design. Add it to the navigation sidebar under a "Tools" section, following the Figma UI kit (same sidebar item component, same color tokens).

**Route**: `/roadmaps`

#### List Page

**API**: `GET /api/v1/roadmaps?page=1&page_size=20` → `PaginatedRoadmaps`

**Roadmap Card** (`RoadmapOut`): title, description, `target_type`, `is_public` badge, created date.

**Create Roadmap**: `POST /api/v1/roadmaps` with `RoadmapCreate`:
```
title (required)
description
target_type (free string, e.g. "IELTS Track", "SAT Track")
is_public (default: true)
template_tasks: RoadmapTemplateTaskCreate[]
  - title, description, order_index, days_offset
```

**Update**: `PUT /api/v1/roadmaps/{roadmap_id}`
**Delete**: `DELETE /api/v1/roadmaps/{roadmap_id}`

#### `/roadmaps/[roadmapId]` — Detail

**API**: `GET /api/v1/roadmaps/{roadmap_id}` → `RoadmapDetail` (roadmap + template_tasks)

- Ordered list of template tasks with drag-to-reorder (UI only, no reorder endpoint — save as update).
- Each task: title, description, `order_index`, `days_offset` (shown as "+N days from assignment").

#### Assign Roadmap

**From Student Detail or Roadmap Detail**: "Assign to Student" button
**API**: `POST /api/v1/roadmaps/{roadmap_id}/assign` with:
```typescript
{
  student_id: string (UUID),
  customize_tasks: TemplateTaskOverride[]  // optional deadline overrides
    - { template_task_id, deadline }
}
```

#### Student Roadmaps

**API**: `GET /api/v1/students/{student_id}/roadmaps` → `StudentRoadmapsResponse`
- Each `StudentRoadmapOut`: `title`, `assigned_at`, `is_active` badge.
- Shown in Student Detail > Roadmaps tab.

---

### 6.9 News & Calendar

#### `/news` — News List

**API**: `GET /api/v1/news` with `category`, `upcoming` (boolean), `page`, `page_size`

**News categories** (enum): `olympiad`, `hackathon`, `deadline`, `summer_camp`, `webinar`, `internship`, `university_news`, `general`

**News Card** (`NewsOut`): cover image, title, category badge, event_date, views_count, published status.

**Create/Edit**: `POST /api/v1/news` / `PUT /api/v1/news/{news_id}` with `NewsCreate`/`NewsUpdate`
**Delete**: `DELETE /api/v1/news/{news_id}`
**Add to Calendar**: `POST /api/v1/news/{news_id}/add-to-calendar` with `{ reminder_days_before?: number }` (0–30)

#### `/calendar` — Calendar View

**API**: `GET /api/v1/calendar?from=<ISO>&to=<ISO>&event_type=<type>`

**Event types** (enum): `appointment`, `task_deadline`, `news_event`, `university_deadline`, `custom`

**Calendar UI**: Full monthly/weekly calendar component. Events color-coded by `event_type` (use `color` field from `CalendarEventOut`).

**Create Event**: `POST /api/v1/calendar` with `CalendarEventCreate`
**Update**: `PUT /api/v1/calendar/{event_id}`
**Delete**: `DELETE /api/v1/calendar/{event_id}`

---

### 6.10 Alumni

**Route**: `/alumni`

**API**: `GET /api/v1/alumni` → `AlumniListResponse`

**Alumni Card** (`AlumniOut`):
- Photo, student_name, graduation_year, university_name, program_name
- scholarship_type badge, GPA at time, IELTS/SAT at time
- Published/Unpublished toggle

**Create**: `POST /api/v1/alumni` with `AlumniCreate`:
- Required: `student_name`, `story_text`
- Optional: graduation_year, university_id (UUID to link), university_name, program_name, scholarship_type, photo_url, gpa_at_time (0–4.0), ielts_at_time (0–9.0), sat_at_time (400–1600), is_published

**Update**: `PUT /api/v1/alumni/{story_id}` with `AlumniUpdate`
**Delete**: `DELETE /api/v1/alumni/{story_id}`

**Detail view**: `/alumni/[storyId]` — `GET /api/v1/alumni/{story_id}` — full story with edit form.

---

### 6.11 FAQ

**Route**: `/faq`

**API**: `GET /api/v1/faqs` → `FAQListResponse`

**FAQ Item** (`FAQOut`): question, answer, category, order_index, is_active toggle.

**Create**: `POST /api/v1/faqs` — fields: question (required), answer (required), category (max 100), order_index (0–32767, default 0), is_active (default true)

**Update**: `PUT /api/v1/faqs/{faq_id}`
**Delete**: `DELETE /api/v1/faqs/{faq_id}`

**Reorder**: `PATCH /api/v1/faqs/reorder` with `{ items: [{ id, order_index }] }`
- Implemented via `@dnd-kit` drag-and-drop. On drop, compute new `order_index` values and call the reorder endpoint.

**UI**: Accordion-style list, draggable rows with handle icon.

---

### 6.12 Reports

**Route**: `/reports`

Three sub-sections (tabs or sections on one page):

#### Overview Tab

**API**: `GET /api/v1/reports/overview` → `OverviewReport`

Visualizations:
- KPI grid (same as Dashboard cards)
- **Donut chart**: Students by group (`by_group` object — keys: group names, values: counts)
- **Number callout**: Applied Abroad count

#### Students Progress Tab

**API**: `GET /api/v1/reports/students` → `StudentsResponse` (array of `StudentProgressItem`)

`StudentProgressItem` fields:
- `id`, `full_name`, `group_type`, `course_year`, `gpa`, `ielts_passed`, `sat_passed`
- `tasks_total`, `tasks_done`, `tasks_overdue`

**Visualizations**:
- Sortable table with progress bars for tasks_done/tasks_total
- **Bar chart**: GPA distribution
- **Grouped bar chart**: IELTS passed vs SAT passed counts
- Tasks overdue highlighted in red
- Export button (CSV) — **Mock Stub**: client-side CSV generation from fetched data

#### Universities Tab

**API**: `GET /api/v1/reports/universities` → `UniversitiesResponse` → `UniversityStats`:
```typescript
{
  by_target_country: Record<string, number>,
  by_target_major: Record<string, number>
}
```

**Visualizations**:
- **Horizontal bar chart**: Top 10 target countries
- **Horizontal bar chart**: Top 10 target majors

---

### 6.13 Profile / Settings

**Route**: `/settings`

**Tabs**:

1. **My Profile**
   - `GET /api/v1/users/me` → `UserOut`
   - Edit: `PUT /api/v1/users/me` with `UserUpdate` (`full_name`, `avatar_url`)
   - Display: id, email (read-only), role (read-only), is_active, created_at

2. **Change Password**
   - Form: old_password, new_password (min 8, max 128), confirm new_password
   - `POST /api/v1/auth/change-password`

---

### 6.14 Notifications

**Component**: Bell icon in topbar with unread count badge.

**API**: `GET /api/v1/notifications/unread-count` → `{ count: number }` — polled every 30s or on focus.

**Drawer/Dropdown** on click:
- `GET /api/v1/notifications?page=1&page_size=20` → paginated `NotificationOut` list

**`NotificationOut`** fields: `title`, `body`, `type`, `is_read`, `created_at`, `source_type`, `source_id`

**Mark Single Read**: `PATCH /api/v1/notifications/{notif_id}/read`
**Mark All Read**: `PATCH /api/v1/notifications/read-all`

**Notification types**: map `type` field to appropriate icon (task, message, appointment, news, etc.). Unread items have a highlighted background.

---

## 7. State Management

### 7.1 Zustand Stores

```typescript
// stores/authStore.ts
interface AuthStore {
  user: UserBrief | null;
  isAuthenticated: boolean;
  setSession: (user, tokens) => void;
  clearSession: () => void;
}

// stores/uiStore.ts
interface UIStore {
  sidebarCollapsed: boolean;
  notificationDrawerOpen: boolean;
  toggleSidebar: () => void;
  setNotificationDrawer: (open: boolean) => void;
}
```

### 7.2 React Query

- **staleTime**: 30 seconds for most list queries, 5 minutes for static data (universities, roadmaps)
- **gcTime**: 5 minutes
- **refetchOnWindowFocus**: enabled for notification count, disabled for heavy list pages
- **Optimistic updates**: task status changes, mark notification read

### 7.3 Cache Invalidation Rules

| Action | Invalidated Keys |
|---|---|
| Invite / Delete Student | `['students']` |
| Update Profile | `['student', id, 'profile']`, `['student', id]` |
| Upload / Delete Document | `['student', id, 'documents']` |
| Create / Update / Delete Task | `['tasks', studentId]`, `['reports', 'overview']` |
| Book / Cancel / Complete Appointment | `['appointments']`, `['slots']` |
| Send Message | `['messages', convoId]`, `['conversations']` |
| Create / Delete News | `['news']` |
| Create / Delete FAQ | `['faqs']` |
| Assign Roadmap | `['student', id, 'roadmaps']` |

---

## 8. UI Kit & Design System

### 8.1 Design Tokens

Derive all tokens from Figma. Implement as CSS custom properties in `tokens.css`:

```css
/* Colors */
--color-primary: /* from Figma primary */
--color-primary-hover:
--color-secondary:
--color-accent:
--color-surface:
--color-surface-elevated:
--color-border:
--color-text-primary:
--color-text-secondary:
--color-text-disabled:
--color-success:
--color-warning:
--color-error:
--color-info:

/* Typography */
--font-display: /* Figma display font */
--font-body: /* Figma body font */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 2rem;

/* Spacing: 4pt grid */
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem;
--space-4: 1rem;
--space-6: 1.5rem;
--space-8: 2rem;
...

/* Radii */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;

/* Shadows */
--shadow-sm:
--shadow-md:
--shadow-lg:
```

### 8.2 Base Components (`/components/ui/`)

Each component must:
- Accept a `className` prop for extension
- Be typed with TypeScript
- Have a Storybook story

| Component | Variants |
|---|---|
| `Button` | primary, secondary, ghost, danger; sizes: sm, md, lg; states: loading, disabled |
| `Input` | default, error, disabled; with label, hint, error message |
| `Textarea` | same as Input |
| `Select` | single, clearable |
| `Checkbox` | with label |
| `Toggle/Switch` | — |
| `Badge` | color variants mapped to status/priority |
| `Card` | default, elevated, interactive (hover shadow) |
| `Avatar` | sizes: sm, md, lg; fallback to initials |
| `Modal/Dialog` | using Radix Dialog, sizes: sm, md, lg, fullscreen |
| `Drawer` | right-side slide panel |
| `Tabs` | horizontal, with URL sync optional |
| `Table` | sortable columns, sticky header, row actions |
| `Pagination` | prev/next + page numbers |
| `Skeleton` | loading placeholder shapes |
| `EmptyState` | icon + title + description + optional CTA |
| `ConfirmDialog` | title, message, confirm/cancel buttons |
| `Toast` | via react-hot-toast |
| `Tooltip` | via Radix |
| `Dropdown/Menu` | via Radix DropdownMenu |
| `DatePicker` | wraps native input[type=date] / react-day-picker |
| `SearchInput` | with debounce, clear button |
| `ProgressBar` | linear, with label |

### 8.3 Layout Components

- **Sidebar**: collapsible, 240px expanded / 64px collapsed. Navigation items with icons, labels, active states, and notification badges.
- **Topbar**: breadcrumb, notification bell, user avatar dropdown (profile link, logout).
- **PageHeader**: page title + subtitle + action slot (e.g., primary CTA button).

---

## 9. Mock Data & Stubs

The following are explicitly marked as stubs in code with the comment `// STUB: <reason>`:

| Feature | Stub Reason | Implementation |
|---|---|---|
| Global task list across all students | No `/tasks` list-all endpoint | Show "Coming Soon" state or aggregate via student list (page 1) |
| Student name in AppointmentCard | Appointment returns `student_id`, not name | Resolve from cached student list; if not found show UUID last 8 chars |
| Last message preview in conversation list | Conversations endpoint returns no message preview | Show "—" or timestamp only |
| CSV/Excel export in Reports | No export endpoint | Client-side CSV via `json2csv` from fetched data |
| Real-time messaging / WebSocket | API uses REST only | Poll every 10s in active chat view (configurable via env var `NEXT_PUBLIC_CHAT_POLL_INTERVAL`) |
| Dashboard "Applied Abroad" breakdown | Available in `OverviewReport.applied_abroad` | Show as number card only, no country breakdown |
| Student avatar upload | `UserUpdate` accepts `avatar_url` as string only | Show URL input; no file upload for avatars |
| Notification real-time push | REST polling only | Poll `/notifications/unread-count` every 30s |

---

## 10. Routing & Navigation

### 10.1 Navigation Structure

**Primary Sidebar Navigation** (icons + labels):

```
Dashboard          /dashboard
Students           /students
Tasks              /tasks            (STUB: aggregate view)
Appointments       /appointments
Messages           /messages
─── Content ───
Universities       /universities
News               /news
Calendar           /calendar
Alumni             /alumni
FAQ                /faq
─── Tools ───
Roadmaps           /roadmaps         (added, not in Figma)
─── Analytics ───
Reports            /reports
─── Account ───
Settings           /settings
```

### 10.2 URL State

Use URL search params for:
- List filters (group_type, course_year, ielts_passed, sat_passed, search)
- Pagination (page)
- Student detail active tab
- Reports active tab

This enables shareable/bookmarkable URLs.

### 10.3 Redirects

| Condition | Redirect |
|---|---|
| Unauthenticated access to protected route | `/login?next=<path>` |
| Authenticated access to `/login` | `/dashboard` |
| Successful login | `/dashboard` or `?next` value |
| Unknown route | `/dashboard` (with 404 inline or toast) |

---

## 11. Error Handling & Loading States

### 11.1 Loading States

Every data-fetching component must handle:
- **Skeleton loading**: show skeleton placeholders matching the content shape during initial load
- **Spinner**: show centered spinner for page-level loading (route transitions)
- **Button loading state**: disable + show spinner on submit actions

### 11.2 Error States

- **API 401 / session expired**: auto-redirect to `/login` with "Session expired" toast
- **API 403**: inline "You don't have permission" error state
- **API 404**: inline `<EmptyState>` component
- **API 422**: map `detail` array to field-level form errors
- **API 500**: show generic error toast "Something went wrong. Please try again."
- **Network error**: show "No connection" toast, auto-retry on reconnect

### 11.3 Empty States

All list views must have a distinct `<EmptyState>` when the API returns an empty array:
- Icon relevant to the section
- Descriptive message
- CTA button where appropriate (e.g., "Invite first student", "Create first roadmap")

### 11.4 Optimistic Updates

Applied to:
- Task status change (Kanban drag-and-drop): immediately update UI, revert on error
- Mark notification as read: immediately update unread count badge

---

## 12. Accessibility & i18n

### 12.1 Accessibility

- All interactive elements are keyboard-navigable (tab order, focus rings)
- ARIA labels on icon-only buttons
- Color is never the only indicator (icons + text for status)
- Modal focus trapping via Radix Dialog
- Minimum touch target size: 44×44px
- Contrast ratio: WCAG AA (4.5:1 for text, 3:1 for UI components)

### 12.2 Internationalization

- Primary language: **English** (default)
- Secondary language: **Russian** (Kazakhstani market)
- Use `next-intl` library with locale files in `/messages/{locale}.json`
- All user-facing strings must be externalized — no hardcoded English strings in JSX
- Date/time formatting must respect locale (use `date-fns/locale`)
- Currency: USD (used for tuition fields)

---

## 13. Testing Strategy

### 13.1 Unit Tests (Vitest + React Testing Library)

- All `useX` API hooks: mock Axios, verify query keys and return shapes
- All form components: test validation, submission, error display
- All utility functions in `/lib/`
- Target: **80%+ coverage** on hooks and utilities

### 13.2 Integration Tests

- Auth flow: login → redirect → session validation → logout
- Student CRUD: list → filter → open detail → edit profile → upload document
- Task board: create task → drag to in_progress → drag to done → verify API calls

### 13.3 E2E Tests (Playwright)

Critical paths:
1. Login → Dashboard load with KPI cards
2. Invite student → appears in student list
3. Create task → change status → appears in Done column
4. Send message → appears in conversation thread
5. Create appointment slot → student books → ADVISER completes

### 13.4 Storybook

Every component in `/components/ui/` must have:
- Default story
- All variant stories
- Interactive controls (args)
- Accessibility plugin enabled

---

## 14. Performance Requirements

| Metric | Target |
|---|---|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.1 |
| Bundle size (initial JS) | < 250KB gzipped |

### Strategies:
- Code splitting per route (Next.js App Router handles this automatically)
- Image optimization via `next/image`
- React Query caching reduces redundant API calls
- Virtualized lists (via `@tanstack/react-virtual`) for student list > 50 items
- Lazy load heavy components (calendar, charts) with `React.lazy`

---

## 15. Deliverables & Acceptance Criteria

### 15.1 Deliverables

1. Full Next.js application source code (TypeScript, ESLint clean)
2. `/src/types/api.ts` — complete OpenAPI type mappings
3. Storybook build with all UI kit components
4. Test suite passing (80%+ coverage on hooks/utils)
5. `README.md` with:
   - Setup instructions
   - Environment variables list
   - API base URL configuration
   - Running tests and Storybook

### 15.2 Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_CHAT_POLL_INTERVAL=10000     # ms
NEXT_PUBLIC_NOTIFICATION_POLL_INTERVAL=30000  # ms
```

### 15.3 Acceptance Criteria

| # | Criterion |
|---|---|
| 1 | All OpenAPI-defined fields are typed correctly with no `any` usage |
| 2 | `BearerAuth` token is injected automatically on every protected request |
| 3 | Token refresh happens transparently on 401 without user action |
| 4 | Role guard prevents non-ADVISER users from accessing the dashboard |
| 5 | All list pages support pagination, filtering, and search as defined by OpenAPI params |
| 6 | All forms validate against OpenAPI constraints (min, max, format, required) |
| 7 | All STUB sections are clearly marked with `// STUB:` comments |
| 8 | Roadmaps section is accessible from the sidebar and follows the Figma UI kit |
| 9 | Empty states and error states are handled for every list/detail view |
| 10 | Application is keyboard-navigable and passes basic accessibility audit |
| 11 | All Storybook stories render without errors |
| 12 | E2E tests pass for the 5 critical flows listed in 13.3 |

---

*Document prepared for Nobal eduadviser Frontend Project.*
*API source: OpenAPI 3.1.0 — `http://localhost:8000/api/openapi.json`*
*Design source: Figma — `https://www.figma.com/design/V89xlk3ttsGTDx7m3ea661/Nobal-Edu`*
