import { router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FilteredArticleSummary } from '../../retrieval/types';
import {
  ClassificationArticle,
  ClassificationCategory,
  ClassificationSetup,
} from '../types';
import { useAppDispatch } from '@/lib/store/hooks';
import { showSuccess } from '@/lib/store/snackbarSlice';

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

const getCsrfToken = () =>
  document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ??
  '';

export function useAiClassification(
  filteredArticles: FilteredArticleSummary[],
  researchPlanId: number,
  classificationSetup: ClassificationSetup | null,
) {
  const [categories, setCategories] = useState<ClassificationCategory[]>(
    buildCategoriesFromSetup(classificationSetup),
  );

  const [theory, setTheory] = useState(classificationSetup?.theory ?? '');
  const dispatch = useAppDispatch();
  const [syncOpen, setSyncOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncProcessed, setSyncProcessed] = useState(0);
  const [syncTotal, setSyncTotal] = useState(0);
  const [syncError, setSyncError] = useState('');
  const progressTimer = useRef<number | null>(null);

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

  useEffect(() => {
    setCategories(buildCategoriesFromSetup(classificationSetup));
    setTheory(classificationSetup?.theory ?? '');
  }, [classificationSetup]);

  useEffect(() => () => stopProgress(), []);

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

  const stopProgress = () => {
    if (progressTimer.current) {
      window.clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  };

  const startProgress = () => {
    stopProgress();
    setSyncProgress(8);
    progressTimer.current = window.setInterval(() => {
      setSyncProgress((prev) => Math.min(prev + Math.random() * 8 + 4, 90));
    }, 600);
  };

  const applyAiResults = (results: Array<any>) => {
    const resultMap = new Map<number, any>(
      results.map((item) => [item.article_id, item]),
    );

    setArticles((prev) =>
      prev.map((article) => {
        const found = resultMap.get(article.id);
        if (!found) return article;

        const nextClassifications = { ...article.classifications };

        defaultCategories.forEach((category) => {
          const value = found.categories?.[category.id];
          if (value !== undefined && value !== null) {
            nextClassifications[category.id] = String(value);
          }
        });

        return {
          ...article,
          researchMethod: found.research_method ?? article.researchMethod,
          classifications: nextClassifications,
        };
      }),
    );
  };

  const runAiClassification = async () => {
    setSyncOpen(true);
    setSyncStatus('running');
    setSyncError('');
    setSyncProcessed(0);
    setSyncTotal(0);
    startProgress();

    try {
      const res = await fetch('/ai-classification/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify({ research_plan_id: researchPlanId }),
      });

      if (!res.ok) {
        throw new Error('Gagal menjalankan AI classification');
      }

      const data = await res.json();
      const results = Array.isArray(data.results) ? data.results : [];

      stopProgress();
      setSyncProcessed(data.processed ?? results.length ?? 0);
      setSyncTotal(data.total ?? results.length ?? 0);
      setSyncProgress(100);
      setSyncStatus('success');

      router.reload({
        only: ['filteredArticles'],
        preserveScroll: true,
      });
      dispatch(showSuccess('AI classification selesai.'));
    } catch (error) {
      stopProgress();
      setSyncStatus('error');
      setSyncError(
        error instanceof Error
          ? error.message
          : 'Gagal menjalankan AI classification',
      );
    }
  };

  const closeSync = () => {
    if (syncStatus === 'running') return;
    setSyncOpen(false);
    setSyncStatus('idle');
    setSyncProgress(0);
    setSyncProcessed(0);
    setSyncTotal(0);
    setSyncError('');
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
    checkIdeaClassificationFromAi,
    saveSetup,
    runAiClassification,
    syncOpen,
    syncStatus,
    syncProgress,
    syncProcessed,
    syncTotal,
    syncError,
    closeSync,
  };
}
