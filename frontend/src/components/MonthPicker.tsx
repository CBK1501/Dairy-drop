import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";

interface MonthPickerProps {
  currentDate: Date;
  onChange: (date: Date) => void;
}

export function MonthPicker({ currentDate, onChange }: MonthPickerProps) {
  return (
    <div className="flex items-center justify-between bg-card rounded-2xl p-2 border border-border shadow-sm mb-6">
      <button onClick={() => onChange(subMonths(currentDate, 1))} className="p-3 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft size={20} />
      </button>
      <div className="flex items-center gap-2">
        <Calendar size={18} className="text-primary" />
        <span className="font-display font-bold text-base w-32 text-center">{format(currentDate, "MMMM yyyy")}</span>
      </div>
      <button onClick={() => onChange(addMonths(currentDate, 1))} className="p-3 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
