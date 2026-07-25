import { useEffect, useState } from "react";

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

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: AdminPageKey[];
}

export interface UserAssignment {
  email: string;
  roleId: string;
}

const ROLES_KEY = "admin_roles";
const ASSIGN_KEY = "admin_role_assignments";

const allKeys = ADMIN_PAGES.map((p) => p.key);

const defaultRoles: Role[] = [
  {
    id: "super_admin",
    name: "Super Admin",
    description: "Full access to every admin page",
    permissions: [...allKeys],
  },
  {
    id: "manager",
    name: "Manager",
    description: "Manage orders, products, and content",
    permissions: [
      "dashboard",
      "report",
      "orders",
      "products",
      "categories",
      "services",
      "home-content",
      "about-content",
    ],
  },
  {
    id: "editor",
    name: "Editor",
    description: "Edit site content only",
    permissions: ["dashboard", "home-content", "about-content"],
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "Read-only dashboard & reports",
    permissions: ["dashboard", "report"],
  },
];

const defaultAssignments: UserAssignment[] = [
  { email: "admin@firecrackers.com", roleId: "super_admin" },
];

export const accessStore = {
  getRoles(): Role[] {
    try {
      const raw = localStorage.getItem(ROLES_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    localStorage.setItem(ROLES_KEY, JSON.stringify(defaultRoles));
    return defaultRoles;
  },
  setRoles(r: Role[]) {
    localStorage.setItem(ROLES_KEY, JSON.stringify(r));
    window.dispatchEvent(new Event("access-change"));
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
  },
};

export const useAccessControl = () => {
  const [roles, setRoles] = useState<Role[]>(accessStore.getRoles());
  const [assignments, setAssignments] = useState<UserAssignment[]>(accessStore.getAssignments());

  useEffect(() => {
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
