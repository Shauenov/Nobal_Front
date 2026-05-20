// ============================================================
// Nobal EduConductor — API Types
// Source: OpenAPI 3.1.0 — http://localhost:8000/api/openapi.json
// ============================================================

// ── Group type ────────────────────────────────────────────────
export type GroupType = 'D' | 'D1' | 'D2' | 'F' | 'F1' | 'F2' | 'F3' | 'F4';

// ── Generic Envelope ──────────────────────────────────────────
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export interface PaginatedMeta {
  page: number;
  page_size: number;
  total: number;
}

export interface PaginatedEnvelope<T> {
  success: boolean;
  data: T[];
  meta: PaginatedMeta;
}

export interface SuccessResponse {
  success: boolean;
  data?: unknown;
}

export interface ApiError {
  status: number;
  message: string;
  detail?: ValidationError[];
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

// ── Auth ──────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  full_name: string;
  password: string;
  group_type: GroupType;
  course_year: 2 | 3;
  gpa?: number | null;
  ielts_passed?: boolean;
  ielts_score?: number | null;
  sat_passed?: boolean;
  sat_score?: number | null;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface UserBrief {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string | null;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  user: UserBrief;
}

export interface AccessTokenResponse {
  access_token: string;
  refresh_token: string;
}

// ── Users ─────────────────────────────────────────────────────
export interface UserOut {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
}

export interface UserUpdate {
  full_name?: string | null;
  avatar_url?: string | null;
}

export interface InviteStudentRequest {
  email: string;
  full_name: string;
  password: string;
}

// ── Students ──────────────────────────────────────────────────
export interface StudentListItem {
  id: string;
  full_name: string;
  email: string;
  group_type?: string | null;
  course_year?: number | null;
  gpa?: number | null;
  ielts_passed?: boolean | null;
  ielts_score?: number | null;
  sat_passed?: boolean | null;
  avatar_url?: string | null;
  tasks_total: number;
  tasks_done: number;
  unread_messages: number;
}

export interface StudentDetail {
  user: UserOut;
  profile: ProfileOut | null;
  documents: DocumentOut[];
  active_roadmap: StudentRoadmapOut | null;
  tasks_summary: Record<string, number>;
  next_appointment: AppointmentOut | null;
}

export type PaginatedStudents = PaginatedEnvelope<StudentListItem>;

// Student filter params
export interface StudentListParams {
  group_type?: GroupType | null;
  course_year?: 2 | 3 | null;
  ielts_passed?: boolean | null;
  sat_passed?: boolean | null;
  search?: string | null;
  page?: number;
  page_size?: number;
}

// ── Profile ───────────────────────────────────────────────────
export interface ProfileOut {
  id: string;
  user_id: string;
  group_type: GroupType;
  course_year: number;
  gpa?: string | null;
  ielts_passed: boolean;
  ielts_score?: string | null;
  ielts_date?: string | null;
  sat_passed: boolean;
  sat_score?: number | null;
  sat_date?: string | null;
  ent_score?: number | null;
  kta_score?: number | null;
  target_country?: string | null;
  target_major?: string | null;
  notes?: string | null;
  phone?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  birth_date?: string | null;
  school_name?: string | null;
  degree_level?: 'bachelor' | 'master' | 'phd' | null;
  target_countries?: string[];
  budget_max?: number | null;
}

export interface ProfileUpdate {
  group_type?: GroupType | null;
  course_year?: number | null;
  gpa?: number | null;
  ielts_passed?: boolean | null;
  ielts_score?: number | null;
  ielts_date?: string | null;
  sat_passed?: boolean | null;
  sat_score?: number | null;
  sat_date?: string | null;
  ent_score?: number | null;
  kta_score?: number | null;
  target_country?: string | null;
  target_major?: string | null;
  notes?: string | null;
  phone?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  birth_date?: string | null;
  school_name?: string | null;
  degree_level?: 'bachelor' | 'master' | 'phd' | null;
  target_countries?: string[] | null;
  budget_max?: number | null;
}

// ── Documents ─────────────────────────────────────────────────
export type DocumentCategory = 'personal' | 'education' | 'financial' | 'other';
export type DocumentStatus = 'active' | 'pending' | 'expired' | 'needs_update';

export interface DocumentOut {
  id: string;
  student_id: string;
  doc_type: string;
  category: DocumentCategory;
  status: DocumentStatus;
  expires_at: string | null;
  url: string;
  content_type: string;
  size: number;
  created_at: string;
}

export interface DocumentUploadResponse {
  id: string;
  doc_type: string;
  category: string;
  status: string;
  url: string;
}

export const DOC_TYPES = [
  'passport',
  'transcript',
  'ielts_certificate',
  'sat_certificate',
  'recommendation_letter',
  'personal_statement',
  'other',
] as const;

export type DocType = typeof DOC_TYPES[number];

// ── Tasks ─────────────────────────────────────────────────────
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskType = 'deadline' | 'assignment';

export interface TaskOut {
  id: string;
  student_id: string;
  created_by: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  task_type: TaskType;
  deadline: string | null;
  time_from: string | null;
  time_to: string | null;
  location: string | null;
  reminder_minutes: number | null;
  completed_at: string | null;
  is_conductor_task: boolean;
  student_roadmap_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  task_type?: TaskType;
  deadline?: string | null;
  time_from?: string | null;
  time_to?: string | null;
  location?: string | null;
  reminder_minutes?: number | null;
  student_roadmap_id?: string | null;
}

export interface TaskUpdate {
  title?: string | null;
  description?: string | null;
  priority?: TaskPriority | null;
  task_type?: TaskType | null;
  deadline?: string | null;
  time_from?: string | null;
  time_to?: string | null;
  location?: string | null;
  reminder_minutes?: number | null;
}

export interface TaskStatsOut {
  total: number;
  completed: number;
  overdue: number;
  in_progress: number;
  todo: number;
}

export interface TaskStatusUpdate {
  status: TaskStatus;
}

export type PaginatedTasks = PaginatedEnvelope<TaskOut>;

export interface TaskListParams {
  status?: TaskStatus | null;
  is_conductor_task?: boolean | null;
  page?: number;
  page_size?: number;
}

// ── Appointments ──────────────────────────────────────────────
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type ConsultationType = 'video' | 'audio' | 'chat';

export interface SlotOut {
  id: string;
  conductor_id: string;
  start_time: string;
  end_time: string;
  duration_min: number;
  is_available: boolean;
}

export interface SlotCreate {
  start_time: string;
  end_time?: string | null;
  duration_min?: number | null;
}

export interface SlotsBatchCreate {
  slots: SlotCreate[];
}

export interface AppointmentOut {
  id: string;
  slot_id: string | null;
  student_id: string;
  conductor_id: string;
  status: AppointmentStatus;
  consultation_type: ConsultationType;
  notes: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string;
  student_name?: string | null;
  student_avatar_url?: string | null;
}

export interface BookRequest {
  slot_id: string;
  consultation_type?: ConsultationType;
  notes?: string | null;
}

export interface CancelRequest {
  reason?: string | null;
}

// ── Messages ──────────────────────────────────────────────────
export interface ConversationOut {
  id: string;
  student_id: string;
  conductor_id: string;
  last_message_at?: string | null;
  created_at: string;
}

export interface MessageOut {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name?: string | null;
  sender_role?: string | null;
  body: string;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  // Image fields (optional)
  image_url?: string | null;
  image_content_type?: string | null;
  image_size?: number | null;
}

export interface SendMessageRequest {
  body: string;
}

export interface BroadcastRequest {
  body?: string | null;
  filter_group?: string | null;
  ielts_passed?: boolean | null;
}

export interface BroadcastResult {
  sent: number;
  // Optional list of created message IDs so frontend can update UI without extra fetch
  message_ids?: string[];
}

// ── Universities ──────────────────────────────────────────────
export type DegreeLevel = 'bachelor' | 'master' | 'phd' | 'foundation';

export interface UniversityOut {
  id: string;
  name: string;
  country: string;
  city?: string | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  website_url?: string | null;
  description?: string | null;
  acceptance_rate?: number | null;
  total_students?: number | null;
  international_pct?: number | null;
  qs_ranking?: number | null;
  the_ranking?: number | null;
  language_of_instr?: string | null;
  is_published: boolean;
  last_verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UniversityCreate {
  name: string;
  country: string;
  city?: string | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  website_url?: string | null;
  description?: string | null;
  acceptance_rate?: number | null;
  total_students?: number | null;
  international_pct?: number | null;
  qs_ranking?: number | null;
  the_ranking?: number | null;
  language_of_instr?: string | null;
  is_published?: boolean;
  last_verified_at?: string | null;
}

export type UniversityUpdate = Partial<UniversityCreate>;

export interface UniversityProgramOut {
  id: string;
  university_id: string;
  name: string;
  degree_level?: DegreeLevel | null;
  field?: string | null;
  min_gpa?: number | null;
  min_ielts?: number | null;
  min_sat?: number | null;
  tuition_usd?: number | null;
  scholarship_info?: string | null;
  application_fee?: number | null;
  intake_seasons?: string | null;
  deadline?: string | null;
  campus_life?: string | null;
  requirements_text?: string | null;
  apply_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UniversityProgramCreate {
  name: string;
  degree_level?: DegreeLevel | null;
  field?: string | null;
  min_gpa?: number | null;
  min_ielts?: number | null;
  min_sat?: number | null;
  tuition_usd?: number | null;
  scholarship_info?: string | null;
  application_fee?: number | null;
  intake_seasons?: string | null;
  deadline?: string | null;
  campus_life?: string | null;
  requirements_text?: string | null;
  apply_url?: string | null;
  is_active?: boolean;
}

export type UniversityProgramUpdate = Partial<UniversityProgramCreate>;

export interface UniversityDetail {
  university: UniversityOut;
  programs: UniversityProgramOut[];
}

export type PaginatedUniversities = PaginatedEnvelope<UniversityOut>;

export interface UniversityListParams {
  country?: string | null;
  field?: string | null;
  min_gpa?: number | null;
  max_tuition?: number | null;
  degree_level?: string | null;
  has_scholarship?: boolean | null;
  search?: string | null;
  page?: number;
  page_size?: number;
}

// ── Roadmaps ──────────────────────────────────────────────────
export interface RoadmapOut {
  id: string;
  title: string;
  description: string | null;
  target_type: string | null;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RoadmapTemplateTaskOut {
  id: string;
  roadmap_id: string;
  title: string;
  description?: string | null;
  order_index: number;
  days_offset?: number | null;
  created_at: string;
}

export interface RoadmapTemplateTaskCreate {
  title: string;
  description?: string | null;
  order_index: number;
  days_offset?: number | null;
}

export interface RoadmapCreate {
  title: string;
  description?: string | null;
  target_type?: string | null;
  is_public?: boolean;
  template_tasks?: RoadmapTemplateTaskCreate[];
}

export interface RoadmapUpdate {
  title?: string | null;
  description?: string | null;
  target_type?: string | null;
  is_public?: boolean | null;
}

export interface RoadmapDetail {
  roadmap: RoadmapOut;
  template_tasks: RoadmapTemplateTaskOut[];
}

export interface StudentRoadmapOut {
  id: string;
  student_id: string;
  roadmap_id: string | null;
  assigned_by: string;
  title: string;
  assigned_at: string;
  is_active: boolean;
}

export interface TemplateTaskOverride {
  template_task_id: string;
  deadline: string;
}

export interface AssignRequest {
  student_id: string;
  customize_tasks?: TemplateTaskOverride[];
}

export type PaginatedRoadmaps = PaginatedEnvelope<RoadmapOut>;

// ── News ──────────────────────────────────────────────────────
export type NewsCategory =
  | 'olympiad'
  | 'hackathon'
  | 'deadline'
  | 'summer_camp'
  | 'webinar'
  | 'internship'
  | 'university_news'
  | 'general';

export interface NewsOut {
  id: string;
  author_id: string;
  title: string;
  body: string;
  cover_url?: string | null;
  category: NewsCategory;
  event_date?: string | null;
  external_url?: string | null;
  is_published: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface NewsCreate {
  title: string;
  body: string;
  cover_url?: string | null;
  category: NewsCategory;
  event_date?: string | null;
  external_url?: string | null;
  is_published?: boolean;
}

export type NewsUpdate = Partial<NewsCreate>;

export interface AddToCalendarRequest {
  reminder_days_before?: number | null;
}

export type PaginatedNews = PaginatedEnvelope<NewsOut>;

export interface NewsListParams {
  category?: string | null;
  upcoming?: boolean | null;
  page?: number;
  page_size?: number;
}

// ── Calendar ──────────────────────────────────────────────────
export type CalendarEventType =
  | 'appointment'
  | 'task_deadline'
  | 'news_event'
  | 'university_deadline'
  | 'custom';

export interface CalendarEventOut {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_type: CalendarEventType;
  start_time: string;
  end_time: string | null;
  all_day: boolean;
  color: string;
  source_id: string | null;
  source_type: string | null;
  created_at: string;
}

export interface CalendarEventCreate {
  title: string;
  description?: string | null;
  event_type: CalendarEventType;
  start_time: string;
  end_time?: string | null;
  all_day?: boolean;
  color?: string | null;
  source_id?: string | null;
  source_type?: string | null;
}

export interface CalendarEventUpdate {
  title?: string | null;
  description?: string | null;
  event_type?: CalendarEventType | null;
  start_time?: string | null;
  end_time?: string | null;
  all_day?: boolean | null;
  color?: string | null;
}

// ── FAQ ───────────────────────────────────────────────────────
export interface FAQOut {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
  order_index: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FAQCreate {
  question: string;
  answer: string;
  category?: string | null;
  order_index?: number | null;
  is_active?: boolean;
}

export type FAQUpdate = Partial<FAQCreate>;

export interface ReorderItem {
  id: string;
  order_index: number;
}

export interface ReorderRequest {
  items: ReorderItem[];
}

// ── Alumni ────────────────────────────────────────────────────
export interface AlumniOut {
  id: string;
  author_id: string;
  student_name: string;
  graduation_year?: number | null;
  university_id?: string | null;
  university_name?: string | null;
  program_name?: string | null;
  scholarship_type?: string | null;
  story_text: string;
  photo_url?: string | null;
  gpa_at_time?: number | null;
  ielts_at_time?: number | null;
  sat_at_time?: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlumniCreate {
  student_name: string;
  story_text: string;
  graduation_year?: number | null;
  university_id?: string | null;
  university_name?: string | null;
  program_name?: string | null;
  scholarship_type?: string | null;
  photo_url?: string | null;
  gpa_at_time?: number | null;
  ielts_at_time?: number | null;
  sat_at_time?: number | null;
  is_published?: boolean;
}

export type AlumniUpdate = Partial<AlumniCreate>;

// ── Notifications ─────────────────────────────────────────────
export interface NotificationOut {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  type: string;
  is_read: boolean;
  read_at: string | null;
  source_id: string | null;
  source_type: string | null;
  created_at: string;
}

export interface UnreadCountOut {
  count: number;
}

export interface NotificationSettingsOut {
  push_enabled: boolean;
  email_enabled: boolean;
  deadline_alerts: boolean;
  roadmap_changes: boolean;
  new_messages: boolean;
  task_updates: boolean;
  security_alerts: boolean;
  app_updates: boolean;
}

export interface NotificationSettingsUpdate {
  push_enabled?: boolean | null;
  email_enabled?: boolean | null;
  deadline_alerts?: boolean | null;
  roadmap_changes?: boolean | null;
  new_messages?: boolean | null;
  task_updates?: boolean | null;
  security_alerts?: boolean | null;
  app_updates?: boolean | null;
}

// ── Reports ───────────────────────────────────────────────────
export interface OverviewReport {
  total_students: number;
  by_group: Record<string, number>;
  ielts_passed: number;
  sat_passed: number;
  avg_gpa: number | null;
  tasks_completed_this_month: number;
  appointments_this_month: number;
  applied_abroad: number;
  total_budget_usd: number;
}

export interface TaskHistoryItem {
  id: string;
  task_id: string;
  changed_by: string | null;
  event_type: 'created' | 'status_changed' | 'updated' | 'deleted';
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export interface StudentProgressItem {
  id: string;
  full_name: string;
  group_type?: string | null;
  course_year?: number | null;
  gpa?: number | null;
  ielts_passed: boolean;
  sat_passed: boolean;
  tasks_total: number;
  tasks_done: number;
  tasks_overdue: number;
}

export interface UniversityStats {
  by_target_country: Record<string, number>;
  by_target_major: Record<string, number>;
}

// ── Enrollments ───────────────────────────────────────────────
export type EnrollmentStatus =
  | 'selected'
  | 'applying'
  | 'submitted'
  | 'accepted'
  | 'rejected';

export interface EnrollmentOut {
  id: string;
  student_id: string;
  university_id: string;
  status: EnrollmentStatus;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface StudentBriefForEnrollment {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

export interface EnrollmentWithStudentOut {
  id: string;
  student_id: string;
  student: StudentBriefForEnrollment;
  university_id: string;
  status: EnrollmentStatus;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentUpdateRequest {
  status?: EnrollmentStatus | null;
  progress?: number | null;
}
