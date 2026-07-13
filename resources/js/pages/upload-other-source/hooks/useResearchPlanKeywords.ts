import { getResearchPlanKeywords } from '@/clients/otherSource';
import { useQuery } from '@tanstack/react-query';

export interface KeywordOption {
  id: number;
  keyword: string;
}

export const useResearchPlanKeywords = (researchPlanId: number) => {
  return useQuery<KeywordOption[]>({
    queryKey: ['research-plan-keywords', researchPlanId],
    queryFn: () => getResearchPlanKeywords(researchPlanId),
    enabled: !!researchPlanId,
  });
};
