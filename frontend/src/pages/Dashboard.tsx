import { useQuery } from "@tanstack/react-query";
import { customerService } from "@/services/customer.service";
import { userService } from "@/services/user.service";
import { Customer, AuthUser } from "@/types";
import { Link } from "wouter";
import { Users, ChevronRight, Droplets, Phone, IndianRupee, Plus, Shield } from "lucide-react";
import { useAuth } from "@/store/auth.store";

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { data: usersData } = useQuery<{ users: AuthUser[] }>({
    queryKey: ["users"],
    queryFn: () => userService.getAll(),
    enabled: isAdmin,
  });

  const { data: allCustomersData } = useQuery<{ customers: Customer[] }>({
    queryKey: ["customers"],
    queryFn: () => customerService.getAll(),
    enabled: isAdmin,
  });

  const { data, isLoading } = useQuery<{ customers: Customer[] }>({
    queryKey: ["customers"],
    queryFn: () => customerService.getAll(),
    enabled: !isAdmin,
  });

  const customers = data?.customers ?? [];
  const activeCustomers = customers.filter((c) => c.isActive);

  if (isAdmin) {
    const regularUsers = usersData?.users?.filter(u => u.role === "user") ?? [];
    const allCustomers = allCustomersData?.customers ?? [];

    return (
      <div className="flex flex-col gap-6">
        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary to-orange-400 rounded-3xl p-6 lg:p-8 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="text-white/80 font-medium text-sm mb-1 uppercase tracking-wider">Welcome back</p>
              <h2 className="font-bold text-3xl lg:text-4xl">{user?.username}</h2>
              <p className="text-white/70 text-sm mt-1">You have full admin access</p>
            </div>
            <div className="lg:text-right">
              <p className="text-white/80 font-medium text-sm mb-1">Total Users</p>
              <h3 className="font-black text-5xl lg:text-6xl tracking-tight">{regularUsers.length}</h3>
            </div>
          </div>
        </div>

        {/* Users with customer counts */}
        <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-foreground">Users & Their Customers</h3>
            <Link href="/admin"><span className="text-sm text-primary font-semibold hover:underline cursor-pointer">Manage</span></Link>
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
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-bold text-sm shrink-0">
                        {u.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{u.username}</p>
                        <p className="text-xs text-muted-foreground">{userCustomers.length} customer{userCustomers.length !== 1 ? "s" : ""}</p>
                      </div>
                      {!u.isActive && <span className="text-[10px] bg-red-50 text-destructive px-2 py-0.5 rounded-full font-bold">Disabled</span>}
                    </div>
                    {userCustomers.length > 0 && (
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
                          </div>
                        ))}
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

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-orange-400 rounded-3xl p-6 lg:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="text-white/80 font-medium text-sm mb-1 uppercase tracking-wider">Welcome back</p>
            <h2 className="font-bold text-3xl lg:text-4xl">{user?.name || user?.username}</h2>
            <p className="text-white/70 text-sm mt-1">Manage your milk delivery customers</p>
          </div>
          <div className="lg:text-right">
            <p className="text-white/80 font-medium text-sm mb-1">Active Customers</p>
            <h3 className="font-black text-5xl lg:text-6xl tracking-tight">{activeCustomers.length}</h3>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card rounded-3xl p-5 border border-border shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-3"><Users size={20} /></div>
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Total Customers</p>
          <p className="font-bold text-2xl text-foreground">{customers.length}</p>
        </div>
        <div className="bg-card rounded-3xl p-5 border border-border shadow-sm">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-3"><Droplets size={20} /></div>
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Active</p>
          <p className="font-bold text-2xl text-foreground">{activeCustomers.length}</p>
        </div>
        <div className="bg-card rounded-3xl p-5 border border-border shadow-sm col-span-2 lg:col-span-1">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-3"><IndianRupee size={20} /></div>
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Avg Rate</p>
          <p className="font-bold text-2xl text-foreground">
            {customers.length > 0 ? `₹${(customers.reduce((s, c) => s + c.pricePerLitre, 0) / customers.length).toFixed(0)}` : "—"}<span className="text-base text-muted-foreground font-medium">/L</span>
          </p>
        </div>
      </div>

      {/* Recent Customers */}
      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground">Customers</h3>
          <Link href="/customers">
            <span className="text-sm text-primary font-semibold hover:underline cursor-pointer">View all</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-14 bg-secondary/50 rounded-xl animate-pulse" />)}</div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No customers yet</p>
            <Link href="/customers">
              <div className="inline-flex items-center gap-2 mt-3 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer hover:bg-primary/90 transition-colors">
                <Plus size={16} /> Add First Customer
              </div>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {customers.slice(0, 5).map((c) => (
              <Link key={c.id} href={`/customers/${c.id}`}>
                <div className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone size={11} />{c.phone}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">₹{c.pricePerLitre}/L</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
