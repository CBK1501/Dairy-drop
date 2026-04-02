import { useQuery } from "@tanstack/react-query";
import { customerService } from "@/services/customer.service";
import { userService } from "@/services/user.service";
import { Customer, AuthUser } from "@/types";
import { Link } from "wouter";
import { Users, Phone, Plus } from "lucide-react";
import { useAuth } from "@/store/auth.store";

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: usersData } = useQuery<{ users: AuthUser[] }>({
    queryKey: ["users"],
    queryFn: () => userService.getAll(),
  });

  const { data: allCustomersData } = useQuery<{ customers: Customer[] }>({
    queryKey: ["customers"],
    queryFn: () => customerService.getAll(),
  });

  const regularUsers = usersData?.users?.filter(u => u.role === "user") ?? [];
  const allCustomers = allCustomersData?.customers ?? [];
  const totalCustomers = allCustomers.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-orange-400 rounded-3xl p-6 lg:p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="text-white/80 font-medium text-sm mb-1 uppercase tracking-wider">Welcome back</p>
            <h2 className="font-bold text-3xl lg:text-4xl">{user?.username}</h2>
            <p className="text-white/70 text-sm mt-1">Admin — full access</p>
          </div>
          <div className="lg:text-right">
            <p className="text-white/80 font-medium text-sm mb-1">Total Users</p>
            <h3 className="font-black text-5xl lg:text-6xl tracking-tight">{regularUsers.length}</h3>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Total Users</p>
          <p className="font-bold text-3xl text-foreground">{regularUsers.length}</p>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Total Customers</p>
          <p className="font-bold text-3xl text-foreground">{totalCustomers}</p>
        </div>
      </div>

      {/* Users with their customers */}
      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground">Users & Their Customers</h3>
          <Link href="/admin">
            <span className="text-sm text-primary font-semibold hover:underline cursor-pointer">Manage Users</span>
          </Link>
        </div>

        {regularUsers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No users yet</p>
            <Link href="/admin">
              <div className="inline-flex items-center gap-2 mt-3 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer hover:bg-primary/90 transition-colors">
                <Plus size={16} /> Add First User
              </div>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {regularUsers.map((u) => {
              const userCustomers = allCustomers.filter(c => c.userId === u.id);
              return (
                <div key={u.id} className="px-5 py-4">
                  {/* User row */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-bold text-sm shrink-0">
                      {u.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{u.username}</p>
                      <p className="text-xs text-muted-foreground">{userCustomers.length} customer{userCustomers.length !== 1 ? "s" : ""}</p>
                    </div>
                    {!u.isActive && <span className="text-[10px] bg-red-50 text-destructive px-2 py-0.5 rounded-full font-bold">Disabled</span>}
                  </div>

                  {/* Customer cards under this user */}
                  {userCustomers.length > 0 ? (
                    <div className="ml-12 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {userCustomers.map((c) => (
                        <div key={c.id} className="flex items-center gap-2 bg-secondary/40 rounded-xl px-3 py-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] shrink-0">
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs text-foreground truncate">{c.name}</p>
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground"><Phone size={9} />{c.phone}</span>
                              <span className="text-[10px] text-muted-foreground">₹{c.pricePerLitre}/L</span>
                            </div>
                          </div>
                          {!c.isActive && <span className="text-[10px] bg-red-50 text-destructive px-1.5 py-0.5 rounded font-bold shrink-0">Off</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="ml-12 text-xs text-muted-foreground">No customers added yet.</p>
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
