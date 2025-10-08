import { Button } from "@/components/ui/button";
import { 
  Truck, 
  Menu, 
  X, 
  Home, 
  Calculator, 
  Users, 
  HelpCircle,
  Phone,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { NotificationCenter } from "@/components/NotificationCenter";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navigationItems = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Get Quote", icon: Calculator, href: "/?quote=start" },
    { label: "My Quotes", icon: Users, href: "/quotes", authRequired: true },
    { label: "Profile", icon: Users, href: "/profile", authRequired: true },
    { label: "Help", icon: HelpCircle, href: "/help" },
    { label: "Contact", icon: Phone, href: "/contact" },
  ];

  const moverNavItems = [
    { label: "For Movers", icon: Truck, href: "/mover-registration" },
    { label: "Mover Dashboard", icon: Truck, href: "/mover-dashboard", authRequired: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-gradient-to-r from-primary to-trust-blue rounded-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">MoveEasy</h1>
              <p className="text-xs text-muted-foreground">Kenya</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems
              .filter(item => !item.authRequired || user)
              .map((item) => (
              <Link
                key={item.label}
                to={item.href.startsWith('#') ? '/' : item.href}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            
            {/* Mover Navigation Separator */}
            <div className="h-6 w-px bg-border"></div>
            
            {/* Mover-specific Navigation */}
            {moverNavItems
              .filter(item => !item.authRequired || user)
              .map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user && <NotificationCenter />}
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.email?.split('@')[0]}
                </span>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/?quote=start">Get Quote</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden min-h-[44px] min-w-[44px]" // Improved touch target
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className={cn(
          "md:hidden transition-all duration-300 overflow-hidden",
          isMenuOpen ? "max-h-[600px] pb-4" : "max-h-0"
        )}>
          <div className="space-y-1 pt-2 px-4">
            {navigationItems
              .filter(item => !item.authRequired || user)
              .map((item) => (
              <Link
                key={item.label}
                to={item.href.startsWith('#') ? '/' : item.href}
                className="flex items-center gap-4 p-4 rounded-lg text-base font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all min-h-[52px]" // Better touch targets
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="w-6 h-6" />
                {item.label}
              </Link>
            ))}
            
            {/* Mover Section */}
            <div className="pt-4 border-t border-border/50 mt-4">
              <div className="px-4 py-2 text-xs font-semibold text-primary uppercase tracking-wide">
                For Moving Companies
              </div>
              {moverNavItems
                .filter(item => !item.authRequired || user)
                .map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="flex items-center gap-4 p-4 rounded-lg text-base font-semibold text-primary hover:bg-primary/10 transition-all min-h-[52px]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-6 h-6" />
                  {item.label}
                </Link>
              ))}
            </div>
            
            {/* Authentication Section */}
            <div className="pt-4 space-y-3 border-t border-border/50 mt-4">
              {user ? (
                <>
                  <div className="px-4 py-2 text-base text-muted-foreground bg-muted/30 rounded-lg">
                    Welcome, {user.email?.split('@')[0]}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full min-h-[48px] text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground" 
                    size="default" 
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full min-h-[48px]" size="default" asChild>
                    <Link to="/auth">Sign In</Link>
                  </Button>
                  <Button variant="hero" className="w-full min-h-[48px]" size="default" asChild>
                    <Link to="/?quote=start">Get Quote</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;