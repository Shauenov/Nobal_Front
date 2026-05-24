// ============================================================
// Admin panel types
// Shapes mirror backend models so the MOCK layer can be swapped
// to real endpoints with minimal changes:
//   - AdminUser  ↔  Backend users.models.User (id, email, full_name,
//                   role, is_active, avatar_url, created_at)
// ============================================================

export type Role = 'student' | 'adviser' | 'admin';

export interface Paginated<T> {
  data: T[];
  meta: { page: number; page_size: number; total: number };
}

// ── Users ──────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
  last_login_at: string | null;
}

export interface AdminUserListParams {
  search?: string;
  role?: Role | 'all';
  status?: 'all' | 'active' | 'inactive';
  sort_by?: 'full_name' | 'created_at' | 'role';
  sort_dir?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export interface CreateUserInput {
  email: string;
  full_name: string;
  role: Role;
  password: string;
}

// ── Advisers ───────────────────────────────────────────────────
/** Legacy mock shape — kept for backwards compat during migration */
export interface AdviserSummary {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  is_active: boolean;
  specialization: string;
  students_count: number;
  rating_avg: number;
  reviews_count: number;
  created_at: string;
}

/** Real API shape from GET /api/v1/admin/advisers */
export interface AdminAdviserOut {
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  headline: string | null;
  students_placed: number | null;
  rating_avg: number;
  reviews_count: number;
}

// ── Roles & permissions ────────────────────────────────────────
export interface Permission {
  key: string;
  label: string;
  group: string;
}

export interface RoleDef {
  role: Role;
  label: string;
  description: string;
  userCount: number;
  /** permission keys granted to this role */
  permissions: string[];
}

// ── System ─────────────────────────────────────────────────────
export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
  severity: AuditSeverity;
  created_at: string;
}

export interface SystemSettings {
  brand_name: string;
  email_host: string;
  email_port: number;
  email_from_name: string;
  email_from_address: string;
  max_document_size_mb: number;
  max_image_size_mb: number;
  signups_enabled: boolean;
  maintenance_mode: boolean;
}

// ── Dashboard stats ────────────────────────────────────────────
export interface AdminStats {
  total_users: number;
  by_role: Record<Role, number>;
  active_users: number;
  inactive_users: number;
  /** only present in mock / may be undefined from real API */
  total_universities?: number;
  growth: { month: string; users: number }[];
  /** only present in mock */
  recent_activity?: AuditEntry[];
}
