import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts } = useToast();
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "rounded-2xl px-4 py-3 shadow-lg text-sm font-medium border",
            t.variant === "destructive"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-white border-border text-foreground"
          )}
        >
          <p className="font-bold">{t.title}</p>
          {t.description && <p className="text-xs mt-0.5 opacity-80">{t.description}</p>}
        </div>
      ))}
    </div>
  );
}
