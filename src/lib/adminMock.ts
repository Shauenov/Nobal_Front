// ============================================================
// MOCK data layer for the admin panel.
//
// Every function mimics a future REST endpoint (async + latency).
// To go live: replace each body with an `apiClient` call — the
// signatures and return shapes already match the intended API.
// ============================================================

import type {
  AdminStats,
  AdminUser,
  AdminUserListParams,
  AdviserSummary,
  AuditEntry,
  CreateUserInput,
  Paginated,
  Permission,
  Role,
  RoleDef,
  SystemSettings,
} from '@/types/admin';

const latency = <T>(value: T, ms = 350): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const uid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

// ── Seed users ─────────────────────────────────────────────────
const FIRST = ['Айгерим', 'Нурлан', 'Дамир', 'Алия', 'Тимур', 'Жанна', 'Ескендир', 'Камила', 'Арман', 'Дана', 'Бекзат', 'Сабина', 'Ерлан', 'Мадина', 'Олжас', 'Аружан', 'Расул', 'Гульнара', 'Санжар', 'Лаура'];
const LAST = ['Сериков', 'Абдуллаева', 'Ким', 'Нурланова', 'Ахметов', 'Оспанова', 'Жумабеков', 'Ибраева', 'Каримов', 'Сулейменова'];

function seedUsers(): AdminUser[] {
  const users: AdminUser[] = [];
  // 1 admin, 5 advisers, rest students
  const make = (role: Role, i: number): AdminUser => {
    const fn = `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`;
    const active = Math.random() > 0.12;
    return {
      id: uid(),
      email: `${role}${i}@nobal.tech`,
      full_name: fn,
      role,
      is_active: active,
      avatar_url: null,
      created_at: daysAgo(Math.floor(Math.random() * 320) + 5),
      last_login_at: active ? daysAgo(Math.floor(Math.random() * 14)) : null,
    };
  };
  users.push({
    id: uid(),
    email: 'admin@nobal.tech',
    full_name: 'Главный администратор',
    role: 'admin',
    is_active: true,
    avatar_url: null,
    created_at: daysAgo(400),
    last_login_at: daysAgo(0),
  });
  for (let i = 0; i < 5; i++) users.push(make('adviser', i));
  for (let i = 0; i < 28; i++) users.push(make('student', i));
  return users;
}

// In-memory store so create/toggle/delete persist within a session.
let USERS: AdminUser[] = seedUsers();

// ── Users API (mock) ───────────────────────────────────────────
// MOCK: replace with GET /api/v1/users
export async function listUsers(params: AdminUserListParams = {}): Promise<Paginated<AdminUser>> {
  const {
    search = '',
    role = 'all',
    status = 'all',
    sort_by = 'created_at',
    sort_dir = 'desc',
    page = 1,
    page_size = 10,
  } = params;

  let rows = [...USERS];
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter((u) => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }
  if (role !== 'all') rows = rows.filter((u) => u.role === role);
  if (status !== 'all') rows = rows.filter((u) => (status === 'active' ? u.is_active : !u.is_active));

  rows.sort((a, b) => {
    let cmp = 0;
    if (sort_by === 'full_name') cmp = a.full_name.localeCompare(b.full_name);
    else if (sort_by === 'role') cmp = a.role.localeCompare(b.role);
    else cmp = a.created_at.localeCompare(b.created_at);
    return sort_dir === 'asc' ? cmp : -cmp;
  });

  const total = rows.length;
  const start = (page - 1) * page_size;
  return latency({ data: rows.slice(start, start + page_size), meta: { page, page_size, total } });
}

// MOCK: replace with POST /api/v1/users
export async function createUser(input: CreateUserInput): Promise<AdminUser> {
  const user: AdminUser = {
    id: uid(),
    email: input.email,
    full_name: input.full_name,
    role: input.role,
    is_active: true,
    avatar_url: null,
    created_at: new Date().toISOString(),
    last_login_at: null,
  };
  USERS = [user, ...USERS];
  return latency(user, 500);
}

// MOCK: replace with PATCH /api/v1/users/{id}/role
export async function updateUserRole(id: string, role: Role): Promise<AdminUser> {
  USERS = USERS.map((u) => (u.id === id ? { ...u, role } : u));
  return latency(USERS.find((u) => u.id === id)!);
}

// MOCK: replace with PATCH /api/v1/users/{id}/status
export async function setUserActive(id: string, is_active: boolean): Promise<AdminUser> {
  USERS = USERS.map((u) => (u.id === id ? { ...u, is_active } : u));
  return latency(USERS.find((u) => u.id === id)!);
}

// MOCK: replace with DELETE /api/v1/users/{id}
export async function deleteUser(id: string): Promise<{ id: string }> {
  USERS = USERS.filter((u) => u.id !== id);
  return latency({ id });
}

// ── Advisers API (mock) ────────────────────────────────────────
const SPECIALIZATIONS = ['STEM / Инженерия', 'Бизнес и экономика', 'Медицина', 'IT и Computer Science', 'Гуманитарные науки'];

// MOCK: replace with GET /api/v1/advisers
export async function listAdvisers(): Promise<AdviserSummary[]> {
  const advisers = USERS.filter((u) => u.role === 'adviser').map((u, i) => ({
    id: u.id,
    full_name: u.full_name,
    email: u.email,
    avatar_url: u.avatar_url,
    is_active: u.is_active,
    specialization: SPECIALIZATIONS[i % SPECIALIZATIONS.length],
    students_count: 6 + ((i * 7) % 19),
    rating_avg: Math.round((4.1 + Math.random() * 0.9) * 10) / 10,
    reviews_count: 3 + ((i * 5) % 24),
    created_at: u.created_at,
  }));
  return latency(advisers);
}

// ── Roles & permissions (mock) ─────────────────────────────────
const PERMISSIONS: Permission[] = [
  { key: 'students.view', label: 'Просмотр студентов', group: 'Студенты' },
  { key: 'students.delete', label: 'Удаление студентов', group: 'Студенты' },
  { key: 'students.invite', label: 'Приглашение студентов', group: 'Студенты' },
  { key: 'content.manage', label: 'Управление контентом (вузы, новости, FAQ)', group: 'Контент' },
  { key: 'reports.view', label: 'Просмотр отчётов', group: 'Аналитика' },
  { key: 'messages.broadcast', label: 'Массовые рассылки', group: 'Коммуникации' },
  { key: 'users.manage', label: 'Управление пользователями', group: 'Администрирование' },
  { key: 'roles.manage', label: 'Управление ролями', group: 'Администрирование' },
  { key: 'system.manage', label: 'Системные настройки', group: 'Администрирование' },
];

// MOCK: derived from backend require_* gates (app/core/permissions.py)
export async function listPermissions(): Promise<Permission[]> {
  return latency(PERMISSIONS, 200);
}

// MOCK: replace with GET /api/v1/roles
export async function listRoles(): Promise<RoleDef[]> {
  const count = (r: Role) => USERS.filter((u) => u.role === r).length;
  const roles: RoleDef[] = [
    {
      role: 'student',
      label: 'Студент',
      description: 'Доступ к собственному профилю, задачам, маршрутам и записям.',
      userCount: count('student'),
      permissions: [],
    },
    {
      role: 'adviser',
      label: 'Куратор',
      description: 'Управление студентами и контентом, отчёты, рассылки.',
      userCount: count('adviser'),
      permissions: ['students.view', 'students.invite', 'content.manage', 'reports.view', 'messages.broadcast'],
    },
    {
      role: 'admin',
      label: 'Администратор',
      description: 'Полный доступ, включая удаление студентов и системные настройки.',
      userCount: count('admin'),
      permissions: PERMISSIONS.map((p) => p.key),
    },
  ];
  return latency(roles, 250);
}

// ── System (mock) ──────────────────────────────────────────────
let SETTINGS: SystemSettings = {
  brand_name: 'Nobal Education',
  email_host: 'smtp.nobal.tech',
  email_port: 587,
  email_from_name: 'Nobal Education',
  email_from_address: 'no-reply@nobal.tech',
  max_document_size_mb: 10,
  max_image_size_mb: 5,
  signups_enabled: true,
  maintenance_mode: false,
};

// MOCK: replace with GET /api/v1/system/settings
export async function getSystemSettings(): Promise<SystemSettings> {
  return latency(SETTINGS, 250);
}

// MOCK: replace with PUT /api/v1/system/settings
export async function updateSystemSettings(patch: Partial<SystemSettings>): Promise<SystemSettings> {
  SETTINGS = { ...SETTINGS, ...patch };
  return latency(SETTINGS, 500);
}

const ACTIONS = [
  ['Вход в систему', 'info'],
  ['Создан пользователь', 'info'],
  ['Изменена роль', 'warning'],
  ['Студент удалён', 'critical'],
  ['Обновлены настройки', 'warning'],
  ['Массовая рассылка', 'info'],
  ['Деактивирован аккаунт', 'warning'],
] as const;

function seedAudit(n: number): AuditEntry[] {
  return Array.from({ length: n }).map((_, i) => {
    const [action, severity] = ACTIONS[i % ACTIONS.length];
    return {
      id: uid(),
      actor: i % 3 === 0 ? 'admin@nobal.tech' : `adviser${i % 5}@nobal.tech`,
      action,
      target: `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`,
      ip: `185.12.${(i * 7) % 255}.${(i * 13) % 255}`,
      severity,
      created_at: new Date(Date.now() - i * 3_600_000).toISOString(),
    };
  });
}

const AUDIT = seedAudit(40);

// MOCK: replace with GET /api/v1/system/audit
export async function listAudit(): Promise<AuditEntry[]> {
  return latency(AUDIT, 300);
}

// ── Dashboard stats (mock + real where available is wired in hooks) ──
// MOCK: aggregate; real counts can come from GET /api/v1/reports/overview
export async function getAdminStats(): Promise<AdminStats> {
  const by_role = {
    student: USERS.filter((u) => u.role === 'student').length,
    adviser: USERS.filter((u) => u.role === 'adviser').length,
    admin: USERS.filter((u) => u.role === 'admin').length,
  };
  const active = USERS.filter((u) => u.is_active).length;
  const months = ['Дек', 'Янв', 'Фев', 'Мар', 'Апр', 'Май'];
  let running = 8;
  const growth = months.map((m) => {
    running += 4 + Math.floor(Math.random() * 9);
    return { month: m, users: running };
  });
  return latency({
    total_users: USERS.length,
    by_role,
    active_users: active,
    inactive_users: USERS.length - active,
    total_universities: 0, // overridden by real useUniversities count in the dashboard
    growth,
    recent_activity: AUDIT.slice(0, 6),
  });
}
