'use client';

import { useSearchParams } from 'next/navigation';
import { MessagesDashboard } from '@/components/messages/MessagesDashboard';

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student') ?? undefined;

  return <MessagesDashboard initialStudentId={studentId} />;
}
