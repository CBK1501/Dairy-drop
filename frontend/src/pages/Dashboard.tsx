import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { deliveryService } from "@/services/delivery.service";
import { settingsService } from "@/services/settings.service";
import { DeliverySummary, AppSettings } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Droplets, TrendingUp, Sun, Moon, AlertCircle, ChevronRight, CalendarDays, IndianRupee } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const [currentMonth] = useState(format(new Date(), "yyyy-MM"));

  const { data: summary, isLoading: sl } = useQuery<DeliverySummary>({
    queryKey: ["summary", currentMonth],
    queryFn: () => deliveryService.getSummary(currentMonth),
  });

  const { data: settings, isLoading: stl } = useQuery<AppSettings>({
    queryKey: ["settings"],
    queryFn: () => settingsService.get(),
  });

  if (sl || stl) return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-52 bg-secondary rounded-3xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-secondary rounded-3xl" />)}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {(!settings || settings.pricePerLitre <= 0) && (
        <Link href="/settings">
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3 cursor-pointer hover:bg-orange-100 transition-colors">
            <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h4 className="font-bold text-orange-800 text-sm">Price per litre not set!</h4>
              <p className="text-orange-700 text-xs mt-1">Click here to set your milk price.</p>
            </div>
            <ChevronRight className="text-orange-400 self-center" size={20} />
          </div>
        </Link>
      )}

      {/* Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-orange-400 rounded-3xl p-6 lg:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="text-white/80 font-medium text-sm mb-1 uppercase tracking-wider">This Month</p>
            <h2 className="font-bold text-3xl lg:text-4xl">{format(new Date(), "MMMM yyyy")}</h2>
            <div className="mt-2 inline-flex bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
              {summary?.daysRecorded || 0} Days Recorded
            </div>
          </div>
          <div className="lg:text-right">
            <p className="text-white/80 font-medium text-sm mb-1">Total Estimated Cost</p>
            <h3 className="font-black text-5xl lg:text-6xl tracking-tight">{formatCurrency(summary?.totalCost || 0)}</h3>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-3xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-3"><Droplets size={20} /></div>
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Total Litres</p>
          <p className="font-bold text-2xl text-foreground">{summary?.totalLitres || 0} <span className="text-base text-muted-foreground font-medium">L</span></p>
        </div>
        <div className="bg-card rounded-3xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-3"><IndianRupee size={20} /></div>
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Rate / Litre</p>
          <p className="font-bold text-2xl text-foreground">₹{summary?.pricePerLitre || 0} <span className="text-base text-muted-foreground font-medium">/L</span></p>
        </div>
        <div className="bg-card rounded-3xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-3"><Sun size={20} /></div>
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Morning</p>
          <p className="font-bold text-2xl text-foreground">{summary?.morningLitres || 0} <span className="text-base text-muted-foreground font-medium">L</span></p>
        </div>
        <div className="bg-card rounded-3xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mb-3"><Moon size={20} /></div>
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Evening</p>
          <p className="font-bold text-2xl text-foreground">{summary?.eveningLitres || 0} <span className="text-base text-muted-foreground font-medium">L</span></p>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-3xl p-6 border border-border shadow-sm">
          <h3 className="font-bold text-lg mb-5 text-foreground">Session Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500"><Sun size={20} /></div>
                <div>
                  <p className="font-semibold text-foreground">Morning Deliveries</p>
                  <p className="text-xs text-muted-foreground">{summary?.daysRecorded || 0} days this month</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl">{summary?.morningLitres || 0} L</p>
                <p className="text-xs text-muted-foreground">₹{((summary?.morningLitres || 0) * (summary?.pricePerLitre || 0)).toFixed(2)}</p>
              </div>
            </div>
            <div className="h-px bg-border/50" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500"><Moon size={20} /></div>
                <div>
                  <p className="font-semibold text-foreground">Evening Deliveries</p>
                  <p className="text-xs text-muted-foreground">{summary?.daysRecorded || 0} days this month</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl">{summary?.eveningLitres || 0} L</p>
                <p className="text-xs text-muted-foreground">₹{((summary?.eveningLitres || 0) * (summary?.pricePerLitre || 0)).toFixed(2)}</p>
              </div>
            </div>
            <div className="h-px bg-border/50" />
            <div className="flex items-center justify-between bg-secondary/50 rounded-2xl px-4 py-3">
              <p className="font-bold text-foreground">Total</p>
              <div className="text-right">
                <p className="font-bold text-xl">{summary?.totalLitres || 0} L</p>
                <p className="text-xs font-semibold text-primary">{formatCurrency(summary?.totalCost || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-lg text-foreground">Quick Actions</h3>
          <Link href="/add">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 cursor-pointer transition-colors">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Droplets size={22} /></div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Record Today's Delivery</p>
                <p className="text-xs text-muted-foreground">Add morning or evening litres</p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </div>
          </Link>
          <Link href="/history">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border hover:bg-secondary cursor-pointer transition-colors">
              <div className="w-11 h-11 rounded-2xl bg-secondary text-muted-foreground flex items-center justify-center"><CalendarDays size={22} /></div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">View History</p>
                <p className="text-xs text-muted-foreground">Browse all past deliveries</p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </div>
          </Link>
          <Link href="/settings">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border hover:bg-secondary cursor-pointer transition-colors">
              <div className="w-11 h-11 rounded-2xl bg-secondary text-muted-foreground flex items-center justify-center"><TrendingUp size={22} /></div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Update Price Rate</p>
                <p className="text-xs text-muted-foreground">Currently ₹{settings?.pricePerLitre || 0}/L</p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
