import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService, CreateCustomerInput } from "@/services/customer.service";
import { Customer } from "@/types";
import { Plus, Trash2, Edit2, X, Check, Phone, User, IndianRupee } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const emptyForm = { name: "", phone: "", pricePerLitre: 50 };

export default function Customers() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<(typeof emptyForm & { isActive: boolean }) | null>(null);

  const { data, isLoading } = useQuery<{ customers: Customer[] }>({
    queryKey: ["customers"],
    queryFn: () => customerService.getAll(),
  });

  const { mutate: createCustomer, isPending: isCreating } = useMutation({
    mutationFn: (d: CreateCustomerInput) => customerService.create(d),
    onSuccess: () => { toast({ title: "Customer added" }); setShowCreate(false); setForm(emptyForm); queryClient.invalidateQueries({ queryKey: ["customers"] }); },
    onError: (e: Error) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const { mutate: updateCustomer, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => customerService.update(id, data),
    onSuccess: () => { toast({ title: "Customer updated" }); setEditingId(null); setEditForm(null); queryClient.invalidateQueries({ queryKey: ["customers"] }); },
    onError: (e: Error) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const { mutate: deleteCustomer } = useMutation({
    mutationFn: (id: string) => customerService.remove(id),
    onSuccess: () => { toast({ title: "Customer deleted" }); queryClient.invalidateQueries({ queryKey: ["customers"] }); },
    onError: (e: Error) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast({ title: "Missing fields", description: "Name and phone are required.", variant: "destructive" });
      return;
    }
    createCustomer({ name: form.name, phone: form.phone, pricePerLitre: form.pricePerLitre });
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl text-foreground">Customers</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage your milk delivery customers</p>
        </div>
        <button onClick={() => { setShowCreate(true); setForm(emptyForm); }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:bg-primary/90 transition-colors">
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-card border border-primary/20 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">New Customer</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Full Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Ravi Kumar"
                  className="w-full bg-secondary/50 border border-border focus:border-primary text-foreground px-4 py-2.5 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Mobile Number</label>
                <input type="tel" required value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-secondary/50 border border-border focus:border-primary text-foreground px-4 py-2.5 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Price / Litre (Rs.)</label>
                <input type="number" step="0.5" min="1" required value={form.pricePerLitre}
                  onChange={(e) => setForm(f => ({ ...f, pricePerLitre: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-secondary/50 border border-border focus:border-primary text-foreground px-4 py-2.5 rounded-xl outline-none text-sm" />
              </div>
              <div className="sm:col-span-3">
                <button type="submit" disabled={isCreating}
                  className="w-full bg-primary text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {isCreating ? "Adding..." : "Add Customer"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-border bg-secondary/30">
          <p className="text-sm font-semibold text-muted-foreground">{data?.customers?.length ?? 0} Customers</p>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-secondary/50 rounded-xl animate-pulse" />)}</div>
        ) : data?.customers?.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <User size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No customers yet</p>
            <p className="text-sm mt-1">Click "Add Customer" to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data?.customers?.map((c) => (
              <div key={c.id}>
                {editingId === c.id && editForm ? (
                  <form onSubmit={(e) => { e.preventDefault(); updateCustomer({ id: c.id, data: editForm }); }}
                    className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-secondary/20">
                    <input value={editForm.name} onChange={(e) => setEditForm(f => f ? { ...f, name: e.target.value } : f)}
                      placeholder="Name" className="bg-white border border-border focus:border-primary px-3 py-2 rounded-xl outline-none text-sm" />
                    <input value={editForm.phone} onChange={(e) => setEditForm(f => f ? { ...f, phone: e.target.value } : f)}
                      placeholder="Phone" className="bg-white border border-border focus:border-primary px-3 py-2 rounded-xl outline-none text-sm" />
                    <input type="number" step="0.5" value={editForm.pricePerLitre}
                      onChange={(e) => setEditForm(f => f ? { ...f, pricePerLitre: parseFloat(e.target.value) || 0 } : f)}
                      placeholder="Rs./L" className="bg-white border border-border focus:border-primary px-3 py-2 rounded-xl outline-none text-sm" />
                    <div className="flex gap-2 items-center">
                      <label className="flex items-center gap-1.5 text-sm flex-1">
                        <input type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm(f => f ? { ...f, isActive: e.target.checked } : f)} className="accent-primary" /> Active
                      </label>
                      <button type="submit" disabled={isUpdating} className="p-2 bg-primary text-white rounded-lg"><Check size={16} /></button>
                      <button type="button" onClick={() => { setEditingId(null); setEditForm(null); }} className="p-2 bg-secondary rounded-lg"><X size={16} /></button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">{c.name}</p>
                        {!c.isActive && <span className="text-[10px] bg-red-50 text-destructive px-2 py-0.5 rounded-full font-bold">Inactive</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone size={11} />{c.phone}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><IndianRupee size={11} />Rs. {c.pricePerLitre}/L</span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingId(c.id); setEditForm({ name: c.name, phone: c.phone, pricePerLitre: c.pricePerLitre, isActive: c.isActive }); }}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Edit2 size={15} /></button>
                      <button onClick={() => { if (confirm(`Delete ${c.name}?`)) deleteCustomer(c.id); }}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
