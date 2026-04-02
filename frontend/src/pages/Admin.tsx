import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, CreateUserInput, UpdateUserInput } from "@/services/user.service";
import { customerService } from "@/services/customer.service";
import { AuthUser, Customer } from "@/types";
import { useAuth } from "@/store/auth.store";
import { http } from "@/lib/http";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, Shield, User, X, Check, Ban, Users, ChevronDown, ChevronUp, Phone, IndianRupee } from "lucide-react";

interface UserFormData { username: string; password: string; role: "admin" | "user"; isActive: boolean; }
const emptyForm: UserFormData = { username: "", password: "", role: "user", isActive: true };

export default function Admin() {
  const { user: me } = useAuth();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<UserFormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<(UserFormData & { id: string }) | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ users: AuthUser[] }>({
    queryKey: ["users"],
    queryFn: () => userService.getAll(),
  });

  const { data: allCustomers } = useQuery<{ customers: Customer[] }>({
    queryKey: ["customers"],
    queryFn: () => customerService.getAll(),
  });

  const { mutate: createUser, isPending: isCreating } = useMutation({
    mutationFn: (d: CreateUserInput) => userService.create(d),
    onSuccess: () => { toast({ title: "User created" }); setShowCreate(false); setForm(emptyForm); queryClient.invalidateQueries({ queryKey: ["users"] }); },
    onError: (e: Error) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) => userService.update(id, data),
    onSuccess: () => { toast({ title: "User updated" }); setEditingId(null); setEditForm(null); queryClient.invalidateQueries({ queryKey: ["users"] }); },
    onError: (e: Error) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const { mutate: deleteUser } = useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: () => { toast({ title: "Deleted" }); queryClient.invalidateQueries({ queryKey: ["users"] }); },
    onError: (e: Error) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      toast({ title: "Missing fields", description: "Username and password required.", variant: "destructive" });
      return;
    }
    createUser({ username: form.username.trim(), password: form.password, role: form.role });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    updateUser({ id: editForm.id, data: { username: editForm.username.trim(), password: editForm.password || null, role: editForm.role, isActive: editForm.isActive } });
  };

  const getUserCustomers = (userId: string) =>
    allCustomers?.customers?.filter((c) => c.userId === userId) ?? [];

  const totalUsers = data?.users?.filter(u => u.role === "user").length ?? 0;
  const totalCustomers = allCustomers?.customers?.length ?? 0;
  const activeCustomers = allCustomers?.customers?.filter(c => c.isActive).length ?? 0;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl text-foreground">Admin Panel</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage users and monitor all customers</p>
        </div>
        <button onClick={() => { setShowCreate(true); setForm(emptyForm); }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:bg-primary/90 transition-colors">
          <Plus size={18} /> Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm text-center">
          <p className="text-2xl font-bold text-foreground">{data?.users?.length ?? 0}</p>
          <p className="text-xs text-muted-foreground font-semibold mt-1">Total Users</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm text-center">
          <p className="text-2xl font-bold text-foreground">{totalCustomers}</p>
          <p className="text-xs text-muted-foreground font-semibold mt-1">Total Customers</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm text-center">
          <p className="text-2xl font-bold text-green-600">{activeCustomers}</p>
          <p className="text-xs text-muted-foreground font-semibold mt-1">Active Customers</p>
        </div>
      </div>

      {/* Create User Form */}
      {showCreate && (
        <div className="bg-card border border-primary/20 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">New User</h3>
            <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"><X size={18} /></button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Username</label>
              <input type="text" required value={form.username} onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="e.g. john_doe" className="w-full bg-secondary/50 border border-border focus:border-primary text-foreground px-4 py-2.5 rounded-xl outline-none text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Password</label>
              <input type="password" required value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Min 6 characters" className="w-full bg-secondary/50 border border-border focus:border-primary text-foreground px-4 py-2.5 rounded-xl outline-none text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Role</label>
              <select value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value as "admin" | "user" }))}
                className="w-full bg-secondary/50 border border-border focus:border-primary text-foreground px-4 py-2.5 rounded-xl outline-none text-sm">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={isCreating}
                className="w-full bg-primary text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-60">
                {isCreating ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-border bg-secondary/30">
          <p className="text-sm font-semibold text-muted-foreground">{data?.users?.length ?? 0} Users</p>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-secondary/50 rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="divide-y divide-border">
            {data?.users?.map((u) => {
              const userCustomers = getUserCustomers(u.id);
              const isExpanded = expandedUserId === u.id;

              return (
                <div key={u.id}>
                  {editingId === u.id && editForm ? (
                    <form onSubmit={handleUpdate} className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-secondary/20">
                      <input type="text" required value={editForm.username} onChange={(e) => setEditForm(f => f ? { ...f, username: e.target.value } : f)}
                        className="bg-white border border-border focus:border-primary text-foreground px-3 py-2 rounded-xl outline-none text-sm" placeholder="Username" />
                      <input type="password" value={editForm.password} onChange={(e) => setEditForm(f => f ? { ...f, password: e.target.value } : f)}
                        className="bg-white border border-border focus:border-primary text-foreground px-3 py-2 rounded-xl outline-none text-sm" placeholder="New password (blank = keep)" />
                      <select value={editForm.role} onChange={(e) => setEditForm(f => f ? { ...f, role: e.target.value as "admin" | "user" } : f)}
                        className="bg-white border border-border focus:border-primary text-foreground px-3 py-2 rounded-xl outline-none text-sm">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      <div className="flex gap-2 items-center">
                        <label className="flex items-center gap-2 text-sm font-medium flex-1">
                          <input type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm(f => f ? { ...f, isActive: e.target.checked } : f)} className="w-4 h-4 accent-primary" /> Active
                        </label>
                        <button type="submit" disabled={isUpdating} className="p-2 bg-primary text-white rounded-lg"><Check size={16} /></button>
                        <button type="button" onClick={() => { setEditingId(null); setEditForm(null); }} className="p-2 bg-secondary rounded-lg"><X size={16} /></button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      {/* User Row */}
                      <div className="flex items-center gap-3 px-5 py-4 hover:bg-secondary/20 transition-colors group">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                          {u.role === "admin" ? <Shield size={18} /> : <User size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-foreground">{u.username}</p>
                            {u.id === me?.id && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">You</span>}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${u.role === "admin" ? "bg-amber-100 text-amber-700" : "bg-blue-50 text-blue-700"}`}>{u.role.toUpperCase()}</span>
                            {!u.isActive && <span className="text-[10px] bg-red-50 text-destructive px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><Ban size={10} /> Disabled</span>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                        </div>

                        {/* Customer count — only for regular users */}
                        {u.role === "user" && (
                          <button onClick={() => setExpandedUserId(isExpanded ? null : u.id)}
                            className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors shrink-0">
                            <Users size={13} />
                            {userCustomers.length} customer{userCustomers.length !== 1 ? "s" : ""}
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        )}

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingId(u.id); setEditForm({ id: u.id, username: u.username, password: "", role: u.role, isActive: u.isActive }); }}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Edit2 size={15} /></button>
                          {u.id !== me?.id && (
                            <button onClick={() => { if (confirm(`Delete user "${u.username}"?`)) deleteUser(u.id); }}
                              className="p-2 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                          )}
                        </div>
                      </div>

                      {/* Expanded: customer list for this user */}
                      {isExpanded && u.role === "user" && (
                        <div className="px-5 pb-4 pt-2 bg-secondary/10 border-t border-border/40">
                          {userCustomers.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-2">No customers added yet.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {userCustomers.map((c) => (
                                <div key={c.id} className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 border border-border">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                    {c.name.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-foreground">{c.name}</p>
                                    <div className="flex items-center gap-3 mt-0.5">
                                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone size={10} />{c.phone}</span>
                                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><IndianRupee size={10} />₹{c.pricePerLitre}/L</span>
                                    </div>
                                  </div>
                                  {!c.isActive && <span className="text-[10px] bg-red-50 text-destructive px-1.5 py-0.5 rounded font-bold shrink-0">Inactive</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
