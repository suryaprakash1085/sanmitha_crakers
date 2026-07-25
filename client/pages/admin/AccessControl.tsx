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
  type Role,
} from "@/hooks/useAccessControl";

export default function AccessControl() {
  const { roles, assignments } = useAccessControl();
  const [newRole, setNewRole] = useState({ name: "", description: "" });
  const [newAssign, setNewAssign] = useState({ email: "", roleId: "" });

  const togglePerm = (roleId: string, key: AdminPageKey) => {
    const next = roles.map((r) => {
      if (r.id !== roleId) return r;
      const has = r.permissions.includes(key);
      return {
        ...r,
        permissions: has ? r.permissions.filter((k) => k !== key) : [...r.permissions, key],
      };
    });
    accessStore.setRoles(next);
  };

  const toggleAll = (roleId: string, checked: boolean) => {
    const next = roles.map((r) =>
      r.id === roleId
        ? { ...r, permissions: checked ? ADMIN_PAGES.map((p) => p.key) : [] }
        : r
    );
    accessStore.setRoles(next);
  };

  const addRole = () => {
    if (!newRole.name.trim()) return toast.error("Role name required");
    const id = newRole.name.toLowerCase().replace(/\s+/g, "_");
    if (roles.some((r) => r.id === id)) return toast.error("Role already exists");
    const r: Role = {
      id,
      name: newRole.name,
      description: newRole.description,
      permissions: ["dashboard"],
    };
    accessStore.setRoles([...roles, r]);
    setNewRole({ name: "", description: "" });
    toast.success("Role created");
  };

  const deleteRole = (id: string) => {
    if (id === "super_admin") return toast.error("Cannot delete Super Admin");
    accessStore.setRoles(roles.filter((r) => r.id !== id));
    accessStore.setAssignments(assignments.filter((a) => a.roleId !== id));
    toast.success("Role deleted");
  };

  const addAssignment = () => {
    if (!newAssign.email.trim() || !newAssign.roleId) return toast.error("Email and role required");
    if (assignments.some((a) => a.email === newAssign.email))
      return toast.error("User already assigned — update instead");
    accessStore.setAssignments([...assignments, { ...newAssign }]);
    setNewAssign({ email: "", roleId: "" });
    toast.success("User assigned");
  };

  const updateAssignment = (email: string, roleId: string) => {
    accessStore.setAssignments(assignments.map((a) => (a.email === email ? { ...a, roleId } : a)));
  };

  const removeAssignment = (email: string) => {
    accessStore.setAssignments(assignments.filter((a) => a.email !== email));
    toast.success("Assignment removed");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Access Control"
        description="Manage roles and page permissions"
        icon={<Shield className="h-5 w-5" />}
      />

      <Tabs defaultValue="matrix" className="space-y-6">
        <TabsList>
          <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="assignments">User Assignments</TabsTrigger>
        </TabsList>

        {/* MATRIX */}
        <TabsContent value="matrix">
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/60">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-200 sticky left-0 bg-slate-900/60">
                    Page
                  </th>
                  {roles.map((r) => (
                    <th key={r.id} className="p-4 font-semibold text-slate-200 text-center min-w-[140px]">
                      <div>{r.name}</div>
                      <button
                        className="text-[10px] text-violet-400 hover:underline mt-1"
                        onClick={() =>
                          toggleAll(r.id, r.permissions.length !== ADMIN_PAGES.length)
                        }
                      >
                        {r.permissions.length === ADMIN_PAGES.length ? "Clear all" : "Select all"}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ADMIN_PAGES.map((p) => (
                  <tr key={p.key} className="border-t border-white/5 hover:bg-slate-800/30">
                    <td className="p-4 text-slate-300 sticky left-0 bg-slate-900/40">{p.label}</td>
                    {roles.map((r) => (
                      <td key={r.id} className="p-4 text-center">
                        <Checkbox
                          checked={r.permissions.includes(p.key)}
                          onCheckedChange={() => togglePerm(r.id, p.key)}
                          disabled={r.id === "super_admin"}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ROLES */}
        <TabsContent value="roles" className="space-y-4">
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
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
            {roles.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-white/5 bg-slate-900/40 p-5 flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-100">{r.name}</h3>
                    <Badge variant="secondary">{r.permissions.length} pages</Badge>
                    {r.id === "super_admin" && <Badge>system</Badge>}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{r.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {r.permissions.map((k) => {
                      const p = ADMIN_PAGES.find((x) => x.key === k);
                      return p ? (
                        <Badge key={k} variant="outline" className="text-xs">
                          {p.label}
                        </Badge>
                      ) : null;
                    })}
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
            ))}
          </div>
        </TabsContent>

        {/* ASSIGNMENTS */}
        <TabsContent value="assignments" className="space-y-4">
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
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

          <div className="rounded-2xl border border-white/5 bg-slate-900/40 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/60">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-200">
                    <UsersIcon className="h-4 w-4 inline mr-2" /> User
                  </th>
                  <th className="text-left p-4 font-semibold text-slate-200">Role</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {assignments.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-slate-500">
                      No assignments yet
                    </td>
                  </tr>
                )}
                {assignments.map((a) => (
                  <tr key={a.email} className="border-t border-white/5">
                    <td className="p-4 text-slate-300">{a.email}</td>
                    <td className="p-4">
                      <Select value={a.roleId} onValueChange={(v) => updateAssignment(a.email, v)}>
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
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" onClick={() => removeAssignment(a.email)}>
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
