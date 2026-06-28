// hooks/usePrismaStatus.ts
import { useEffect, useState } from 'react';
import { getFilteredArticles } from '../identification/hooks/useIdentification';
import { FilteredArticle, PaginationResponse } from '../screening/types';

interface UsePrismaStatusProps {
  researchPlanId: number;
  keywordId?: number;
}

export const usePrismaStatus = ({
  researchPlanId,
  keywordId,
}: UsePrismaStatusProps) => {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<FilteredArticle[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [screeningCounters, setScreeningCounters] = useState({
    total: 0,
    included: 0,
    excluded: 0,
    pending: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    if (!researchPlanId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getFilteredArticles({
        researchPlanId,
        keywordId,
        page: 1,
        size: 1000,
      });

      const data = response as PaginationResponse<FilteredArticle>;
      const articlesData = data?.data || [];

      const counters = {
        total: articlesData.length,
        included: articlesData.filter((a) => a.included === true).length,
        excluded: articlesData.filter((a) => a.included === false).length,
        pending: articlesData.filter(
          (a) => a.included === null || a.included === undefined,
        ).length,
      };

      setArticles(articlesData);
      setTotalArticles(data?.total || 0);
      setScreeningCounters(counters);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal mengambil data artikel',
      );
      setArticles([]);
      setTotalArticles(0);
      setScreeningCounters({ total: 0, included: 0, excluded: 0, pending: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [researchPlanId, keywordId]);

  return {
    articles,
    totalArticles,
    screeningCounters,
    loading,
    error,
    refetch: fetchArticles,
    canOpenScreening: articles.length > 0,
    canOpenRetrieval: screeningCounters.included > 0,
    canOpenClassification: screeningCounters.included > 0,
    canOpenExtraction: screeningCounters.included > 0,
    canOpenReport: screeningCounters.included > 0,
    includedArticles: articles.filter((a) => a.included === true),
    excludedArticles: articles.filter((a) => a.included === false),
    pendingArticles: articles.filter(
      (a) => a.included === null || a.included === undefined,
    ),
  };
};
