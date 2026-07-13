import { useAppDispatch } from '@/lib/store/hooks';
import { showSuccess } from '@/store/slices/snackbarSlice';
import { router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import type { FilteredArticleSummary } from '../../purification/retrieval/types';
import { defaultExtractionForm } from '../mock';
import { ExtractionArticle, ExtractionFormValues } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const countWords = (value?: string | null) => {
  if (!value) return 0;

  return value.trim().split(/\s+/).filter(Boolean).length;
};

const mapFilteredToExtractionArticles = (
  filteredArticles: FilteredArticleSummary[],
): ExtractionArticle[] =>
  filteredArticles
    .filter((item) => Boolean(item.retrieved))
    .map((item) => {
      const raw = item.raw_article;
      const extraction = item.review?.extraction_result ?? null;
      const textContent = [
        extraction?.abstract,
        extraction?.introduction,
        extraction?.result,
        extraction?.conclusion,
        extraction?.recommendation,
        extraction?.novelty_gap,
        extraction?.limitation,
        extraction?.future_research,
      ]
        .filter(Boolean)
        .join(' ');

      return {
        id: item.filtered_article_id,
        authors: raw?.authors ?? 'Unknown',
        year: raw?.publish_year ?? 0,
        title: raw?.title ?? 'Untitled',
        journal: raw?.issn ?? '-',
        aiUsage: Boolean(item.included),
        citation: 0,
        quartile: raw?.tier ?? '-',
        text: countWords(textContent),
        novelty: Boolean(item.novelty_status),
        noveltyGap: extraction?.novelty_gap ?? '',
        status: extraction ? 'extracted' : 'pending',
        pdfUrl: item.pdf_path ? `/storage/${item.pdf_path}` : undefined,
      };
    });

const buildFormFromExtraction = (
  item: FilteredArticleSummary,
): ExtractionFormValues => {
  const extraction = item.review?.extraction_result ?? null;

  return {
    ...defaultExtractionForm,
    abstract: extraction?.abstract ?? '',
    introduction: extraction?.introduction ?? '',
    result: extraction?.result ?? '',
    conclusion: extraction?.conclusion ?? '',
    recommendation: extraction?.recommendation ?? '',
    noveltyGap: extraction?.novelty_gap ?? '',
    futureResearch: extraction?.future_research ?? '',
    limitation: extraction?.limitation ?? '',
  };
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

type Props = {
  filteredArticles?: FilteredArticleSummary[];
  researchPlanId?: number;
};

export function useExtraction({
  filteredArticles = [],
  researchPlanId = 0,
}: Props = {}) {
  const dispatch = useAppDispatch();

  const mappedArticles = useMemo(
    () => mapFilteredToExtractionArticles(filteredArticles),
    [filteredArticles],
  );

  const [articles, setArticles] = useState<ExtractionArticle[]>(mappedArticles);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(
    null,
  );
  const [formValues, setFormValues] = useState<ExtractionFormValues>(
    defaultExtractionForm,
  );

  useEffect(() => {
    setArticles(mappedArticles);
  }, [mappedArticles]);

  const selectedArticle = useMemo(
    () => articles.find((item) => item.id === selectedArticleId) ?? null,
    [articles, selectedArticleId],
  );

  // -------------------------------------------------------------------------
  // Open / close
  // -------------------------------------------------------------------------

  const openExtraction = (articleId: number) => {
    setSelectedArticleId(articleId);

    const source = filteredArticles.find(
      (item) => item.filtered_article_id === articleId,
    );

    if (source) {
      setFormValues(buildFormFromExtraction(source));
    } else {
      setFormValues(defaultExtractionForm);
    }
  };

  const closeExtraction = () => {
    setSelectedArticleId(null);
  };

  // -------------------------------------------------------------------------
  // Field update
  // -------------------------------------------------------------------------

  const updateField = <K extends keyof ExtractionFormValues>(
    key: K,
    value: ExtractionFormValues[K],
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // -------------------------------------------------------------------------
  // Save extraction → PUT /extraction/{id}
  // -------------------------------------------------------------------------

  const saveExtraction = () => {
    if (!selectedArticleId) return;

    router.put(
      `/extraction/${selectedArticleId}`,
      {
        abstract: formValues.abstract || null,
        introduction: formValues.introduction || null,
        result: formValues.result || null,
        conclusion: formValues.conclusion || null,
        recommendation: formValues.recommendation || null,
        novelty_gap: formValues.noveltyGap || null,
        future_research: formValues.futureResearch || null,
        limitation: formValues.limitation || null,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setArticles((prev) =>
            prev.map((article) =>
              article.id === selectedArticleId
                ? { ...article, status: 'extracted' }
                : article,
            ),
          );
          setSelectedArticleId(null);
          dispatch(showSuccess('Extraction saved.'));
        },
      },
    );
  };

  // -------------------------------------------------------------------------
  // Sync actions (stub — tetap tersedia untuk UI)
  // -------------------------------------------------------------------------

  const synchronizePdf = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
  };

  const synchronizeArticle = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
  };

  return {
    articles,
    selectedArticle,
    formValues,
    openExtraction,
    closeExtraction,
    updateField,
    saveExtraction,
    synchronizePdf,
    synchronizeArticle,
  };
}
