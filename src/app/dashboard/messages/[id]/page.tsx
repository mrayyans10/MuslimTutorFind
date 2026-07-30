import Link from "next/link";
import { notFound } from "next/navigation";

import { getConversation, getConversations } from "@/app/actions/messages";
import { ConversationList } from "@/components/messaging/conversation-list";
import { MessageThread } from "@/components/messaging/message-thread";
import { requireSession } from "@/lib/auth/session";

export const metadata = { title: "Conversation" };

export default async function MessageThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  const [conversations, conversation] = await Promise.all([
    getConversations(),
    getConversation(id),
  ]);

  if (!conversation) notFound();

  return (
    <div className="space-y-4">
      <Link href="/dashboard/messages" className="text-sm text-primary hover:underline">
        ← Back to messages
      </Link>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="hidden lg:col-span-1 lg:block">
          <ConversationList
            conversations={conversations}
            currentUserId={session.user.id}
            basePath="/dashboard/messages"
            activeId={id}
          />
        </div>
        <div className="lg:col-span-2">
          <MessageThread
            conversationId={id}
            messages={conversation.messages}
            currentUserId={session.user.id}
          />
        </div>
      </div>
    </div>
  );
}
