# Nobal Education Frontend — Technical Guide

## 📁 Project Structure

```
Frontend/src/
├── app/                        # Next.js App Router
│   ├── (auth)/                # login, register (no layout wrapper)
│   │   ├── layout.tsx
│   │   ├── page.tsx           # /auth (redirects to login)
│   │   ├── login/
│   │   │   └── page.tsx       # /auth/login
│   │   └── register/
│   │       └── page.tsx       # /auth/register
│   │
│   ├── (conductor)/           # protected routes (wrapped with ProtectedLayout)
│   │   ├── layout.tsx         # auth check, sidebar, header
│   │   ├── page.tsx           # /dashboard
│   │   ├── appointments/
│   │   ├── messages/
│   │   ├── calendar/
│   │   ├── tasks/
│   │   ├── profile/
│   │   └── ...
│   │
│   ├── layout.tsx             # root layout (providers, globals)
│   ├── page.tsx               # / (redirect to dashboard)
│   └── globals.css            # tailwind imports
│
├── components/                # Radix UI + custom React components
│   ├── appointments/
│   ├── messages/
│   ├── calendar/
│   ├── tasks/
│   ├── layout/
│   └── ui/                    # shared primitives (Button, Card, Input, etc.)
│
├── hooks/                     # TanStack Query custom hooks
│   ├── useAuth.ts             # user, login, logout, register
│   ├── useAppointments.ts     # list, create, update appointments
│   ├── useMessages.ts
│   ├── useTasks.ts
│   └── ...
│
├── lib/
│   ├── apiClient.ts           # axios instance with JWT interceptor + auto-refresh
│   └── utils.ts               # formatting, date helpers
│
├── stores/                    # Zustand global state
│   ├── authStore.ts           # user, token, isAuthenticated, login/logout
│   └── uiStore.ts             # theme, sidebarOpen, etc.
│
├── styles/
│   ├── tokens.css             # design tokens (colors, spacing, typography)
│   └── globals.css            # global Tailwind + imports
│
├── types/                     # TypeScript DTOs matching backend schemas
│   ├── auth.ts                # User, AccessToken, LoginRequest
│   ├── appointments.ts        # Appointment, AppointmentCreate
│   ├── messages.ts
│   └── ...
│
├── i18n.config.ts            # next-intl configuration (en, ru)
├── next.config.ts
├── tsconfig.json
├── package.json
└── vitest.config.ts
```

## 🔗 API Integration

### Shared Axios Client

```typescript
// src/lib/apiClient.ts
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT Bearer token interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // refresh token and retry
    }
    return Promise.reject(error);
  }
);
```

### TanStack Query Hooks

```typescript
// src/hooks/useAppointments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Appointment, AppointmentCreate } from '@/types/appointments';

export function useAppointments() {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data } = await apiClient.get('/appointments');
      return data.data as Appointment[];  // unwrap SuccessResponse
    },
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: AppointmentCreate) => {
      const { data } = await apiClient.post('/appointments', payload);
      return data.data as Appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}
```

## 🏪 Zustand State Management

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (email, password) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('access_token', data.data.access_token);
    set({ isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    set({ user: null, isAuthenticated: false });
  },
}));
```

## 📝 TypeScript DTOs

**CRITICAL:** Types must match `Backend/app/modules/*/schemas.py` exactly.

```typescript
// src/types/appointments.ts
export interface Appointment {
  id: string;
  title: string;
  scheduled_at: string;     // ISO 8601
  duration_minutes: number;
  instructor_id: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface AppointmentCreate {
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  instructor_id: string;
}
```

## 🎨 Component Pattern

```typescript
// src/components/appointments/BookingForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateAppointment } from '@/hooks/useAppointments';

const schema = z.object({
  title: z.string().min(1),
  scheduled_at: z.string(),
  duration_minutes: z.number().min(15),
});

export function BookingForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });
  
  const { mutate: create, isPending } = useCreateAppointment();
  
  return (
    <form onSubmit={handleSubmit((data) => create(data))}>
      <Input {...register('title')} placeholder="Title" />
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Booking...' : 'Book'}
      </Button>
    </form>
  );
}
```

## 📤 File Upload (FormData)

```typescript
export function useUploadAvatar() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      // DO NOT set Content-Type — axios will handle it
      const { data } = await apiClient.post('/users/me/avatar', formData);
      return data.data;
    },
  });
}
```

## 🛡️ Protected Routes

```typescript
// src/app/(conductor)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function ConductorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);
  
  if (!isAuthenticated) return null;
  
  return <div>{children}</div>;
}
```

## 🌐 Internationalization

```typescript
// src/i18n.config.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: locale === 'ru'
    ? (await import('@/messages/ru.json')).default
    : (await import('@/messages/en.json')).default,
}));
```

Usage:
```typescript
import { useTranslations } from 'next-intl';

export function Header() {
  const t = useTranslations('common');
  return <h1>{t('welcome')}</h1>;
}
```

## 🎯 Key Patterns

✅ **DO:**
```typescript
const { data } = useAppointments();           // hooks
const { data } = await apiClient.get('/...');  // client
```

❌ **DON'T:**
```typescript
const response = await fetch('http://localhost:...');  // no interceptors
```

## 🚀 Quick Start

```bash
cd Frontend
npm install
npm run dev      # http://localhost:3000
npm run test
npm run lint
npm run build
```

---

**Last Updated:** May 17, 2026  
**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Radix UI  
**State:** Zustand + TanStack React Query
