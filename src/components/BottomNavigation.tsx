import { Button } from "@/components/ui/button";
import { Home, Calculator, History, User, Menu, Phone, HelpCircle } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface BottomNavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  authRequired?: boolean;
}

const BottomNavigation = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [showFullMenu, setShowFullMenu] = useState(false);

  const mainNavItems: BottomNavItem[] = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Quote", icon: Calculator, href: "/?quote=start" },
    { label: "History", icon: History, href: "/quotes", authRequired: true },
    { label: "Profile", icon: User, href: "/profile", authRequired: true },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/" && !location.search.includes("quote=start");
    }
    if (href === "/?quote=start") {
      return location.search.includes("quote=start");
    }
    return location.pathname === href;
  };

  const visibleItems = mainNavItems.filter(item => !item.authRequired || user);
  
  // If not authenticated, show menu button instead of restricted items
  const displayItems = user ? visibleItems : [
    ...visibleItems.filter(item => !item.authRequired),
    { label: "Menu", icon: Menu, href: "#menu" }
  ];

  const handleMenuClick = () => {
    if (!user) {
      setShowFullMenu(!showFullMenu);
    }
  };

  return (
    <>
      {/* Full menu overlay for non-authenticated users */}
      {showFullMenu && !user && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowFullMenu(false)}>
          <div className="fixed bottom-20 left-4 right-4 bg-white rounded-lg shadow-xl p-4 space-y-3">
            <Link
              to="/auth"
              className="flex items-center gap-3 p-3 rounded-lg text-foreground hover:bg-primary/5 transition-colors"
              onClick={() => setShowFullMenu(false)}
            >
              <User className="w-5 h-5" />
              Sign In
            </Link>
            <Link
              to="/help"
              className="flex items-center gap-3 p-3 rounded-lg text-foreground hover:bg-primary/5 transition-colors"
              onClick={() => setShowFullMenu(false)}
            >
              <HelpCircle className="w-5 h-5" />
              Help
            </Link>
            <Link
              to="/contact"
              className="flex items-center gap-3 p-3 rounded-lg text-foreground hover:bg-primary/5 transition-colors"
              onClick={() => setShowFullMenu(false)}
            >
              <Phone className="w-5 h-5" />
              Contact
            </Link>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-border shadow-lg md:hidden">
        <div className="flex items-center justify-around py-2">
          {displayItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            if (item.href === "#menu") {
              return (
                <Button
                  key={item.label}
                  variant="ghost"
                  className={cn(
                    "flex flex-col items-center gap-1 h-14 px-3 py-2 rounded-lg transition-all duration-200",
                    "min-h-[56px] min-w-[56px]", // Ensure minimum touch target size
                    showFullMenu 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  )}
                  onClick={handleMenuClick}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Button>
              );
            }

            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-200",
                  "min-h-[56px] min-w-[56px]", // Ensure minimum touch target size
                  active 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                )}
                onClick={() => setShowFullMenu(false)}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer to prevent content from being hidden behind bottom nav */}
      <div className="h-16 md:hidden" />
    </>
  );
};

export default BottomNavigation;