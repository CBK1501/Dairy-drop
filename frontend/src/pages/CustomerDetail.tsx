import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { customerService } from "@/services/customer.service";
import { deliveryService } from "@/services/delivery.service";
import { Customer, Delivery, DeliverySummary } from "@/types";
import { MonthPicker } from "@/components/MonthPicker";
import { format } from "date-fns";
import { Sun, Moon, Trash2, FileDown, ArrowLeft, Droplets, Plus, X, Edit2, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Toggle({ checked, onChange, color }: { checked: boolean; onChange: (v: boolean) => void; color: "amber" | "indigo" }) {
  const on = color === "amber" ? "bg-amber-500" : "bg-indigo-500";
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none", checked ? on : "bg-border")}>
      <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform", checked ? "translate-x-6" : "translate-x-1")} />
    </button>
  );
}

interface EntryForm {
  date: string;
  hasMorning: boolean;
  morningLitres: string;
  hasEvening: boolean;
  eveningLitres: string;
}

function EntryFormFields({ form, onChange }: { form: EntryForm; onChange: (f: EntryForm) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Date</label>
        <input type="date" required value={form.date} onChange={(e) => onChange({ ...form, date: e.target.value })}
          className="w-full bg-secondary/50 border border-border focus:border-primary text-foreground px-4 py-2.5 rounded-xl outline-none text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {/* Morning */}
        <div className={cn("rounded-xl p-3 border transition-all", form.hasMorning ? "bg-amber-50/60 border-amber-200" : "bg-secondary/20 border-border")}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sun size={15} className={form.hasMorning ? "text-amber-500" : "text-muted-foreground"} />
              <span className="font-semibold text-xs text-foreground">Morning</span>
            </div>
            <Toggle checked={form.hasMorning} onChange={(v) => onChange({ ...form, hasMorning: v })} color="amber" />
          </div>
          {form.hasMorning && (
            <div className="relative">
              <input type="number" step="any" min="0" value={form.morningLitres}
                onChange={(e) => onChange({ ...form, morningLitres: e.target.value })}
                className="w-full bg-white border border-amber-200 focus:border-amber-500 text-foreground font-bold px-3 pr-8 py-2 rounded-lg outline-none text-base" placeholder="0.0" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium">L</span>
            </div>
          )}
        </div>
        {/* Evening */}
        <div className={cn("rounded-xl p-3 border transition-all", form.hasEvening ? "bg-indigo-50/60 border-indigo-200" : "bg-secondary/20 border-border")}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Moon size={15} className={form.hasEvening ? "text-indigo-500" : "text-muted-foreground"} />
              <span className="font-semibold text-xs text-foreground">Evening</span>
            </div>
            <Toggle checked={form.hasEvening} onChange={(v) => onChange({ ...form, hasEvening: v })} color="indigo" />
          </div>
          {form.hasEvening && (
            <div className="relative">
              <input type="number" step="any" min="0" value={form.eveningLitres}
                onChange={(e) => onChange({ ...form, eveningLitres: e.target.value })}
                className="w-full bg-white border border-indigo-200 focus:border-indigo-500 text-foreground font-bold px-3 pr-8 py-2 rounded-lg outline-none text-base" placeholder="0.0" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium">L</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const defaultForm = (): EntryForm => ({
  date: format(new Date(), "yyyy-MM-dd"),
  hasMorning: false, morningLitres: "",
  hasEvening: false, eveningLitres: "",
});

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [currentDate, setCurrentDate] = useState(new Date());
  const formattedMonth = format(currentDate, "yyyy-MM");
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<EntryForm>(defaultForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EntryForm | null>(null);

  const { data: customerData } = useQuery<{ customers: Customer[] }>({
    queryKey: ["customers"],
    queryFn: () => customerService.getAll(),
  });
  const customer = customerData?.customers?.find((c) => c.id === id);

  const { data, isLoading } = useQuery<{ deliveries: Delivery[]; total: number }>({
    queryKey: ["deliveries", id, formattedMonth],
    queryFn: () => deliveryService.getAll(id!, formattedMonth),
    enabled: !!id,
  });

  const { data: summary } = useQuery<DeliverySummary>({
    queryKey: ["summary", id, formattedMonth],
    queryFn: () => deliveryService.getSummary(id!, formattedMonth),
    enabled: !!id,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["deliveries", id] });
    queryClient.invalidateQueries({ queryKey: ["summary", id] });
  };

  const { mutate: addDelivery, isPending: isAdding } = useMutation({
    mutationFn: () => deliveryService.create(id!, {
      date: addForm.date,
      morningLitres: addForm.hasMorning ? parseFloat(addForm.morningLitres) || 0 : null,
      eveningLitres: addForm.hasEvening ? parseFloat(addForm.eveningLitres) || 0 : null,
    }),
    onSuccess: () => { toast({ title: "Entry saved!" }); setShowAdd(false); setAddForm(defaultForm()); invalidate(); },
    onError: (e: Error) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const { mutate: editDelivery, isPending: isEditing } = useMutation({
    mutationFn: () => deliveryService.update(id!, editingId!, {
      date: editForm!.date,
      morningLitres: editForm!.hasMorning ? parseFloat(editForm!.morningLitres) || 0 : null,
      eveningLitres: editForm!.hasEvening ? parseFloat(editForm!.eveningLitres) || 0 : null,
    }),
    onSuccess: () => { toast({ title: "Entry updated!" }); setEditingId(null); setEditForm(null); invalidate(); },
    onError: (e: Error) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const { mutate: deleteDelivery } = useMutation({
    mutationFn: (deliveryId: string) => deliveryService.remove(id!, deliveryId),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); },
    onError: () => toast({ title: "Error", description: "Failed to delete.", variant: "destructive" }),
  });

  const startEdit = (d: Delivery) => {
    setEditingId(d.id);
    setEditForm({
      date: d.date,
      hasMorning: d.morningLitres != null,
      morningLitres: d.morningLitres != null ? String(d.morningLitres) : "1.5",
      hasEvening: d.eveningLitres != null,
      eveningLitres: d.eveningLitres != null ? String(d.eveningLitres) : "1.5",
    });
    setShowAdd(false);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.hasMorning && !addForm.hasEvening) { toast({ title: "Select at least one session", variant: "destructive" }); return; }
    addDelivery();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm!.hasMorning && !editForm!.hasEvening) { toast({ title: "Select at least one session", variant: "destructive" }); return; }
    editDelivery();
  };

  const handleDownloadPDF = () => {
    if (!data?.deliveries?.length || !customer) return;
    const doc = new jsPDF();
    const monthLabel = format(currentDate, "MMMM yyyy");
    doc.setFont("helvetica", "bold"); doc.setFontSize(18);
    doc.text("DairyDrop - Monthly Milk Report", 14, 20);
    doc.setFont("helvetica", "normal"); doc.setFontSize(11);
    doc.text(`Month    : ${monthLabel}`, 14, 32);
    doc.text(`Customer : ${customer.name}`, 14, 40);
    doc.text(`Mobile   : ${customer.phone}`, 14, 48);
    doc.text(`Rate     : Rs. ${customer.pricePerLitre} per litre`, 14, 56);
    autoTable(doc, {
      startY: 65,
      head: [["Date", "Morning (L)", "Evening (L)", "Total (L)", "Amount (Rs.)"]],
      body: data.deliveries.map((d) => [
        format(new Date(d.date + "T00:00:00"), "dd MMM yyyy"),
        d.morningLitres != null ? `${d.morningLitres} L` : "-",
        d.eveningLitres != null ? `${d.eveningLitres} L` : "-",
        `${d.totalLitres} L`,
        `Rs. ${(d.totalLitres * customer.pricePerLitre).toFixed(2)}`,
      ]),
      styles: { font: "helvetica", fontSize: 10, cellPadding: 4 },
      headStyles: { font: "helvetica", fontStyle: "bold", fillColor: [30, 30, 30], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 30, halign: "center" }, 2: { cellWidth: 30, halign: "center" }, 3: { cellWidth: 28, halign: "center" }, 4: { cellWidth: 37, halign: "right" } },
    });
    const finalY = (doc as any).lastAutoTable.finalY + 12;
    doc.setDrawColor(200, 200, 200); doc.line(14, finalY - 4, 196, finalY - 4);
    doc.setFont("helvetica", "normal"); doc.setFontSize(11);
    doc.text(`Total Litres    : ${summary?.totalLitres ?? 0} L`, 14, finalY + 2);
    doc.text(`Price per Litre : Rs. ${summary?.pricePerLitre ?? 0}`, 14, finalY + 10);
    doc.setFont("helvetica", "bold"); doc.setFontSize(13);
    doc.text(`Total Amount    : Rs. ${summary?.totalCost ?? 0}`, 14, finalY + 22);
    doc.save(`${customer.name}_${monthLabel.replace(" ", "_")}.pdf`);
  };

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => setLocation("/customers")} className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-2xl text-foreground">{customer?.name ?? "Customer"}</h2>
          <p className="text-muted-foreground text-sm">{customer?.phone} · Rs. {customer?.pricePerLitre}/L</p>
        </div>
        <button onClick={() => { setShowAdd(!showAdd); setEditingId(null); setEditForm(null); }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:bg-primary/90 transition-colors">
          {showAdd ? <X size={16} /> : <Plus size={16} />}
          {showAdd ? "Cancel" : "Add Entry"}
        </button>
      </div>

      {/* Add Entry Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-card border border-primary/20 rounded-3xl p-5 shadow-sm">
            <h3 className="font-bold text-foreground mb-4">New Entry</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <EntryFormFields form={addForm} onChange={setAddForm} />
              <button type="submit" disabled={isAdding}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl hover:bg-primary/90 disabled:opacity-50 transition-all">
                {isAdding ? "Saving..." : "Save Entry"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Litres", value: `${summary.totalLitres} L`, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Morning", value: `${summary.morningLitres} L`, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Evening", value: `${summary.eveningLitres} L`, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Total Amount", value: `Rs. ${summary.totalCost}`, color: "text-green-600", bg: "bg-green-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-border/50`}>
              <p className="text-xs font-semibold text-muted-foreground mb-1">{s.label}</p>
              <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Month picker + PDF */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex-1 w-full">
          <MonthPicker currentDate={currentDate} onChange={setCurrentDate} />
        </div>
        {data?.deliveries && data.deliveries.length > 0 && (
          <button onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-green-700 transition-colors shadow-md whitespace-nowrap w-full sm:w-auto justify-center">
            <FileDown size={16} /> Download PDF
          </button>
        )}
      </div>

      {/* Entries list */}
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-card border border-border rounded-2xl animate-pulse" />)}</div>
      ) : data?.deliveries && data.deliveries.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {data.deliveries.map((delivery) => (
              <motion.div key={delivery.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">

                {/* Edit form inline */}
                {editingId === delivery.id && editForm ? (
                  <form onSubmit={handleEditSubmit} className="p-4 space-y-3 bg-primary/5 border-b border-primary/20">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm text-foreground">Edit Entry</p>
                      <button type="button" onClick={() => { setEditingId(null); setEditForm(null); }}
                        className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"><X size={16} /></button>
                    </div>
                    <EntryFormFields form={editForm} onChange={setEditForm} />
                    <button type="submit" disabled={isEditing}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all text-sm">
                      <Check size={16} /> {isEditing ? "Saving..." : "Update Entry"}
                    </button>
                  </form>
                ) : (
                  <div className="flex justify-between items-center p-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-secondary rounded-xl p-2 w-14 flex flex-col items-center justify-center shrink-0">
                        <span className="font-bold text-lg leading-none">{format(new Date(delivery.date + "T00:00:00"), "dd")}</span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground mt-0.5">{format(new Date(delivery.date + "T00:00:00"), "EEE")}</span>
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-xl">{delivery.totalLitres} <span className="text-base text-muted-foreground font-medium">L</span></span>
                          <span className="text-sm font-semibold text-green-600">Rs. {(delivery.totalLitres * (customer?.pricePerLitre ?? 0)).toFixed(2)}</span>
                        </div>
                        <div className="flex gap-2 mt-1">
                          {delivery.morningLitres != null && (
                            <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md"><Sun size={11} /> {delivery.morningLitres} L</span>
                          )}
                          {delivery.eveningLitres != null && (
                            <span className="flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md"><Moon size={11} /> {delivery.eveningLitres} L</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(delivery)}
                        className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => { if (confirm("Delete this entry?")) deleteDelivery(delivery.id); }}
                        className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-16 bg-card border border-dashed border-border rounded-3xl">
          <Droplets size={32} className="mx-auto mb-3 text-muted-foreground opacity-40" />
          <h3 className="font-bold text-lg mb-1">No entries for {format(currentDate, "MMMM yyyy")}</h3>
          <p className="text-muted-foreground text-sm">Click "Add Entry" to record deliveries.</p>
        </div>
      )}
    </div>
  );
}
