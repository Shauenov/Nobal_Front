import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 401/403/404
        const status = (error as { status?: number })?.status;
        if (status === 401 || status === 403 || status === 404) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Query key factory for cache invalidation
export const queryKeys = {
  // Auth
  me: ['me'] as const,
  sessions: ['sessions'] as const,

  // Students
  students: (params?: Record<string, unknown>) =>
    params ? ['students', params] : ['students'],
  student: (id: string) => ['student', id] as const,
  studentProfile: (id: string) => ['student', id, 'profile'] as const,
  studentDocuments: (id: string) => ['student', id, 'documents'] as const,
  studentTasks: (id: string, params?: Record<string, unknown>) =>
    params ? ['student', id, 'tasks', params] : ['student', id, 'tasks'],
  studentRoadmaps: (id: string) => ['student', id, 'roadmaps'] as const,

  // Tasks
  task: (id: string) => ['task', id] as const,

  // Appointments
  appointments: ['appointments'] as const,
  myAppointments: ['appointments', 'my'] as const,
  slots: (params?: Record<string, unknown>) =>
    params ? ['slots', params] : ['slots'],

  // Messages
  conversations: ['conversations'] as const,
  myConversation: ['conversations', 'my'] as const,
  messages: (convoId: string, params?: Record<string, unknown>) =>
    params ? ['messages', convoId, params] : ['messages', convoId],

  // Universities
  universities: (params?: Record<string, unknown>) =>
    params ? ['universities', params] : ['universities'],
  university: (id: string) => ['university', id] as const,

  // Roadmaps
  roadmaps: (params?: Record<string, unknown>) =>
    params ? ['roadmaps', params] : ['roadmaps'],
  roadmap: (id: string) => ['roadmap', id] as const,

  // News
  news: (params?: Record<string, unknown>) =>
    params ? ['news', params] : ['news'],
  newsItem: (id: string) => ['news', id] as const,

  // Calendar
  calendar: (params?: Record<string, unknown>) =>
    params ? ['calendar', params] : ['calendar'],

  // FAQ
  faqs: ['faqs'] as const,

  // Enrollments
  studentEnrollments: (studentId: string) => ['enrollments', 'student', studentId] as const,
  universityEnrollments: (universityId: string, params?: Record<string, unknown>) =>
    params
      ? ['enrollments', 'university', universityId, params]
      : ['enrollments', 'university', universityId],

  // Alumni
  alumni: ['alumni'] as const,
  alumniItem: (id: string) => ['alumni', id] as const,

  // Notifications
  notifications: (params?: Record<string, unknown>) =>
    params ? ['notifications', params] : ['notifications'],
  notificationsUnreadCount: ['notifications', 'unread-count'] as const,
  notificationSettings: ['notification-settings'] as const,

  // Reports
  reportsOverview: ['reports', 'overview'] as const,
  reportsStudents: ['reports', 'students'] as const,
  reportsUniversities: ['reports', 'universities'] as const,
};
