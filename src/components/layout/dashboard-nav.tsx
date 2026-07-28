"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  FileText,
  Home,
  MapPin,
  MessageSquare,
  Search,
  Settings,
  Shield,
  Star,
  User,
  Users,
  Calendar,
  BadgeCheck,
  Scale,
  ScrollText,
  Ban,
  Flag,
  Gavel,
  Sliders,
} from "lucide-react";
import type { UserRole } from "@prisma/client";

import { cn } from "@/lib/utils";
import type { DashboardArea } from "@/components/layout/dashboard-shell";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  adminOnly?: boolean;
};

const studentParentLinks: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: Home, roles: ["STUDENT", "PARENT"] },
  { href: "/dashboard/profile", label: "Profile", icon: User, roles: ["STUDENT", "PARENT"] },
  { href: "/dashboard/learners", label: "Learners", icon: Users, roles: ["PARENT"] },
  { href: "/dashboard/find-your-tutor", label: "Find your tutor", icon: Search, roles: ["STUDENT", "PARENT"] },
  { href: "/dashboard/matches", label: "Matches", icon: Star, roles: ["STUDENT", "PARENT"] },
  { href: "/dashboard/tutoring-requirements", label: "Requirements", icon: ClipboardList, roles: ["STUDENT", "PARENT"] },
  { href: "/dashboard/applications", label: "Applications", icon: FileText, roles: ["STUDENT", "PARENT"] },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare, roles: ["STUDENT", "PARENT"] },
  { href: "/dashboard/reviews", label: "Reviews", icon: Star, roles: ["STUDENT", "PARENT"] },
  { href: "/dashboard/safety", label: "Safety", icon: Shield, roles: ["STUDENT", "PARENT"] },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["STUDENT", "PARENT"] },
];

const tutorLinks: NavItem[] = [
  { href: "/tutor/dashboard", label: "Overview", icon: Home, roles: ["TUTOR"] },
  { href: "/tutor/profile", label: "Profile", icon: User, roles: ["TUTOR"] },
  { href: "/tutor/subjects", label: "Subjects", icon: BookOpen, roles: ["TUTOR"] },
  { href: "/tutor/schedule", label: "Schedule", icon: Calendar, roles: ["TUTOR"] },
  { href: "/tutor/location", label: "Location", icon: MapPin, roles: ["TUTOR"] },
  { href: "/tutor/verification", label: "Verification", icon: BadgeCheck, roles: ["TUTOR"] },
  { href: "/tutor/tutoring-requirements", label: "Requirements", icon: ClipboardList, roles: ["TUTOR"] },
  { href: "/tutor/applications", label: "Applications", icon: FileText, roles: ["TUTOR"] },
  { href: "/tutor/messages", label: "Messages", icon: MessageSquare, roles: ["TUTOR"] },
  { href: "/tutor/reviews", label: "Reviews", icon: Star, roles: ["TUTOR"] },
  { href: "/tutor/safety", label: "Safety", icon: Shield, roles: ["TUTOR"] },
  { href: "/tutor/settings", label: "Settings", icon: Settings, roles: ["TUTOR"] },
];

const adminLinks: NavItem[] = [
  { href: "/admin", label: "Overview", icon: Home, roles: ["MODERATOR", "ADMINISTRATOR"] },
  { href: "/admin/users", label: "Users", icon: Users, roles: ["ADMINISTRATOR"], adminOnly: true },
  { href: "/admin/tutors", label: "Tutors", icon: User, roles: ["MODERATOR", "ADMINISTRATOR"] },
  { href: "/admin/verifications", label: "Verifications", icon: BadgeCheck, roles: ["MODERATOR", "ADMINISTRATOR"] },
  { href: "/admin/subjects", label: "Subjects", icon: BookOpen, roles: ["ADMINISTRATOR"], adminOnly: true },
  { href: "/admin/prohibited-subjects", label: "Prohibited subjects", icon: Ban, roles: ["MODERATOR", "ADMINISTRATOR"] },
  { href: "/admin/tutoring-requirements", label: "Requirements", icon: ClipboardList, roles: ["MODERATOR", "ADMINISTRATOR"] },
  { href: "/admin/applications", label: "Applications", icon: FileText, roles: ["MODERATOR", "ADMINISTRATOR"] },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare, roles: ["MODERATOR", "ADMINISTRATOR"] },
  { href: "/admin/reviews", label: "Reviews", icon: Star, roles: ["MODERATOR", "ADMINISTRATOR"] },
  { href: "/admin/reports", label: "Reports", icon: Flag, roles: ["MODERATOR", "ADMINISTRATOR"] },
  { href: "/admin/moderation", label: "Moderation", icon: Gavel, roles: ["MODERATOR", "ADMINISTRATOR"] },
  { href: "/admin/community-guidelines", label: "Guidelines", icon: ScrollText, roles: ["MODERATOR", "ADMINISTRATOR"] },
  { href: "/admin/matching", label: "Matching", icon: Sliders, roles: ["ADMINISTRATOR"], adminOnly: true },
  { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["ADMINISTRATOR"], adminOnly: true },
  { href: "/admin/audit-logs", label: "Audit logs", icon: Scale, roles: ["ADMINISTRATOR"], adminOnly: true },
];

const linksByArea: Record<DashboardArea, NavItem[]> = {
  dashboard: studentParentLinks,
  tutor: tutorLinks,
  admin: adminLinks,
};

export interface DashboardNavProps {
  area: DashboardArea;
  role: UserRole;
  className?: string;
}

export function DashboardNav({ area, role, className }: DashboardNavProps) {
  const pathname = usePathname();
  const links = linksByArea[area].filter((item) => {
    if (!item.roles.includes(role)) return false;
    if (item.adminOnly && role !== "ADMINISTRATOR") return false;
    return true;
  });

  return (
    <nav
      className={cn("flex flex-col gap-1", className)}
      aria-label="Dashboard navigation"
    >
      {links.map((item) => {
        const Icon = item.icon;
        const baseHref = item.href;
        const isActive =
          pathname === baseHref ||
          (baseHref !== "/dashboard" &&
            baseHref !== "/admin" &&
            baseHref !== "/tutor/dashboard" &&
            pathname.startsWith(`${baseHref}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
