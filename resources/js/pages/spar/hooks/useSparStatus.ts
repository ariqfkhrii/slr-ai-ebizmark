import { getFilteredArticles } from '@/clients/acquisition';
import { getAllPurificationArticles } from '@/clients/screening';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FilteredArticle,
  PaginationResponse,
} from '../purification/screening/types';

interface UseSparStatusProps {
  researchPlanId: number;
  keywordId?: number;
}

export const useSparStatus = ({
  researchPlanId,
  keywordId,
}: UseSparStatusProps) => {
  const queryClient = useQueryClient();
  const queryKey = ['prisma-status', researchPlanId, keywordId];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!researchPlanId) {
        return {
          articles: [],
          totalArticles: 0,
          screeningCounters: { total: 0, included: 0, excluded: 0, pending: 0 },
        };
      }

      const acquisitionResponse = await getFilteredArticles({
        researchPlanId,
        keywordId,
        page: 1,
        size: 100,
      });

      const purificationResponse = await getAllPurificationArticles({
        researchPlanId,
      });

      const data = acquisitionResponse as PaginationResponse<FilteredArticle>;
      const purificationData = purificationResponse as FilteredArticle[];
      const articlesData = data?.data || [];

      const counters = {
        total: purificationData.length,
        included: purificationData.filter((a) => a.included === true).length,
        excluded: purificationData.filter((a) => a.included === false).length,
        pending: purificationData.filter(
          (a) => a.included === null || a.included === undefined,
        ).length,
      };

      return {
        articles: articlesData,
        totalArticles: data?.total || 0,
        screeningCounters: counters,
      };
    },
    enabled: !!researchPlanId,
  });

  const refetch = () => {
    return query.refetch();
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const data = query.data || {
    articles: [],
    totalArticles: 0,
    screeningCounters: { total: 0, included: 0, excluded: 0, pending: 0 },
  };

  return {
    articles: data.articles,
    totalArticles: data.totalArticles,
    screeningCounters: data.screeningCounters,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch,
    invalidate,
    canOpenScreening: data.articles.length > 0,
    canOpenRetrieval: data.screeningCounters.included > 0,
    canOpenClassification: data.screeningCounters.included > 0,
    canOpenExtraction: data.screeningCounters.included > 0,
    canOpenReport: data.screeningCounters.included > 0,
    includedArticles: data.articles.filter((a) => a.included === true),
    excludedArticles: data.articles.filter((a) => a.included === false),
    pendingArticles: data.articles.filter(
      (a) => a.included === null || a.included === undefined,
    ),
  };
};
