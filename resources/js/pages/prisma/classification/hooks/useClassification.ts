import { useMemo, useState } from 'react';
import { mockClassificationArticles } from '../mock';
import { ClassificationArticle, ClassificationCategory } from '../types';

const defaultCategories: ClassificationCategory[] = [
  { id: 1, name: '' },
  { id: 2, name: '' },
  { id: 3, name: '' },
  { id: 4, name: '' },
  { id: 5, name: '' },
  { id: 6, name: '' },
];

export function useClassification() {
  const [categories, setCategories] =
    useState<ClassificationCategory[]>(defaultCategories);

  const [articles, setArticles] = useState<ClassificationArticle[]>(
    mockClassificationArticles,
  );

  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(
    null,
  );

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
