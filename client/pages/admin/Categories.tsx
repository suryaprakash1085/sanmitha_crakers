import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { RowActions } from "@/components/admin/RowActions";
import { FormModal } from "@/components/admin/FormModal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useCrudModal } from "@/hooks/useCrudModal";
import { TableFilters } from "@/components/admin/TableFilters";
import { api } from "@/lib/api";

interface Category { id: number; name: string; productCount: number; }

export default function Categories() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const modal = useCrudModal<Category>();
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => items.filter(c => c.name.toLowerCase().includes(search.toLowerCase())), [items, search]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Category[] }>("/categories");
      setItems(res.data.map((c: any) => ({ ...c, productCount: Number(c.productCount) || 0 })));
    } catch (err: any) {
      toast.error(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onCreate = () => { setName(""); modal.openCreate(); };
  const onEdit = (c: Category) => { setName(c.name); modal.openEdit(c); };

  const save = async () => {
    if (!name.trim()) return toast.error("Name required");
    try {
      if (modal.mode === "edit" && modal.item) {
        await api.put(`/categories/${modal.item.id}`, { name });
        toast.success("Category updated");
      } else {
        await api.post("/categories", { name });
        toast.success("Category added");
      }
      modal.close();
      load();
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    }
  };

  const confirmDelete = async () => {
    if (modal.deleteItem) {
      try {
        await api.del(`/categories/${modal.deleteItem.id}`);
        toast.success("Deleted");
        modal.closeDelete();
        load();
      } catch (err: any) {
        toast.error(err.message || "Delete failed");
      }
    }
  };

  const columns: Column<Category>[] = [
    { header: "Name", cell: (c) => c.name },
    { header: "Products", cell: (c) => c.productCount },
    { header: "Actions", cell: (c) => <RowActions onView={() => modal.openView(c)} onEdit={() => onEdit(c)} onDelete={() => modal.openDelete(c)} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize your products"
        action={<Button onClick={onCreate}><Plus className="h-4 w-4" /> Add Category</Button>}
      />
      <TableFilters search={search} onSearchChange={setSearch} placeholder="Search categories..." />
      <DataTable columns={columns} data={filtered} rowKey={(c) => c.id} empty={loading ? "Loading..." : "No categories found"} />

      <FormModal
        open={modal.isOpen}
        onOpenChange={modal.setOpen}
        title={modal.mode === "view" ? "View Category" : modal.mode === "edit" ? "Edit Category" : "Add Category"}
        onSubmit={save}
        readOnly={modal.mode === "view"}
      >
        {modal.mode === "view" && modal.item ? (
          <div className="space-y-2">
            <div><Label>Name</Label><p className="font-medium">{modal.item.name}</p></div>
            <div><Label>Products</Label><p>{modal.item.productCount}</p></div>
          </div>
        ) : (
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        )}
      </FormModal>

      <ConfirmDialog
        open={modal.isDeleteOpen}
        onOpenChange={modal.setDeleteOpen}
        description={`Delete "${modal.deleteItem?.name}"?`}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
