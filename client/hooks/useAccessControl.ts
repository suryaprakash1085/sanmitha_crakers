import { useEffect, useState } from "react";
import { adminAuth } from "@/hooks/useAdminAuth";
import { api } from "@/lib/api";

export type AdminPageKey =
  | "dashboard"
  | "report"
  | "orders"
  | "products"
  | "categories"
  | "services"
  | "users"
  | "company"
  | "home-content"
  | "about-content"
  | "customization"
  | "pdf-template"
  | "email-settings"
  | "access-control";

export const ADMIN_PAGES: { key: AdminPageKey; label: string; path: string }[] = [
  { key: "dashboard", label: "Dashboard", path: "/admin" },
  { key: "report", label: "Reports", path: "/admin/report" },
  { key: "orders", label: "Orders", path: "/admin/orders" },
  { key: "products", label: "Products", path: "/admin/products" },
  { key: "categories", label: "Categories", path: "/admin/categories" },
  { key: "services", label: "Services", path: "/admin/services" },
  { key: "users", label: "Users", path: "/admin/users" },
  { key: "company", label: "Company", path: "/admin/company" },
  { key: "home-content", label: "Home Content", path: "/admin/home-content" },
  { key: "about-content", label: "About Content", path: "/admin/about-content" },
  { key: "customization", label: "Customization", path: "/admin/customization" },
  { key: "pdf-template", label: "PDF Template", path: "/admin/pdf-template" },
  { key: "email-settings", label: "Email Settings", path: "/admin/email-settings" },
  { key: "access-control", label: "Access Control", path: "/admin/access-control" },
];

/** Per-HTTP-method permissions for a single page. */
export type MethodPerms = {
  get: boolean;
  post: boolean;
  put: boolean;
  delete: boolean;
};

export type HttpMethod = keyof MethodPerms;

/** Map of pageKey → method permissions for a role. */
export type PagePermissions = Partial<Record<AdminPageKey, MethodPerms>>;

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: PagePermissions;
}

export interface UserAssignment {
  email: string;
  roleId: string;
}

// ─── constants ────────────────────────────────────────────────────────────────

const ALL_METHODS: MethodPerms = { get: true, post: true, put: true, delete: true };
const READ_ONLY: MethodPerms = { get: true, post: false, put: false, delete: false };

function fullAccess(): PagePermissions {
  return Object.fromEntries(
    ADMIN_PAGES.map((p) => [p.key, { ...ALL_METHODS }])
  ) as PagePermissions;
}

// ─── default roles ────────────────────────────────────────────────────────────

const defaultRoles: Role[] = [
  {
    id: "super_admin",
    name: "Super Admin",
    description: "Full access to every admin page",
    permissions: fullAccess(),
  },
  {
    id: "manager",
    name: "Manager",
    description: "Manage orders, products, and content",
    permissions: {
      dashboard: { ...ALL_METHODS },
      report: { ...READ_ONLY },
      orders: { ...ALL_METHODS },
      products: { ...ALL_METHODS },
      categories: { ...ALL_METHODS },
      services: { ...ALL_METHODS },
      "home-content": { ...ALL_METHODS },
      "about-content": { ...ALL_METHODS },
    },
  },
  {
    id: "editor",
    name: "Editor",
    description: "Edit site content only",
    permissions: {
      dashboard: { ...READ_ONLY },
      "home-content": { ...ALL_METHODS },
      "about-content": { ...ALL_METHODS },
    },
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "Read-only dashboard & reports",
    permissions: {
      dashboard: { ...READ_ONLY },
      report: { ...READ_ONLY },
    },
  },
];

const defaultAssignments: UserAssignment[] = [
  { email: "admin@firecrackers.com", roleId: "super_admin" },
];

// ─── migration: old format had permissions: AdminPageKey[] ────────────────────

function migrateRole(r: any): Role {
  if (Array.isArray(r.permissions)) {
    const perms: PagePermissions = {};
    for (const key of r.permissions as AdminPageKey[]) {
      perms[key] = { ...ALL_METHODS };
    }
    return { ...r, permissions: perms };
  }
  return r as Role;
}

// ─── localStorage store ───────────────────────────────────────────────────────

const ROLES_KEY = "admin_roles";
const ASSIGN_KEY = "admin_role_assignments";

export const accessStore = {
  getRoles(): Role[] {
    try {
      const raw = localStorage.getItem(ROLES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const migrated = parsed.map(migrateRole);
          // Ensure super_admin always has full access
          const sa = migrated.find((r) => r.id === "super_admin");
          if (sa) sa.permissions = fullAccess();
          return migrated;
        }
      }
    } catch {}
    localStorage.setItem(ROLES_KEY, JSON.stringify(defaultRoles));
    return defaultRoles;
  },
  setRoles(r: Role[]) {
    localStorage.setItem(ROLES_KEY, JSON.stringify(r));
    window.dispatchEvent(new Event("access-change"));
    // Sync to API (fire-and-forget; failure is silently ignored so localStorage stays as fallback)
    api.put("/access-control/roles", r).catch(() => {});
  },
  getAssignments(): UserAssignment[] {
    try {
      const raw = localStorage.getItem(ASSIGN_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    localStorage.setItem(ASSIGN_KEY, JSON.stringify(defaultAssignments));
    return defaultAssignments;
  },
  setAssignments(a: UserAssignment[]) {
    localStorage.setItem(ASSIGN_KEY, JSON.stringify(a));
    window.dispatchEvent(new Event("access-change"));
    // Sync to API
    api.put("/access-control/assignments", a).catch(() => {});
  },
  /** Fetch from API and populate localStorage cache. Falls back to existing localStorage data on error. */
  async syncFromApi(): Promise<void> {
    try {
      const [rolesRes, assignRes] = await Promise.all([
        api.get<{ data: Role[] }>("/access-control/roles"),
        api.get<{ data: UserAssignment[] }>("/access-control/assignments"),
      ]);
      if (rolesRes?.data?.length) {
        const roles = rolesRes.data.map(migrateRole);
        const sa = roles.find((r) => r.id === "super_admin");
        if (sa) sa.permissions = fullAccess();
        localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
      }
      if (rolesRes?.data && assignRes?.data) {
        localStorage.setItem(ASSIGN_KEY, JSON.stringify(assignRes.data));
      }
      window.dispatchEvent(new Event("access-change"));
    } catch {
      // DB not available — keep using localStorage defaults silently
    }
  },
};

// ─── pure utility ─────────────────────────────────────────────────────────────

const NO_PERMS: MethodPerms = { get: false, post: false, put: false, delete: false };

/**
 * Return the effective method-level permissions for `email` on `pageKey`.
 * Falls back to full access if the user has no assignment (backwards-compatible).
 */
export function getPagePerms(
  roles: Role[],
  assignments: UserAssignment[],
  email: string | undefined,
  pageKey: AdminPageKey
): MethodPerms {
  if (!email) return { ...NO_PERMS };

  const assignment = assignments.find((a) => a.email === email);
  // Unassigned admin users retain full access (backward-compatible)
  if (!assignment) return { ...ALL_METHODS };

  const role = roles.find((r) => r.id === assignment.roleId);
  if (!role) return { ...NO_PERMS };

  // super_admin always has full access regardless of stored value
  if (role.id === "super_admin") return { ...ALL_METHODS };

  return role.permissions[pageKey] ?? { ...NO_PERMS };
}

// ─── react hook ───────────────────────────────────────────────────────────────

/**
 * React hook — returns the current user's method-level permissions for a
 * specific admin page. Re-renders automatically when roles/assignments change.
 */
export const usePagePermissions = (pageKey: AdminPageKey): MethodPerms => {
  const { roles, assignments } = useAccessControl();
  const email: string | undefined = adminAuth.current()?.email;
  return getPagePerms(roles, assignments, email, pageKey);
};

export const useAccessControl = () => {
  const [roles, setRoles] = useState<Role[]>(accessStore.getRoles());
  const [assignments, setAssignments] = useState<UserAssignment[]>(
    accessStore.getAssignments()
  );

  useEffect(() => {
    // Hydrate from API on first mount; falls back to localStorage if API unavailable
    accessStore.syncFromApi();

    const h = () => {
      setRoles(accessStore.getRoles());
      setAssignments(accessStore.getAssignments());
    };
    window.addEventListener("access-change", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("access-change", h);
      window.removeEventListener("storage", h);
    };
  }, []);

  return { roles, assignments };
};
