import { ResearchPlan } from '@/pages/prisma/types';

const getCsrfToken = () =>
  document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ??
  '';

export const getResearchPlanById = async ({
  researchPlanId,
}: {
  researchPlanId: number;
}): Promise<ResearchPlan> => {
  const res = await fetch(`/research-plans/${researchPlanId}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message ?? 'Gagal mengambil seluruh artikel');
  }

  return data;
};
