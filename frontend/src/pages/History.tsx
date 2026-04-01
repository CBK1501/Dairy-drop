import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryService } from "@/services/delivery.service";
import { Delivery } from "@/types";
import { format } from "date-fns";
import { MonthPicker } from "@/components/MonthPicker";
import { Sun, Moon, Trash2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function History() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const formattedMonth = format(currentDate, "yyyy-MM");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ deliveries: Delivery[]; total: number }>({
    queryKey: ["deliveries", formattedMonth],
    queryFn: () => deliveryService.getAll(formattedMonth),
  });

  const { mutate: deleteDelivery } = useMutation({
    mutationFn: (id: string) => deliveryService.remove(id),
    onSuccess: () => {
      toast({ title: "Deleted", description: "Delivery entry removed." });
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete entry.", variant: "destructive" }),
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) deleteDelivery(id);
  };

  return (
    <div className="flex flex-col gap-2 max-w-lg mx-auto">
      <div className="text-center mb-4">
        <h2 className="font-display text-2xl font-bold text-foreground">Delivery History</h2>
        <p className="text-muted-foreground text-sm mt-1">Review your monthly records</p>
      </div>

      <MonthPicker currentDate={currentDate} onChange={setCurrentDate} />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-card border border-border rounded-2xl animate-pulse" />)}
        </div>
      ) : data?.deliveries && data.deliveries.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {data.deliveries.map((delivery) => (
              <motion.div key={delivery.id} layout
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="bg-secondary rounded-xl p-2 w-14 flex flex-col items-center justify-center">
                      <span className="font-display font-bold text-lg leading-none">{format(new Date(delivery.date + "T00:00:00"), "dd")}</span>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground mt-1">{format(new Date(delivery.date + "T00:00:00"), "EEE")}</span>
                    </div>
                    <div>
                      <div className="font-display font-bold text-xl">{delivery.totalLitres} <span className="text-base text-muted-foreground font-medium">L</span></div>
                      <div className="flex gap-3 mt-1">
                        {delivery.morningLitres != null && (
                          <div className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md"><Sun size={12} /> {delivery.morningLitres}L</div>
                        )}
                        {delivery.eveningLitres != null && (
                          <div className="flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md"><Moon size={12} /> {delivery.eveningLitres}L</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(delivery.id)}
                    className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-16 bg-card border border-dashed border-border rounded-3xl mt-4">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground"><AlertCircle size={28} /></div>
          <h3 className="font-bold text-lg mb-1">No Deliveries Found</h3>
          <p className="text-muted-foreground text-sm max-w-[200px] mx-auto">No records for {format(currentDate, "MMMM yyyy")}.</p>
        </div>
      )}
    </div>
  );
}
