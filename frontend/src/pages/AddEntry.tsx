import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryService } from "@/services/delivery.service";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Calendar, Sun, Moon, Droplets } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function AddEntry() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [hasMorning, setHasMorning] = useState(true);
  const [morningLitres, setMorningLitres] = useState("1.5");
  const [hasEvening, setHasEvening] = useState(false);
  const [eveningLitres, setEveningLitres] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: deliveryService.create,
    onSuccess: () => {
      toast({ title: "Success!", description: "Delivery recorded successfully." });
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      setLocation("/history");
    },
    onError: (e: Error) => toast({ title: "Failed to save", description: e.message, variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasMorning && !hasEvening) {
      toast({ title: "Select a session", description: "Please select morning or evening.", variant: "destructive" });
      return;
    }
    mutate({
      date,
      morningLitres: hasMorning ? parseFloat(morningLitres) || 0 : null,
      eveningLitres: hasEvening ? parseFloat(eveningLitres) || 0 : null,
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <div className="text-center mb-2">
        <h2 className="font-display text-2xl font-bold text-foreground">Record Delivery</h2>
        <p className="text-muted-foreground text-sm mt-1">Add milk received for a specific date</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card rounded-3xl p-5 border border-border shadow-sm">
          <label className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
            <Calendar size={18} className="text-primary" /> Select Date
          </label>
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full bg-secondary/50 border border-transparent focus:border-primary text-foreground text-lg px-4 py-4 rounded-2xl outline-none transition-all" />
        </div>

        {/* Morning */}
        <div className={cn("rounded-3xl p-5 border transition-all", hasMorning ? "bg-amber-50/50 border-amber-200 shadow-sm" : "bg-card border-border")}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", hasMorning ? "bg-amber-500 text-white shadow-md" : "bg-secondary text-muted-foreground")}>
                <Sun size={20} />
              </div>
              <h3 className="font-bold text-lg text-foreground">Morning</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={hasMorning} onChange={(e) => setHasMorning(e.target.checked)} />
              <div className="w-11 h-6 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
          <div className={cn("transition-all overflow-hidden", hasMorning ? "max-h-24 opacity-100" : "max-h-0 opacity-0")}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Droplets size={18} className="text-amber-500" /></div>
              <input type="number" step="0.1" min="0" placeholder="0.0" value={morningLitres} onChange={(e) => setMorningLitres(e.target.value)}
                className="w-full bg-white border border-amber-200 focus:border-amber-500 text-foreground text-xl font-bold px-12 py-4 rounded-2xl outline-none transition-all" />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none"><span className="text-muted-foreground font-medium">Litres</span></div>
            </div>
          </div>
        </div>

        {/* Evening */}
        <div className={cn("rounded-3xl p-5 border transition-all", hasEvening ? "bg-indigo-50/50 border-indigo-200 shadow-sm" : "bg-card border-border")}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", hasEvening ? "bg-indigo-500 text-white shadow-md" : "bg-secondary text-muted-foreground")}>
                <Moon size={20} />
              </div>
              <h3 className="font-bold text-lg text-foreground">Evening</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={hasEvening} onChange={(e) => setHasEvening(e.target.checked)} />
              <div className="w-11 h-6 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>
          <div className={cn("transition-all overflow-hidden", hasEvening ? "max-h-24 opacity-100" : "max-h-0 opacity-0")}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Droplets size={18} className="text-indigo-500" /></div>
              <input type="number" step="0.1" min="0" placeholder="0.0" value={eveningLitres} onChange={(e) => setEveningLitres(e.target.value)}
                className="w-full bg-white border border-indigo-200 focus:border-indigo-500 text-foreground text-xl font-bold px-12 py-4 rounded-2xl outline-none transition-all" />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none"><span className="text-muted-foreground font-medium">Litres</span></div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={isPending || (!hasMorning && !hasEvening)}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-lg py-5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4">
          {isPending ? "Saving..." : "Save Delivery"}
        </button>
      </form>
    </div>
  );
}
