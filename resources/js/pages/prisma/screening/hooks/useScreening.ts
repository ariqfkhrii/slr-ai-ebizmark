import { useMemo, useState } from 'react';
import { RawArticle } from '../../identification/types';
import { FilteredArticle } from '../types';
import { createFilteredArticles } from '../utils';

export function useScreening(articles: RawArticle[], researchPlanId: number) {
  const initialData = useMemo(
    () => createFilteredArticles(articles, researchPlanId),
    [articles, researchPlanId],
  );

  const [filteredArticles, setFilteredArticles] =
    useState<FilteredArticle[]>(initialData);

  const updateStatus = (id: number, included: boolean) => {
    setFilteredArticles((prev) =>
      prev.map((item) =>
        item.filtered_article_id === id
          ? {
              ...item,
              included,
              article_status: included ? 'included' : 'excluded',
            }
          : item,
      ),
    );
  };

  const includeAll = () => {
    setFilteredArticles((prev) =>
      prev.map((item) => ({
        ...item,
        included: true,
        article_status: 'included',
      })),
    );
  };

  const excludeAll = () => {
    setFilteredArticles((prev) =>
      prev.map((item) => ({
        ...item,
        included: false,
        article_status: 'excluded',
      })),
    );
  };

  const counters = {
    included: filteredArticles.filter((item) => item.included === true).length,
    excluded: filteredArticles.filter((item) => item.included === false).length,
    pending: filteredArticles.filter((item) => item.included === null).length,
  };

  return {
    filteredArticles,
    counters,
    updateStatus,
    includeAll,
    excludeAll,
  };
}
