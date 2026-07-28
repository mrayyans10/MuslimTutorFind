"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { cn } from "@/lib/utils";

type Participant = {
  user: { id: string; displayName: string | null; legalName: string | null };
};

type ConversationItem = {
  id: string;
  subject: string | null;
  updatedAt: Date;
  participants: Participant[];
  messages: { body: string; createdAt: Date; senderId: string }[];
};

type ConversationListProps = {
  conversations: ConversationItem[];
  currentUserId: string;
  basePath: string;
  activeId?: string;
};

function displayName(user: { displayName: string | null; legalName: string | null }) {
  return user.displayName ?? user.legalName ?? "User";
}

export function ConversationList({
  conversations,
  currentUserId,
  basePath,
  activeId,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        No conversations yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {conversations.map((conversation) => {
        const others = conversation.participants
          .filter((p) => p.user.id !== currentUserId)
          .map((p) => displayName(p.user))
          .join(", ");
        const lastMessage = conversation.messages[0];
        const isActive = activeId === conversation.id;

        return (
          <li key={conversation.id}>
            <Link
              href={`${basePath}/${conversation.id}`}
              className={cn(
                "block rounded-lg border px-4 py-3 transition-colors",
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm">
                  {conversation.subject || others || "Conversation"}
                </p>
                {lastMessage ? (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                  </span>
                ) : null}
              </div>
              {others && conversation.subject ? (
                <p className="text-xs text-muted-foreground">{others}</p>
              ) : null}
              {lastMessage ? (
                <p className="mt-1 truncate text-sm text-muted-foreground">{lastMessage.body}</p>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
