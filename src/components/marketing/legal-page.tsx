import { LEGAL_DRAFT_NOTICE } from "@config/product";
import { LegalDraftNotice } from "@/components/marketing/legal-notice";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page max-w-3xl py-10">
      <LegalDraftNotice />
      <h1 className="mt-6 font-display text-3xl font-semibold sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{LEGAL_DRAFT_NOTICE}</p>
      <div className="prose prose-neutral mt-8 max-w-none space-y-4 text-muted-foreground">
        {children}
      </div>
    </div>
  );
}
