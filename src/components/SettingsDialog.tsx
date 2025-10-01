import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMockAuth } from "@/context/MockAuthContext";
import { clearHistory } from "@/lib/user-data";
import { Settings, Moon, Sun, Trash2, LogOut } from "lucide-react";

export const SettingsDialog = () => {
  const { user, logout } = useMockAuth();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = (localStorage.getItem("excellytics_theme") as "light" | "dark") || "light";
    setTheme(saved);
    if (saved === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [open]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("excellytics_theme", next);
    if (next === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const handleClear = () => {
    if (user) clearHistory(user.email);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Personalize your experience</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Theme</p>
              <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
            </div>
            <Button variant="outline" onClick={toggleTheme} className="gap-2">
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {theme === "light" ? "Dark" : "Light"}
            </Button>
          </div>

          <Separator />

          {user ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground">Signed in</p>
                <p className="text-xs text-muted-foreground">{user.displayName || user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2" onClick={handleClear}>
                  <Trash2 className="w-4 h-4" /> Clear My History
                </Button>
                <Button variant="destructive" className="gap-2" onClick={logout}>
                  <LogOut className="w-4 h-4" /> Logout
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">Not signed in</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
