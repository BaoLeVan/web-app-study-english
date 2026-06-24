import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';

/** App shell: dark sidebar + glass topnav + mesh canvas (lg+); bottom-nav on mobile. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mesh-bg min-h-screen overflow-x-hidden text-on-surface">
      <Sidebar />
      <TopNav />
      <BottomNav />
      <main className="min-h-screen px-4 pb-24 pt-6 lg:ml-[260px] lg:px-container-padding lg:pb-12 lg:pt-24">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
