import { SECULAR_SUBJECTS_NOTICE } from "@config/product";
import { BookOpen } from "lucide-react";

export function SecularNotice({ className }: { className?: string }) {
  return (
    <div
      className={`flex gap-3 rounded-xl border border-primary/20 bg-secondary/60 p-4 text-sm leading-relaxed text-foreground ${className ?? ""}`}
    >
      <BookOpen className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
      <p>{SECULAR_SUBJECTS_NOTICE}</p>
    </div>
  );
}
