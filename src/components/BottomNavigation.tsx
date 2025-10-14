import { Button } from "@/components/ui/button";
import { Home, Calculator, History, User, Menu, Phone, HelpCircle, Shield, FileText } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useHapticNavigation } from "@/hooks/useHapticFeedback";
import { useSwipeToDismiss } from "@/hooks/useSwipeable";

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
  const { onTabChange } = useHapticNavigation();
  
  // Swipe to dismiss menu
  const swipeHandlers = useSwipeToDismiss(() => setShowFullMenu(false), 80);

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
      onTabChange(); // Haptic feedback
      setShowFullMenu(!showFullMenu);
    }
  };

  const handleNavClick = () => {
    onTabChange(); // Haptic feedback
    setShowFullMenu(false);
  };

  return (
    <>
      {/* Enhanced full menu overlay with swipe-to-dismiss */}
      {showFullMenu && !user && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in duration-200" onClick={() => setShowFullMenu(false)}>
          <div 
            {...swipeHandlers.ref}
            className="fixed bottom-20 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in slide-in-from-bottom-4 duration-300 border border-white/20"
          >
            {/* Swipe indicator */}
            <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mb-4"></div>
            
            <Link
              to="/auth"
              className="flex items-center gap-4 p-4 rounded-xl text-foreground hover:bg-primary/5 transition-all duration-200 group border border-transparent hover:border-primary/10"
              onClick={() => {
                handleNavClick();
                setShowFullMenu(false);
              }}
            >
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Sign In</div>
                <div className="text-sm text-neutral-500">Access your account</div>
              </div>
            </Link>
            
            <Link
              to="/help"
              className="flex items-center gap-4 p-4 rounded-xl text-foreground hover:bg-trust-blue/5 transition-all duration-200 group border border-transparent hover:border-trust-blue/10"
              onClick={() => {
                handleNavClick();
                setShowFullMenu(false);
              }}
            >
              <div className="w-10 h-10 bg-trust-blue/10 rounded-xl flex items-center justify-center group-hover:bg-trust-blue/20 transition-colors duration-200">
                <HelpCircle className="w-5 h-5 text-trust-blue" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Help & Support</div>
                <div className="text-sm text-neutral-500">Get assistance</div>
              </div>
            </Link>
            
            <Link
              to="/contact"
              className="flex items-center gap-4 p-4 rounded-xl text-foreground hover:bg-warm-orange/5 transition-all duration-200 group border border-transparent hover:border-warm-orange/10"
              onClick={() => {
                handleNavClick();
                setShowFullMenu(false);
              }}
            >
              <div className="w-10 h-10 bg-warm-orange/10 rounded-xl flex items-center justify-center group-hover:bg-warm-orange/20 transition-colors duration-200">
                <Phone className="w-5 h-5 text-warm-orange" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Contact Us</div>
                <div className="text-sm text-neutral-500">Speak to our team</div>
              </div>
            </Link>

            {/* Legal & Privacy Section */}
            <div className="pt-4 mt-4 border-t border-neutral-200">
              <div className="px-2 pb-2 text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                Legal & Privacy
              </div>
              
              <Link
                to="/privacy"
                className="flex items-center gap-4 p-4 rounded-xl text-foreground hover:bg-primary/5 transition-all duration-200 group border border-transparent hover:border-primary/10"
                onClick={() => {
                  handleNavClick();
                  setShowFullMenu(false);
                }}
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Privacy Policy</div>
                  <div className="text-sm text-neutral-500">How we protect your data</div>
                </div>
              </Link>
              
              <Link
                to="/terms"
                className="flex items-center gap-4 p-4 rounded-xl text-foreground hover:bg-trust-blue/5 transition-all duration-200 group border border-transparent hover:border-trust-blue/10"
                onClick={() => {
                  handleNavClick();
                  setShowFullMenu(false);
                }}
              >
                <div className="w-10 h-10 bg-trust-blue/10 rounded-xl flex items-center justify-center group-hover:bg-trust-blue/20 transition-colors duration-200">
                  <FileText className="w-5 h-5 text-trust-blue" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Terms of Service</div>
                  <div className="text-sm text-neutral-500">Our terms and conditions</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-neutral-200/50 shadow-xl md:hidden">
        <div className="flex items-center justify-around py-2 px-2">
          {displayItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            if (item.href === "#menu") {
              return (
                <Button
                  key={item.label}
                  variant="ghost"
                  className={cn(
                    "flex flex-col items-center gap-1 h-14 px-3 py-2 rounded-xl transition-all duration-300 group",
                    "min-h-[56px] min-w-[56px]", // Ensure minimum touch target size
                    "hover:scale-105 active:scale-95", // Micro-interactions
                    showFullMenu 
                      ? "text-primary bg-primary/10 shadow-lg" 
                      : "text-neutral-600 hover:text-primary hover:bg-primary/5"
                  )}
                  onClick={handleMenuClick}
                >
                  <Icon className={cn(
                    "w-5 h-5 transition-transform duration-300",
                    showFullMenu ? "rotate-180" : "group-hover:scale-110"
                  )} />
                  <span className="text-xs font-medium">{item.label}</span>
                </Button>
              );
            }

            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-300 group relative",
                  "min-h-[56px] min-w-[56px]", // Ensure minimum touch target size
                  "hover:scale-105 active:scale-95", // Micro-interactions
                  active 
                    ? "text-primary bg-primary/10 shadow-lg" 
                    : "text-neutral-600 hover:text-primary hover:bg-primary/5"
                )}
                onClick={handleNavClick}
              >
                {active && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                )}
                <Icon className={cn(
                  "w-5 h-5 transition-transform duration-300",
                  active ? "scale-110" : "group-hover:scale-110"
                )} />
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