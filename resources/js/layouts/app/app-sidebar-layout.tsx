import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
  children,
  breadcrumbs = [],
}: AppLayoutProps) {
  return (
    <div className="h-screen overflow-hidden">
      <AppShell variant="sidebar">
        <AppSidebar />

        <AppContent
          variant="sidebar"
          className="flex h-screen min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="shrink-0">
            <AppSidebarHeader breadcrumbs={breadcrumbs} />
          </div>

          <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
        </AppContent>
      </AppShell>
    </div>
  );
}
