"use client";

import { useActionState } from "react";
import { format } from "date-fns";

import { sendMessageAction, type ActionState } from "@/app/actions/messages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  body: string;
  createdAt: Date;
  senderId: string;
  sender: { id: string; displayName: string | null; legalName: string | null };
};

type MessageThreadProps = {
  conversationId: string;
  messages: Message[];
  currentUserId: string;
};

const initialState: ActionState = {};

export function MessageThread({ conversationId, messages, currentUserId }: MessageThreadProps) {
  const boundAction = sendMessageAction.bind(null, conversationId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <div className="flex h-full min-h-[400px] flex-col rounded-xl border border-border">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No messages yet. Say hello!</p>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                className={cn("flex", isOwn ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {!isOwn ? (
                    <p className="mb-1 text-xs font-medium opacity-70">
                      {message.sender.displayName ?? message.sender.legalName ?? "User"}
                    </p>
                  ) : null}
                  <p className="whitespace-pre-wrap">{message.body}</p>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      isOwn ? "text-primary-foreground/70" : "text-muted-foreground",
                    )}
                  >
                    {format(new Date(message.createdAt), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form action={formAction} className="border-t border-border p-4">
        {state.message && !state.success ? (
          <p className="mb-2 text-sm text-destructive">{state.message}</p>
        ) : null}
        <div className="flex gap-2">
          <Textarea
            name="body"
            placeholder="Type your message…"
            rows={2}
            className="min-h-[60px] resize-none"
            required
          />
          <Button type="submit" disabled={pending} className="self-end">
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
