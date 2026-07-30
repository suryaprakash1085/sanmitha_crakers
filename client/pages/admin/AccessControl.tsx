import { useState } from "react";
import { Plus, Trash2, Shield, Users as UsersIcon } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ADMIN_PAGES,
  accessStore,
  useAccessControl,
  type AdminPageKey,
  type HttpMethod,
  type MethodPerms,
  type Role,
} from "@/hooks/useAccessControl";

const METHODS: { key: HttpMethod; label: string; color: string }[] = [
  { key: "get",    label: "GET",    color: "text-emerald-600" },
  { key: "post",   label: "POST",   color: "text-blue-600"    },
  { key: "put",    label: "PUT",    color: "text-amber-600"   },
  { key: "delete", label: "DELETE", color: "text-red-600"     },
];

const NO_PERMS: MethodPerms = { get: false, post: false, put: false, delete: false };

export default function AccessControl() {
  const { roles, assignments } = useAccessControl();
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    roles[0]?.id ?? "super_admin"
  );
  const [newRole, setNewRole] = useState({ name: "", description: "" });
  const [newAssign, setNewAssign] = useState({ email: "", roleId: "" });

  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? roles[0];
  const isSuperAdmin = selectedRole?.id === "super_admin";

  // ── permission toggles ──────────────────────────────────────────────────────

  const toggleMethod = (pageKey: AdminPageKey, method: HttpMethod) => {
    if (isSuperAdmin) return;
    const next = roles.map((r) => {
      if (r.id !== selectedRoleId) return r;
      const cur: MethodPerms = r.permissions[pageKey] ?? { ...NO_PERMS };
      return {
        ...r,
        permissions: {
          ...r.permissions,
          [pageKey]: { ...cur, [method]: !cur[method] },
        },
      };
    });
    accessStore.setRoles(next);
  };

  const setPageAllMethods = (pageKey: AdminPageKey, value: boolean) => {
    if (isSuperAdmin) return;
    const next = roles.map((r) => {
      if (r.id !== selectedRoleId) return r;
      return {
        ...r,
        permissions: {
          ...r.permissions,
          [pageKey]: { get: value, post: value, put: value, delete: value },
        },
      };
    });
    accessStore.setRoles(next);
  };

  const setRoleAllMethods = (value: boolean) => {
    if (isSuperAdmin) return;
    const allPerms = Object.fromEntries(
      ADMIN_PAGES.map((p) => [
        p.key,
        { get: value, post: value, put: value, delete: value },
      ])
    );
    const next = roles.map((r) =>
      r.id === selectedRoleId ? { ...r, permissions: allPerms } : r
    );
    accessStore.setRoles(next);
  };

  // ── role management ─────────────────────────────────────────────────────────

  const addRole = () => {
    if (!newRole.name.trim()) return toast.error("Role name required");
    const id = newRole.name.toLowerCase().replace(/\s+/g, "_");
    if (roles.some((r) => r.id === id)) return toast.error("Role already exists");
    const r: Role = {
      id,
      name: newRole.name,
      description: newRole.description,
      permissions: { dashboard: { get: true, post: false, put: false, delete: false } },
    };
    accessStore.setRoles([...roles, r]);
    setNewRole({ name: "", description: "" });
    setSelectedRoleId(id);
    toast.success("Role created");
  };

  const deleteRole = (id: string) => {
    if (id === "super_admin") return toast.error("Cannot delete Super Admin");
    accessStore.setRoles(roles.filter((r) => r.id !== id));
    accessStore.setAssignments(assignments.filter((a) => a.roleId !== id));
    if (selectedRoleId === id) setSelectedRoleId(roles[0]?.id ?? "super_admin");
    toast.success("Role deleted");
  };

  // ── assignment management ───────────────────────────────────────────────────

  const addAssignment = () => {
    if (!newAssign.email.trim() || !newAssign.roleId)
      return toast.error("Email and role required");
    if (assignments.some((a) => a.email === newAssign.email))
      return toast.error("User already assigned — update instead");
    accessStore.setAssignments([...assignments, { ...newAssign }]);
    setNewAssign({ email: "", roleId: "" });
    toast.success("User assigned");
  };

  const updateAssignment = (email: string, roleId: string) => {
    accessStore.setAssignments(
      assignments.map((a) => (a.email === email ? { ...a, roleId } : a))
    );
  };

  const removeAssignment = (email: string) => {
    accessStore.setAssignments(assignments.filter((a) => a.email !== email));
    toast.success("Assignment removed");
  };

  // ── helpers ─────────────────────────────────────────────────────────────────

  const getMethod = (pageKey: AdminPageKey, method: HttpMethod): boolean => {
    if (isSuperAdmin) return true;
    return selectedRole?.permissions[pageKey]?.[method] ?? false;
  };

  const pageHasAnyMethod = (pageKey: AdminPageKey): boolean =>
    METHODS.some((m) => getMethod(pageKey, m.key));

  const totalGrants = (): number => {
    if (!selectedRole) return 0;
    if (isSuperAdmin) return ADMIN_PAGES.length * 4;
    return ADMIN_PAGES.reduce((sum, p) => {
      const perms = selectedRole.permissions[p.key];
      if (!perms) return sum;
      return sum + METHODS.filter((m) => perms[m.key]).length;
    }, 0);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Access Control"
        description="Manage roles and page-level HTTP permissions"
        icon={<Shield className="h-5 w-5" />}
      />

      <Tabs defaultValue="matrix" className="space-y-6">
        <TabsList>
          <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="assignments">User Assignments</TabsTrigger>
        </TabsList>

        {/* ── MATRIX ─────────────────────────────────────────────────────── */}
        <TabsContent value="matrix" className="space-y-4">
          {/* Role selector */}
          <div className="flex flex-wrap items-center gap-2">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRoleId(r.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  selectedRoleId === r.id
                    ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600"
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>

          {selectedRole && (
            <div className="rounded-2xl border border-gray-200 bg-white overflow-x-auto shadow-sm">
              {/* Header */}
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">{selectedRole.name}</span>
                  {selectedRole.description && (
                    <span className="ml-2 text-xs text-slate-400">{selectedRole.description}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    {totalGrants()} / {ADMIN_PAGES.length * 4} permissions granted
                  </span>
                  {!isSuperAdmin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setRoleAllMethods(true)}
                        className="text-xs text-violet-500 hover:underline"
                      >
                        Grant all
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => setRoleAllMethods(false)}
                        className="text-xs text-slate-400 hover:underline"
                      >
                        Revoke all
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-slate-50/60">
                    <th className="text-left px-5 py-3 font-semibold text-slate-500 w-48">Page</th>
                    <th className="px-3 py-3 text-center font-semibold text-slate-400 text-xs w-10">
                      Access
                    </th>
                    {METHODS.map((m) => (
                      <th
                        key={m.key}
                        className={`px-4 py-3 text-center font-bold text-xs tracking-widest ${m.color} min-w-[72px]`}
                      >
                        {m.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ADMIN_PAGES.map((p) => {
                    const hasAny = pageHasAnyMethod(p.key);
                    return (
                      <tr
                        key={p.key}
                        className={`border-t border-gray-50 transition-colors ${
                          hasAny ? "hover:bg-violet-50/30" : "hover:bg-slate-50/50 opacity-60"
                        }`}
                      >
                        {/* Page label */}
                        <td className="px-5 py-3">
                          <span className={`font-medium ${hasAny ? "text-slate-700" : "text-slate-400"}`}>
                            {p.label}
                          </span>
                        </td>

                        {/* Row-level toggle (toggles all methods for this page) */}
                        <td className="px-3 py-3 text-center">
                          <Checkbox
                            checked={hasAny}
                            disabled={isSuperAdmin}
                            onCheckedChange={(v) => setPageAllMethods(p.key, !!v)}
                            className="mx-auto"
                          />
                        </td>

                        {/* Per-method checkboxes */}
                        {METHODS.map((m) => (
                          <td key={m.key} className="px-4 py-3 text-center">
                            <Checkbox
                              checked={getMethod(p.key, m.key)}
                              disabled={isSuperAdmin}
                              onCheckedChange={() => toggleMethod(p.key, m.key)}
                              className="mx-auto"
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* ── ROLES ──────────────────────────────────────────────────────── */}
        <TabsContent value="roles" className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] items-end">
              <div>
                <Label>Role Name</Label>
                <Input
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="e.g. Support"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Short description"
                />
              </div>
              <Button onClick={addRole}>
                <Plus className="h-4 w-4 mr-1" /> Add Role
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            {roles.map((r) => {
              const grantedPages = ADMIN_PAGES.filter(
                (p) => r.id === "super_admin" || r.permissions[p.key]?.get
              );
              return (
                <div
                  key={r.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 flex items-start justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-800">{r.name}</h3>
                      <Badge variant="secondary">{grantedPages.length} pages visible</Badge>
                      {r.id === "super_admin" && <Badge>system</Badge>}
                    </div>
                    {r.description && (
                      <p className="text-sm text-slate-400 mt-1">{r.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {grantedPages.map((p) => (
                        <Badge key={p.key} variant="outline" className="text-xs">
                          {p.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteRole(r.id)}
                    disabled={r.id === "super_admin"}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ── ASSIGNMENTS ────────────────────────────────────────────────── */}
        <TabsContent value="assignments" className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] items-end">
              <div>
                <Label>User Email</Label>
                <Input
                  value={newAssign.email}
                  onChange={(e) => setNewAssign({ ...newAssign, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select
                  value={newAssign.roleId}
                  onValueChange={(v) => setNewAssign({ ...newAssign, roleId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addAssignment}>
                <Plus className="h-4 w-4 mr-1" /> Assign
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/60 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-slate-500">
                    <UsersIcon className="h-4 w-4 inline mr-2" />
                    User
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-500">Role</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {assignments.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-slate-400">
                      No assignments yet
                    </td>
                  </tr>
                )}
                {assignments.map((a) => (
                  <tr key={a.email} className="border-t border-gray-50 hover:bg-slate-50/50">
                    <td className="px-5 py-3 text-slate-700">{a.email}</td>
                    <td className="px-5 py-3">
                      <Select
                        value={a.roleId}
                        onValueChange={(v) => updateAssignment(a.email, v)}
                      >
                        <SelectTrigger className="w-52">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAssignment(a.email)}
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
