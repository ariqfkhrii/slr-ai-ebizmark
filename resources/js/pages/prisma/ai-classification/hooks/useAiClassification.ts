import { useEffect, useMemo, useState } from 'react';
import type { FilteredArticleSummary } from '../../retrieval/types';
import { ClassificationArticle, ClassificationCategory } from '../types';

const defaultCategories: ClassificationCategory[] = [
  { id: 1, name: '' },
  { id: 2, name: '' },
  { id: 3, name: '' },
  { id: 4, name: '' },
  { id: 5, name: '' },
  { id: 6, name: '' },
];

const mapRetrievedArticles = (
  filteredArticles: FilteredArticleSummary[],
): ClassificationArticle[] =>
  filteredArticles
    .filter((item) => item.retrieved === 'Retrieved')
    .map((item) => ({
      id: item.filtered_article_id,
      title: item.raw_article?.title ?? 'Untitled',
      authors: item.raw_article?.authors ?? 'Unknown',
      country: '-',
      publishYear: item.raw_article?.publish_year ?? null,
      researchMethod: '',
      classifications: {},
    }));

export function useAiClassification(
  filteredArticles: FilteredArticleSummary[],
) {
  const [categories, setCategories] =
    useState<ClassificationCategory[]>(defaultCategories);

  const mappedArticles = useMemo(
    () => mapRetrievedArticles(filteredArticles),
    [filteredArticles],
  );

  const [articles, setArticles] = useState<ClassificationArticle[]>(
    mappedArticles,
  );

  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    setArticles(mappedArticles);
  }, [mappedArticles]);

  const selectedArticle = useMemo(
    () => articles.find((article) => article.id === selectedArticleId) ?? null,
    [articles, selectedArticleId],
  );

  const activeCategories = categories.filter((category) =>
    category.name.trim(),
  );

  const updateCategory = (id: number, name: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === id ? { ...category, name } : category,
      ),
    );
  };

  const updateClassification = (
    articleId: number,
    categoryId: number,
    value: string,
  ) => {
    setArticles((prev) =>
      prev.map((article) =>
        article.id === articleId
          ? {
              ...article,
              classifications: {
                ...article.classifications,
                [categoryId]: value,
              },
            }
          : article,
      ),
    );
  };

  const updateResearchMethod = (articleId: number, value: string) => {
    setArticles((prev) =>
      prev.map((article) =>
        article.id === articleId
          ? {
              ...article,
              researchMethod: value,
            }
          : article,
      ),
    );
  };

  const openDetail = (articleId: number) => {
    setSelectedArticleId(articleId);
  };

  const closeDetail = () => {
    setSelectedArticleId(null);
  };

  const checkIdeaClassificationFromAi = () => {
    setArticles((prev) =>
      prev.map((article) => ({
        ...article,
        classifications: activeCategories.reduce<Record<number, string>>(
          (acc, category) => {
            acc[category.id] =
              article.classifications[category.id] ||
              `AI suggestion for ${category.name}`;
            return acc;
          },
          {},
        ),
      })),
    );
  };

  return {
    categories,
    activeCategories,
    articles,
    selectedArticle,
    updateCategory,
    updateClassification,
    updateResearchMethod,
    openDetail,
    closeDetail,
    checkIdeaClassificationFromAi,
  };
}
