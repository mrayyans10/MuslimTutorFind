import { LEGAL_DRAFT_NOTICE } from "@config/product";

export function LegalDraftNotice() {
  return (
    <div className="rounded-lg border border-amber/30 bg-amber/10 px-4 py-3 text-sm text-foreground">
      <strong className="font-semibold">Legal notice:</strong> {LEGAL_DRAFT_NOTICE}
    </div>
  );
}
