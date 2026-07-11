'use client';

import DashboardPage from './dashboard/Dashboard';
import GuideInitializer from './GuideInitializer';
import { GuideProvider, SparLayout } from './spar/components/spar-layout';

export default function Dashboard({ auth, researchPlans }: any) {
  return (
    <GuideProvider>
      <GuideInitializer />

      <SparLayout>
        <DashboardPage auth={auth} researchPlans={researchPlans} />
      </SparLayout>
    </GuideProvider>
  );
}
