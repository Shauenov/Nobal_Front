import { MessagesDashboard } from '@/components/messages/MessagesDashboard';

interface MessagesConversationPageProps {
  params: Promise<{ convoId: string }>;
}

export default async function MessagesConversationPage({ params }: MessagesConversationPageProps) {
  const { convoId } = await params;

  return <MessagesDashboard initialConvoId={convoId} />;
}