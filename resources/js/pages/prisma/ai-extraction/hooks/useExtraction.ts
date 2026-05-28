import { useEffect, useMemo, useRef, useState } from 'react';
import type { FilteredArticleSummary } from '../../retrieval/types';
import { ExtractionArticle } from '../types';
import { useAppDispatch } from '@/lib/store/hooks';
import { showSuccess } from '@/lib/store/snackbarSlice';

const getCsrfToken = () =>
  document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ??
  '';

const mapRetrievedArticles = (
  filteredArticles: FilteredArticleSummary[],
): ExtractionArticle[] =>
  filteredArticles
    .filter((item) => item.retrieved === 'Retrieved')
    .map((item) => {
      const stored = item.review?.extraction_result;

      return {
        id: item.filtered_article_id,
        title: item.raw_article?.title ?? 'Untitled',
        authors: item.raw_article?.authors ?? 'Unknown',
        publishYear: item.raw_article?.publish_year ?? null,
        abstract: stored?.abstract ?? '',
        introduction: stored?.introduction ?? '',
        result: stored?.result ?? '',
        conclusion: stored?.conclusion ?? '',
        recommendation: stored?.recommendation ?? '',
        noveltyGap: stored?.novelty_gap ?? '',
        limitation: stored?.limitation ?? '',
        futureResearch: stored?.future_research ?? '',
      };
    });

export function useExtraction(
  filteredArticles: FilteredArticleSummary[],
  researchPlanId: number,
) {
  const dispatch = useAppDispatch();
  const mappedArticles = useMemo(
    () => mapRetrievedArticles(filteredArticles),
    [filteredArticles],
  );
  const [articles, setArticles] = useState<ExtractionArticle[]>(mappedArticles);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(
    null,
  );
  const [dialogMode, setDialogMode] = useState<'detail' | 'edit'>('detail');

  const [syncOpen, setSyncOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncProcessed, setSyncProcessed] = useState(0);
  const [syncTotal, setSyncTotal] = useState(0);
  const [syncError, setSyncError] = useState('');
  const progressTimer = useRef<number | null>(null);

  useEffect(() => {
    setArticles(mappedArticles);
  }, [mappedArticles]);

  useEffect(() => () => stopProgress(), []);

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

  const applyResults = (results: Array<any>) => {
    const map = new Map<number, any>(
      results.map((item) => [item.article_id, item]),
    );

    setArticles((prev) =>
      prev.map((article) => {
        const found = map.get(article.id);
        if (!found) return article;

        return {
          ...article,
          abstract: found.abstract ?? article.abstract,
          introduction: found.introduction ?? article.introduction,
          result: found.result ?? article.result,
          conclusion: found.conclusion ?? article.conclusion,
          recommendation: found.recommendation ?? article.recommendation,
          noveltyGap: found.novelty_gap ?? article.noveltyGap,
          limitation: found.limitation ?? article.limitation,
          futureResearch: found.future_research ?? article.futureResearch,
        };
      }),
    );
  };

  const selectedArticle = useMemo(
    () => articles.find((article) => article.id === selectedArticleId) ?? null,
    [articles, selectedArticleId],
  );

  const openDetail = (articleId: number) => {
    setDialogMode('detail');
    setSelectedArticleId(articleId);
  };

  const openEdit = (articleId: number) => {
    setDialogMode('edit');
    setSelectedArticleId(articleId);
  };

  const closeDialog = () => {
    setSelectedArticleId(null);
  };

  const updateExtraction = (
    articleId: number,
    next: Partial<ExtractionArticle>,
  ) => {
    setArticles((prev) =>
      prev.map((article) =>
        article.id === articleId ? { ...article, ...next } : article,
      ),
    );
  };

  const runAiExtraction = async () => {
    setSyncOpen(true);
    setSyncStatus('running');
    setSyncError('');
    setSyncProcessed(0);
    setSyncTotal(0);
    startProgress();

    try {
      const res = await fetch('/ai-extraction/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify({ research_plan_id: researchPlanId }),
      });

      if (!res.ok) {
        throw new Error('Gagal menjalankan AI extraction');
      }

      const data = await res.json();
      const results = Array.isArray(data.results) ? data.results : [];

      stopProgress();
      setSyncProcessed(data.processed ?? results.length ?? 0);
      setSyncTotal(data.total ?? results.length ?? 0);
      setSyncProgress(100);
      setSyncStatus('success');

      applyResults(results);
      dispatch(showSuccess('AI extraction selesai.'));
    } catch (error) {
      stopProgress();
      setSyncStatus('error');
      setSyncError(
        error instanceof Error
          ? error.message
          : 'Gagal menjalankan AI extraction',
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
    articles,
    runAiExtraction,
    selectedArticle,
    dialogMode,
    openDetail,
    openEdit,
    closeDialog,
    updateExtraction,
    syncOpen,
    syncStatus,
    syncProgress,
    syncProcessed,
    syncTotal,
    syncError,
    closeSync,
  };
}
