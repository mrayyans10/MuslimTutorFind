import { MarketingShell } from "@/components/layout/marketing-shell";

export default function ConnectLayout({ children }: { children: React.ReactNode }) {
  return <MarketingShell>{children}</MarketingShell>;
}
