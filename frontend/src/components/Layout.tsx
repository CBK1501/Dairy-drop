import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Home, PlusCircle, List, Settings, Droplets, Shield, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth.store";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/add", icon: PlusCircle, label: "Add Entry" },
  { href: "/history", icon: List, label: "History" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const allNavItems = isAdmin ? [...navItems, { href: "/admin", icon: Shield, label: "Admin" }] : navItems;
  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-card border-r border-border fixed left-0 top-0 bottom-0 z-30">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white shadow-lg shrink-0">
            <Droplets size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-foreground">DairyDrop</h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Calculator</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1">
          {allNavItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all", isActive ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-secondary/50">
            <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">{initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user?.username}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{user?.role}</p>
            </div>
            <button onClick={logout} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-lg transition-colors"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 lg:ml-64 min-h-screen">
        <header className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white shadow-md"><Droplets size={18} /></div>
            <h1 className="font-bold text-base text-foreground">DairyDrop</h1>
          </div>
          <div className="hidden lg:block">
            <h2 className="font-bold text-lg text-foreground">{allNavItems.find((n) => n.href === location)?.label ?? "Dashboard"}</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-foreground">{user?.username}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{user?.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-sm">{initials}</div>
            <button onClick={logout} className="lg:hidden p-2 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-xl transition-colors"><LogOut size={18} /></button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-10">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={location} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card/90 backdrop-blur-md border-t border-border">
        <div className="flex justify-around items-center px-2 py-2">
          {allNavItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center py-1 px-3 min-w-[56px]">
                <div className={cn("flex items-center justify-center w-11 h-11 rounded-2xl transition-all", isActive ? "bg-primary text-white shadow-lg -translate-y-1" : "text-muted-foreground")}>
                  <item.icon size={21} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={cn("text-[10px] font-semibold mt-0.5", isActive ? "text-primary" : "text-muted-foreground")}>{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
