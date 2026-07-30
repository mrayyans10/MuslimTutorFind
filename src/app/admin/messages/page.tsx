import { getFlaggedMessages } from "@/app/actions/messages";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  const messages = await getFlaggedMessages();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Reported messages</h2>
        <p className="text-sm text-muted-foreground">Review flagged message content.</p>
      </div>

      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No flagged messages.</p>
      ) : (
        messages.map((msg) => (
          <Card key={msg.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {msg.sender.displayName ?? msg.sender.email}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {msg.conversation.subject ?? "Conversation"} ·{" "}
                {new Date(msg.createdAt).toLocaleString()}
              </p>
            </CardHeader>
            <CardContent>
              <Badge className="mb-2">Flagged</Badge>
              <p className="text-sm">{msg.body}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
