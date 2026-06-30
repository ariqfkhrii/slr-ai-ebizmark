import { useAppDispatch } from '@/lib/store/hooks';
import { showSuccess } from '@/lib/store/snackbarSlice';
import { router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import type { FilteredArticleSummary } from '../../purification/retrieval/types';
import {
  ClassificationArticle,
  ClassificationCategory,
  ClassificationSetup,
} from '../types';

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
    .filter((item) => Boolean(item.retrieved))
    .map((item) => {
      const stored =
        item.review?.article_classification ??
        (item.review as any)?.articleClassification ??
        null;
      const classifications: Record<number, string> = {};

      if (stored) {
        const values = [
          stored.category_1,
          stored.category_2,
          stored.category_3,
          stored.category_4,
          stored.category_5,
          stored.category_6,
        ];

        values.forEach((value, index) => {
          if (value) {
            classifications[index + 1] = value;
          }
        });
      }

      return {
        id: item.filtered_article_id,
        title: item.raw_article?.title ?? 'Untitled',
        authors: item.raw_article?.authors ?? 'Unknown',
        country: '-',
        publishYear: item.raw_article?.publish_year ?? null,
        researchMethod: stored?.research_method ?? '',
        classifications,
        abstract: item.raw_article?.abstract ?? '',
      };
    });

const buildCategoriesFromSetup = (
  setup: ClassificationSetup | null,
): ClassificationCategory[] => {
  const names = [
    setup?.category_1 ?? '',
    setup?.category_2 ?? '',
    setup?.category_3 ?? '',
    setup?.category_4 ?? '',
    setup?.category_5 ?? '',
    setup?.category_6 ?? '',
  ];

  return defaultCategories.map((category, index) => ({
    ...category,
    name: names[index] ?? '',
  }));
};

export function useClassification(
  filteredArticles: FilteredArticleSummary[] = [],
  researchPlanId: number = 0,
  classificationSetup: ClassificationSetup | null = null,
) {
  const [categories, setCategories] = useState<ClassificationCategory[]>(
    buildCategoriesFromSetup(classificationSetup),
  );

  const [theory, setTheory] = useState(classificationSetup?.theory ?? '');
  const dispatch = useAppDispatch();

  const mappedArticles = useMemo(
    () => mapRetrievedArticles(filteredArticles),
    [filteredArticles],
  );

  const [articles, setArticles] =
    useState<ClassificationArticle[]>(mappedArticles);

  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    setArticles(mappedArticles);
  }, [mappedArticles]);

  useEffect(() => {
    setCategories(buildCategoriesFromSetup(classificationSetup));
    setTheory(classificationSetup?.theory ?? '');
  }, [classificationSetup]);

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

  const saveSetup = () => {
    router.put(
      '/classification-setup',
      {
        research_plan_id: researchPlanId,
        category_1: categories[0]?.name || null,
        category_2: categories[1]?.name || null,
        category_3: categories[2]?.name || null,
        category_4: categories[3]?.name || null,
        category_5: categories[4]?.name || null,
        category_6: categories[5]?.name || null,
        theory: theory.trim() || null,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          dispatch(showSuccess('Classification setup saved.'));
        },
      },
    );
  };

  const saveClassification = (articleId: number) => {
    const article = articles.find((a) => a.id === articleId);
    if (!article) return;

    router.put(
      `/classification/${articleId}`,
      {
        research_method: article.researchMethod,
        category_1: article.classifications[1] || null,
        category_2: article.classifications[2] || null,
        category_3: article.classifications[3] || null,
        category_4: article.classifications[4] || null,
        category_5: article.classifications[5] || null,
        category_6: article.classifications[6] || null,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          dispatch(showSuccess('Classification saved.'));
        },
      },
    );
  };

  return {
    categories,
    activeCategories,
    articles,
    selectedArticle,
    theory,
    updateCategory,
    setTheory,
    updateClassification,
    updateResearchMethod,
    openDetail,
    closeDetail,
    saveSetup,
    saveClassification,
  };
}
