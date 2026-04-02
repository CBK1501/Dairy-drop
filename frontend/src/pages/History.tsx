import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { customerService } from "@/services/customer.service";
import { deliveryService } from "@/services/delivery.service";
import { Customer, Delivery, DeliverySummary } from "@/types";
import { MonthPicker } from "@/components/MonthPicker";
import { format, getDaysInMonth, startOfMonth } from "date-fns";
import { Sun, Moon, FileDown, Droplets, ChevronDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function HistoryPage() {
  const [customerId, setCustomerId] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const month = format(currentDate, "yyyy-MM");

  const { data: customersData } = useQuery<{ customers: Customer[] }>({
    queryKey: ["customers"],
    queryFn: () => customerService.getAll(),
  });

  const customers = customersData?.customers ?? [];
  const selectedCustomer = customers.find(c => c.id === customerId);

  const { data, isLoading } = useQuery<{ deliveries: Delivery[]; total: number }>({
    queryKey: ["deliveries", customerId, month],
    queryFn: () => deliveryService.getAll(customerId, month),
    enabled: !!customerId,
  });

  const { data: summary } = useQuery<DeliverySummary>({
    queryKey: ["summary", customerId, month],
    queryFn: () => deliveryService.getSummary(customerId, month),
    enabled: !!customerId,
  });

  // Generate all days of the selected month
  const allDays = (() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const year = currentDate.getFullYear();
    const mon = currentDate.getMonth();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, mon, i + 1);
      return format(d, "yyyy-MM-dd");
    });
  })();

  const deliveryMap = new Map((data?.deliveries ?? []).map(d => [d.date, d]));

  // Full rows — every day with entry or null
  const allRows = allDays.map(dateStr => ({
    date: dateStr,
    entry: deliveryMap.get(dateStr) ?? null,
  }));

  const handleDownloadPDF = () => {
    if (!selectedCustomer) return;
    const doc = new jsPDF();
    const monthLabel = format(currentDate, "MMMM yyyy");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("DairyDrop - Monthly Milk Report", 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Month    : ${monthLabel}`, 14, 32);
    doc.text(`Customer : ${selectedCustomer.name}`, 14, 40);
    doc.text(`Mobile   : ${selectedCustomer.phone}`, 14, 48);
    doc.text(`Rate     : Rs. ${selectedCustomer.pricePerLitre} per litre`, 14, 56);

    autoTable(doc, {
      startY: 65,
      head: [["#", "Date", "Morning (L)", "Evening (L)", "Total (L)", "Amount (Rs.)"]],
      body: allRows.map((row, i) => [
        i + 1,
        format(new Date(row.date + "T00:00:00"), "dd MMM yyyy"),
        row.entry?.morningLitres != null ? `${row.entry.morningLitres} L` : "-",
        row.entry?.eveningLitres != null ? `${row.entry.eveningLitres} L` : "-",
        row.entry ? `${row.entry.totalLitres} L` : "-",
        row.entry ? `Rs. ${(row.entry.totalLitres * selectedCustomer.pricePerLitre).toFixed(2)}` : "-",
      ]),
      styles: { font: "helvetica", fontSize: 9, cellPadding: 3 },
      headStyles: { font: "helvetica", fontStyle: "bold", fillColor: [30, 30, 30], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      bodyStyles: { textColor: [50, 50, 50] },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 35 },
        2: { cellWidth: 28, halign: "center" },
        3: { cellWidth: 28, halign: "center" },
        4: { cellWidth: 26, halign: "center" },
        5: { cellWidth: 33, halign: "right" },
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 12;
    doc.setDrawColor(180, 180, 180);
    doc.line(14, finalY - 4, 196, finalY - 4);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Total Litres    : ${summary?.totalLitres ?? 0} L`, 14, finalY + 2);
    doc.text(`Price per Litre : Rs. ${summary?.pricePerLitre ?? 0}`, 14, finalY + 10);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(`Total Amount    : Rs. ${summary?.totalCost ?? 0}`, 14, finalY + 22);

    doc.save(`${selectedCustomer.name}_${monthLabel.replace(" ", "_")}.pdf`);
  };

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="font-bold text-2xl text-foreground">History</h2>
        <p className="text-muted-foreground text-sm mt-1">Preview monthly report and download PDF</p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-3xl p-5 border border-border shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Customer</label>
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
        </div>
        <div className="flex-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Month</label>
          <MonthPicker currentDate={currentDate} onChange={setCurrentDate} />
        </div>
      </div>

      {/* Empty state */}
      {!customerId && (
        <div className="text-center py-16 bg-card border border-dashed border-border rounded-3xl">
          <Droplets size={32} className="mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="font-semibold text-foreground">Select a customer to preview report</p>
        </div>
      )}

      {/* Report Preview */}
      {customerId && (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">

          {/* Header */}
          <div className="px-6 py-5 border-b border-border bg-secondary/20">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Monthly Report Preview</p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div>
                <p className="font-bold text-lg text-foreground">{selectedCustomer?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedCustomer?.phone} &nbsp;·&nbsp; Rs. {selectedCustomer?.pricePerLitre}/L</p>
              </div>
              <p className="font-semibold text-primary text-sm">{format(currentDate, "MMMM yyyy")}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-9 bg-secondary/50 rounded-xl animate-pulse" />)}</div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border">
                      <th className="text-left px-3 py-3 text-xs font-bold text-muted-foreground uppercase w-8">#</th>
                      <th className="text-left px-3 py-3 text-xs font-bold text-muted-foreground uppercase">Date</th>
                      <th className="text-center px-3 py-3 text-xs font-bold text-amber-600 uppercase">Morning</th>
                      <th className="text-center px-3 py-3 text-xs font-bold text-indigo-600 uppercase">Evening</th>
                      <th className="text-center px-3 py-3 text-xs font-bold text-muted-foreground uppercase">Total</th>
                      <th className="text-right px-3 py-3 text-xs font-bold text-green-600 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {allRows.map((row, i) => {
                      const hasEntry = !!row.entry;
                      return (
                        <tr key={row.date} className={hasEntry ? (i % 2 === 0 ? "bg-white" : "bg-secondary/10") : "bg-red-50/30"}>
                          <td className="px-3 py-2.5 text-xs text-muted-foreground font-medium">{i + 1}</td>
                          <td className="px-3 py-2.5 font-semibold text-foreground text-xs">
                            {format(new Date(row.date + "T00:00:00"), "dd MMM yyyy")}
                            <span className="ml-1.5 text-[10px] text-muted-foreground font-normal">
                              {format(new Date(row.date + "T00:00:00"), "EEE")}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {hasEntry && row.entry!.morningLitres != null
                              ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md"><Sun size={10} />{row.entry!.morningLitres} L</span>
                              : <span className="text-muted-foreground text-sm font-medium">—</span>}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {hasEntry && row.entry!.eveningLitres != null
                              ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md"><Moon size={10} />{row.entry!.eveningLitres} L</span>
                              : <span className="text-muted-foreground text-sm font-medium">—</span>}
                          </td>
                          <td className="px-3 py-2.5 text-center font-bold text-foreground text-xs">
                            {hasEntry ? `${row.entry!.totalLitres} L` : <span className="text-muted-foreground font-medium">—</span>}
                          </td>
                          <td className="px-3 py-2.5 text-right font-bold text-xs">
                            {hasEntry
                              ? <span className="text-green-600">Rs. {(row.entry!.totalLitres * (selectedCustomer?.pricePerLitre ?? 0)).toFixed(2)}</span>
                              : <span className="text-muted-foreground font-medium">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary footer */}
              {summary && (
                <div className="border-t-2 border-border bg-secondary/20 px-6 py-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">Total Litres</p>
                      <p className="font-bold text-lg text-blue-600">{summary.totalLitres} L</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">Morning</p>
                      <p className="font-bold text-lg text-amber-600">{summary.morningLitres} L</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">Evening</p>
                      <p className="font-bold text-lg text-indigo-600">{summary.eveningLitres} L</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">Total Amount</p>
                      <p className="font-bold text-lg text-green-600">Rs. {summary.totalCost}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Download */}
              <div className="px-6 py-4 border-t border-border">
                <button onClick={handleDownloadPDF}
                  className="flex items-center justify-center gap-2 w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition-colors shadow-md text-base">
                  <FileDown size={20} />
                  Download PDF — {selectedCustomer?.name} — {format(currentDate, "MMMM yyyy")}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
