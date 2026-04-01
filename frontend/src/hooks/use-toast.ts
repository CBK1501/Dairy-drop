import { useState, useCallback } from "react";

interface Toast { id: number; title: string; description?: string; variant?: "default" | "destructive"; }

let listeners: ((t: Toast[]) => void)[] = [];
let toasts: Toast[] = [];
let nextId = 0;

function notify() { listeners.forEach((l) => l([...toasts])); }

export function toast(t: Omit<Toast, "id">) {
  const id = nextId++;
  toasts = [...toasts, { ...t, id }];
  notify();
  setTimeout(() => { toasts = toasts.filter((x) => x.id !== id); notify(); }, 3500);
}

export function useToast() {
  const [list, setList] = useState<Toast[]>([]);
  const subscribe = useCallback((fn: (t: Toast[]) => void) => {
    listeners.push(fn);
    return () => { listeners = listeners.filter((l) => l !== fn); };
  }, []);
  useState(() => { const unsub = subscribe(setList); return unsub; });
  return { toasts: list, toast };
}
