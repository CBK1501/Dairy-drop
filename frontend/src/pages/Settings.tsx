import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "@/services/settings.service";
import { userService } from "@/services/user.service";
import { AppSettings, AuthUser } from "@/types";
import { IndianRupee, Save, Info, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/store/auth.store";

export default function Settings() {
  const queryClient = useQueryClient();
  const { user, login } = useAuth();
  const [price, setPrice] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const { data: settings, isLoading } = useQuery<AppSettings>({
    queryKey: ["settings"],
    queryFn: () => settingsService.get(),
  });

  const { mutate: updateSettings, isPending: isSavingPrice } = useMutation({
    mutationFn: (pricePerLitre: number) => settingsService.update(pricePerLitre),
    onSuccess: () => {
      toast({ title: "Settings Saved", description: "Price per litre has been updated." });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: () => toast({ title: "Error", description: "Failed to update settings.", variant: "destructive" }),
  });

  const { mutate: updateProfile, isPending: isSavingProfile } = useMutation({
    mutationFn: () => userService.updateProfile({ name, phone }),
    onSuccess: (updated: AuthUser) => {
      toast({ title: "Profile Saved", description: "Your name and phone have been updated." });
      const token = localStorage.getItem("auth_token")!;
      login(token, updated);
    },
    onError: () => toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" }),
  });

  useEffect(() => {
    if (settings) setPrice(settings.pricePerLitre.toString());
  }, [settings]);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(price);
    if (isNaN(num) || num <= 0) {
      toast({ title: "Invalid Price", description: "Enter a valid price > 0.", variant: "destructive" });
      return;
    }
    updateSettings(num);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile();
  };

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <div className="text-center mb-2">
        <h2 className="font-display text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">Configure your preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-card rounded-3xl p-6 border border-border shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <User size={18} className="text-primary" />
          <h3 className="font-bold text-foreground">My Profile</h3>
        </div>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-foreground block mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ravi Kumar"
              className="w-full bg-white border-2 border-border focus:border-primary text-foreground px-4 py-3 rounded-2xl outline-none transition-all text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-foreground block mb-2">Mobile Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full bg-white border-2 border-border focus:border-primary text-foreground px-4 py-3 rounded-2xl outline-none transition-all text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isSavingProfile}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Save size={18} />
            {isSavingProfile ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>

      {/* Price */}
      <div className="bg-card rounded-3xl p-6 border border-border shadow-sm">
        <form onSubmit={handlePriceSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">Price per Litre</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <IndianRupee size={22} className="text-primary" />
              </div>
              <input
                type="number"
                step="0.5"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-white border-2 border-border focus:border-primary text-foreground text-2xl font-bold px-12 py-5 rounded-2xl outline-none transition-all shadow-sm"
                placeholder="0.00"
              />
            </div>
            <div className="flex items-start gap-2 mt-3 text-xs text-muted-foreground bg-secondary/50 p-3 rounded-xl">
              <Info size={14} className="shrink-0 mt-0.5" />
              <p>This rate is applied globally to calculate your total monthly cost.</p>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSavingPrice || isLoading}
            className="w-full flex items-center justify-center gap-2 bg-foreground hover:bg-foreground/90 text-background font-bold text-lg py-5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Save size={20} />
            {isSavingPrice ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
