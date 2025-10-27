export enum UserRole {
  STUDENT = "student",
  ADMIN = "admin",
  TEACHER = "teacher",
  FINANCE = "finance",
  LIBRARIAN = "librarian",
  PARENT = "parent",
  SUPER_ADMIN = "super_admin",
  OTHER = "other",
  EDUSTACK = "edustack",
}

export const STAFF_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.TEACHER,
  UserRole.FINANCE,
  UserRole.LIBRARIAN,
  UserRole.SUPER_ADMIN,
  UserRole.OTHER,
  UserRole.EDUSTACK,
];

export const ADMINS_ROLES: UserRole[] = [
  UserRole.EDUSTACK,
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
];
