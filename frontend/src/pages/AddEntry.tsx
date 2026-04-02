import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "@/services/customer.service";
import { deliveryService } from "@/services/delivery.service";
import { Customer, Delivery } from "@/types";
import { format } from "date-fns";
import { Sun, Moon, Droplets, Save, Info, ChevronDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function Toggle({ checked, onChange, color }: { checked: boolean; onChange: (v: boolean) => void; color: "amber" | "indigo" }) {
  const on = color === "amber" ? "bg-amber-500" : "bg-indigo-500";
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none", checked ? on : "bg-border")}>
      <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform", checked ? "translate-x-6" : "translate-x-1")} />
    </button>
  );
}

export default function AddEntry() {
  const queryClient = useQueryClient();

  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [hasMorning, setHasMorning] = useState(false);
  const [morningLitres, setMorningLitres] = useState("");
  const [hasEvening, setHasEvening] = useState(false);
  const [eveningLitres, setEveningLitres] = useState("");

  const { data } = useQuery<{ customers: Customer[] }>({
    queryKey: ["customers"],
    queryFn: () => customerService.getAll(),
  });

  const customers = data?.customers?.filter(c => c.isActive) ?? [];
  const selectedCustomer = customers.find(c => c.id === customerId);

  // Fetch existing entries for selected customer + month
  const month = date.slice(0, 7);
  const { data: existingData } = useQuery<{ deliveries: Delivery[]; total: number }>({
    queryKey: ["deliveries", customerId, month],
    queryFn: () => deliveryService.getAll(customerId, month),
    enabled: !!customerId,
  });
  const existingEntry = existingData?.deliveries?.find(d => d.date === date);

  // Auto-fill form when existing entry is found for selected date
  useEffect(() => {
    if (existingEntry) {
      setHasMorning(existingEntry.morningLitres != null);
      setMorningLitres(existingEntry.morningLitres != null ? String(existingEntry.morningLitres) : "");
      setHasEvening(existingEntry.eveningLitres != null);
      setEveningLitres(existingEntry.eveningLitres != null ? String(existingEntry.eveningLitres) : "");
    } else {
      // No entry — reset to blank
      setHasMorning(false);
      setMorningLitres("");
      setHasEvening(false);
      setEveningLitres("");
    }
  }, [existingEntry, date, customerId]);

  const payload = {
    date,
    morningLitres: hasMorning ? parseFloat(morningLitres) || 0 : null,
    eveningLitres: hasEvening ? parseFloat(eveningLitres) || 0 : null,
  };

  // Create new entry
  const { mutate: createEntry, isPending: isCreating } = useMutation({
    mutationFn: () => deliveryService.create(customerId, payload),
    onSuccess: () => {
      toast({ title: "Entry saved!", description: `${selectedCustomer?.name} — ${format(new Date(date + "T00:00:00"), "dd MMM yyyy")}` });
      queryClient.invalidateQueries({ queryKey: ["deliveries", customerId] });
      queryClient.invalidateQueries({ queryKey: ["summary", customerId] });
    },
    onError: (e: Error) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  // Update existing entry
  const { mutate: updateEntry, isPending: isUpdating } = useMutation({
    mutationFn: () => deliveryService.update(customerId, existingEntry!.id, payload),
    onSuccess: () => {
      toast({ title: "Entry updated!", description: `${selectedCustomer?.name} — ${format(new Date(date + "T00:00:00"), "dd MMM yyyy")}` });
      queryClient.invalidateQueries({ queryKey: ["deliveries", customerId] });
      queryClient.invalidateQueries({ queryKey: ["summary", customerId] });
    },
    onError: (e: Error) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const isPending = isCreating || isUpdating;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) { toast({ title: "Select a customer", variant: "destructive" }); return; }
    if (!hasMorning && !hasEvening) { toast({ title: "Enable at least one session", variant: "destructive" }); return; }
    existingEntry ? updateEntry() : createEntry();
  };

  const totalLitres = (hasMorning ? parseFloat(morningLitres) || 0 : 0) + (hasEvening ? parseFloat(eveningLitres) || 0 : 0);

  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto">
      <div className="text-center">
        <h2 className="font-bold text-2xl text-foreground">Add Entry</h2>
        <p className="text-muted-foreground text-sm mt-1">Record daily milk delivery</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Customer selector */}
        <div className="bg-card rounded-3xl p-5 border border-border shadow-sm">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">Select Customer</label>
          {customers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active customers. Add customers first.</p>
          ) : (
            <div className="relative">
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}
                className="w-full appearance-none bg-secondary/50 border border-border focus:border-primary text-foreground px-4 py-3 rounded-2xl outline-none text-sm font-medium pr-10">
                <option value="">-- Select customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          )}
        </div>

        {/* Date picker */}
        <div className="bg-card rounded-3xl p-5 border border-border shadow-sm">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">Date</label>
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full bg-secondary/50 border border-border focus:border-primary text-foreground px-4 py-3 rounded-2xl outline-none text-sm font-medium" />
        </div>

        {/* Existing entry info */}
        {customerId && existingEntry && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-800">Existing entry — {format(new Date(date + "T00:00:00"), "dd MMM yyyy")}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {existingEntry.morningLitres != null && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg">
                      <Sun size={11} /> Morning: {existingEntry.morningLitres} L
                    </span>
                  )}
                  {existingEntry.eveningLitres != null && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-lg">
                      <Moon size={11} /> Evening: {existingEntry.eveningLitres} L
                    </span>
                  )}
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-lg">
                    Total: {existingEntry.totalLitres} L
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1.5">Values pre-filled below. Change what you need and save.</p>
              </div>
            </div>
          </div>
        )}

        {/* Morning toggle */}
        <div className={cn("rounded-3xl p-5 border-2 transition-all", hasMorning ? "bg-amber-50/60 border-amber-200" : "bg-card border-border")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                hasMorning ? "bg-amber-500 text-white shadow-md" : "bg-secondary text-muted-foreground")}>
                <Sun size={20} />
              </div>
              <div>
                <p className="font-bold text-foreground">Morning</p>
                <p className="text-xs text-muted-foreground">{hasMorning ? "Tap to disable" : "Tap to enable"}</p>
              </div>
            </div>
            <Toggle checked={hasMorning} onChange={setHasMorning} color="amber" />
          </div>
          <AnimatePresence>
            {hasMorning && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-4">
                <div className="relative">
                  <Droplets size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
                  <input type="number" step="any" min="0" value={morningLitres}
                    onChange={(e) => setMorningLitres(e.target.value)}
                    className="w-full bg-white border-2 border-amber-200 focus:border-amber-500 text-foreground font-bold pl-10 pr-14 py-4 rounded-2xl outline-none text-2xl"
                    placeholder="0.0" />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg">L</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Evening toggle */}
        <div className={cn("rounded-3xl p-5 border-2 transition-all", hasEvening ? "bg-indigo-50/60 border-indigo-200" : "bg-card border-border")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                hasEvening ? "bg-indigo-500 text-white shadow-md" : "bg-secondary text-muted-foreground")}>
                <Moon size={20} />
              </div>
              <div>
                <p className="font-bold text-foreground">Evening</p>
                <p className="text-xs text-muted-foreground">{hasEvening ? "Tap to disable" : "Tap to enable"}</p>
              </div>
            </div>
            <Toggle checked={hasEvening} onChange={setHasEvening} color="indigo" />
          </div>
          <AnimatePresence>
            {hasEvening && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-4">
                <div className="relative">
                  <Droplets size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
                  <input type="number" step="any" min="0" value={eveningLitres}
                    onChange={(e) => setEveningLitres(e.target.value)}
                    className="w-full bg-white border-2 border-indigo-200 focus:border-indigo-500 text-foreground font-bold pl-10 pr-14 py-4 rounded-2xl outline-none text-2xl"
                    placeholder="0.0" />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg">L</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live total preview */}
        {customerId && (hasMorning || hasEvening) && (
          <div className="bg-secondary/50 rounded-2xl px-5 py-4 flex items-center justify-between border border-border">
            <div className="flex items-center gap-3">
              {hasMorning && <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg"><Sun size={11} />{morningLitres || 0} L</span>}
              {hasEvening && <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg"><Moon size={11} />{eveningLitres || 0} L</span>}
            </div>
            <div className="text-right">
              <p className="font-bold text-foreground">{totalLitres.toFixed(1)} L</p>
              <p className="text-xs font-semibold text-green-600">Rs. {selectedCustomer ? (totalLitres * selectedCustomer.pricePerLitre).toFixed(2) : "0.00"}</p>
            </div>
          </div>
        )}

        {/* Submit */}
        <button type="submit" disabled={isPending || !customerId}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base shadow-lg">
          <Save size={20} />
          {isPending ? "Saving..." : existingEntry ? "Update Entry" : "Save Entry"}
        </button>
      </form>
    </div>
  );
}
