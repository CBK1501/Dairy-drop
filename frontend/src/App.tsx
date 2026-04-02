import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/store/auth.store";
import { Toaster } from "@/components/ui/Toaster";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/AdminDashboard";
import UserDashboard from "@/pages/UserDashboard";
import Customers from "@/pages/Customers";
import CustomerDetail from "@/pages/CustomerDetail";
import AddEntry from "@/pages/AddEntry";
import HistoryPage from "@/pages/History";
import Settings from "@/pages/Settings";
import Admin from "@/pages/Admin";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 animate-pulse" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  const isAdmin = user.role === "admin";

  return (
    <Layout>
      <Routes>
        <Route path="/" element={isAdmin ? <AdminDashboard /> : <UserDashboard />} />
        {!isAdmin && <Route path="/customers" element={<Customers />} />}
        {!isAdmin && <Route path="/customers/:id" element={<CustomerDetail />} />}
        {!isAdmin && <Route path="/entry" element={<AddEntry />} />}
        {!isAdmin && <Route path="/history" element={<HistoryPage />} />}
        <Route path="/settings" element={<Settings />} />
        {isAdmin && <Route path="/admin" element={<Admin />} />}
        <Route path="*" element={<div className="text-center py-20"><h2 className="font-bold text-2xl text-foreground">404 — Page Not Found</h2></div>} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HashRouter>
          <Router />
          <Toaster />
        </HashRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
