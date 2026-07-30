import Link from "next/link";

import { getConversations } from "@/app/actions/messages";
import { ConversationList } from "@/components/messaging/conversation-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const session = await requireSession();
  const conversations = await getConversations();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Messages</h2>
        <p className="text-sm text-muted-foreground">Your conversations with tutors.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ConversationList
            conversations={conversations}
            currentUserId={session.user.id}
            basePath="/dashboard/messages"
          />
        </div>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Select a conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Choose a conversation from the list, or message a tutor from their profile or an
              application.
            </p>
            <Link href="/find-tutors" className="mt-4 inline-block text-sm text-primary hover:underline">
              Browse tutors
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
