import { ReactNode } from 'react';
import { BottomNavigation } from './BottomNavigation';
import { NewYearDecorations } from './NewYearDecorations';
import { useKioskHeartbeat } from '@/hooks/useKioskHeartbeat';

interface KioskLayoutProps {
  children: ReactNode;
}

export const KioskLayout = ({ children }: KioskLayoutProps) => {
  useKioskHeartbeat(); // Start sending heartbeats while Kiosk is active
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NewYearDecorations />
      {/* Main Content Area */}
      <main className="flex-1 pb-20 overflow-hidden relative">
        {children}
      </main>

      {/* Bottom Navigation - Always visible */}
      <BottomNavigation />
    </div>
  );
};