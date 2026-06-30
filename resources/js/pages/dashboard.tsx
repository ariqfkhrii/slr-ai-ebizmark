'use client';

import DashboardPage from './dashboard/Dashboard';
import GuideInitializer from './GuideInitializer';
import { GuideProvider } from './spar/components/spar-layout';

export default function Dashboard({ auth, researchPlans }: any) {
  return (
    <GuideProvider>
      <GuideInitializer />
      <DashboardPage auth={auth} researchPlans={researchPlans} />
    </GuideProvider>
  );
}
