import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | string,
  currency = "CAD",
  locale = "en-CA",
) {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function absoluteUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4000";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}
