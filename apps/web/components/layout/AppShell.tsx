import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

/** App shell: dark sidebar + glass topnav + mesh canvas. Wraps every (app) page. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mesh-bg min-h-screen overflow-x-hidden text-on-surface">
      <Sidebar />
      <TopNav />
      <main className="ml-[260px] min-h-screen px-container-padding pb-12 pt-24">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
