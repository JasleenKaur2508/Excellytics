import { Button } from "@/components/ui/button";
import { BarChart3, User } from "lucide-react";
import { useMockAuth } from "@/context/MockAuthContext";
import { SettingsDialog } from "@/components/SettingsDialog";

export const Header = () => {
  const { user, logout, loading } = useMockAuth();
  
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Excellytics</h1>
              <p className="text-xs text-muted-foreground">Analytics Studio</p>
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <a href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Home
          </a>
          <a href="#dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Dashboard
          </a>
          <a href="#ai-insights" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            AI Insights
          </a>
          <a href="#history" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            History
          </a>
        </nav>

        <div className="flex items-center space-x-3">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : user ? (
            <>
              <div className="hidden sm:flex items-center text-sm text-muted-foreground">
                <User className="w-4 h-4 mr-2" /> {user.displayName || user.email}
              </div>
              <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
            </>
          ) : (
            <Button variant="analytics" size="sm" asChild>
              <a href="/login">Sign In</a>
            </Button>
          )}
          <SettingsDialog />
        </div>
      </div>
    </header>
  );
};