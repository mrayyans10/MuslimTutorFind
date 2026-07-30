import { UserRole } from "@prisma/client";

export type Permission =
  | "search:tutors"
  | "view:tutor_profile"
  | "complete:find_your_tutor"
  | "message:tutor"
  | "post:requirement"
  | "apply:requirement"
  | "manage:child_profiles"
  | "submit:verification"
  | "review:tutor"
  | "report:user"
  | "block:user"
  | "moderate:content"
  | "admin:users"
  | "admin:settings"
  | "admin:audit";

const rolePermissions: Record<UserRole, Permission[]> = {
  STUDENT: [
    "search:tutors",
    "view:tutor_profile",
    "complete:find_your_tutor",
    "message:tutor",
    "post:requirement",
    "review:tutor",
    "report:user",
    "block:user",
  ],
  PARENT: [
    "search:tutors",
    "view:tutor_profile",
    "complete:find_your_tutor",
    "message:tutor",
    "post:requirement",
    "manage:child_profiles",
    "review:tutor",
    "report:user",
    "block:user",
  ],
  TUTOR: [
    "search:tutors",
    "view:tutor_profile",
    "message:tutor",
    "apply:requirement",
    "submit:verification",
    "report:user",
    "block:user",
  ],
  MODERATOR: [
    "search:tutors",
    "view:tutor_profile",
    "moderate:content",
    "report:user",
    "block:user",
  ],
  ADMINISTRATOR: [
    "search:tutors",
    "view:tutor_profile",
    "complete:find_your_tutor",
    "message:tutor",
    "post:requirement",
    "apply:requirement",
    "manage:child_profiles",
    "submit:verification",
    "review:tutor",
    "report:user",
    "block:user",
    "moderate:content",
    "admin:users",
    "admin:settings",
    "admin:audit",
  ],
};

export function can(role: UserRole | null | undefined, permission: Permission): boolean {
  if (!role) {
    return permission === "search:tutors" || permission === "view:tutor_profile" || permission === "complete:find_your_tutor";
  }
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function assertCan(role: UserRole | null | undefined, permission: Permission) {
  if (!can(role, permission)) {
    throw new Error("Forbidden");
  }
}

export function isStaff(role: UserRole | null | undefined) {
  return role === "MODERATOR" || role === "ADMINISTRATOR";
}

export function isAdmin(role: UserRole | null | undefined) {
  return role === "ADMINISTRATOR";
}
