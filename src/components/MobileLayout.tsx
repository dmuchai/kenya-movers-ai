import { ReactNode } from 'react';
import Navigation from './Navigation';
import BottomNavigation from './BottomNavigation';

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

const MobileLayout = ({ children, showBottomNav = true }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Main content with proper spacing */}
      <main className={`${showBottomNav ? 'pb-20 md:pb-0' : ''}`}>
        {children}
      </main>
      
      {/* Bottom navigation for mobile */}
      {showBottomNav && <BottomNavigation />}
    </div>
  );
};

export default MobileLayout;