import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  hideProgressSnackbar,
  showProgressSnackbar,
  showSuccess,
  updateProgressSnackbar,
} from '@/lib/store/snackbarSlice';
import { useEffect, useState } from 'react';
import { FetchParams } from '../components/dialog/FetchParameterDialog';
import { FetchHistory, Keyword } from '../types';

type ApiKeyword = {
  id: number;
  name: string;
  article_count: number;
};

export type MetadataPreviewResult = {
  message: string;
  can_execute: boolean;
  data: {
    total_count: number;
    is_recommended: boolean;
    [key: string]: any;
  };
};

const getCsrfToken = () =>
  document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ??
  '';

export function useIdentification(researchPlanId: number) {
  const dispatch = useAppDispatch();
  const progress = useAppSelector((state) => state.snackbar.progress);

  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [histories, setHistories] = useState<FetchHistory[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loadingKeywords, setLoadingKeywords] = useState(false);

  const selectedKeyword = keywords.find((k) => k.id === selectedId) || null;

  const fetchKeywords = async () => {
    if (!researchPlanId) return;

    setLoadingKeywords(true);

    try {
      const res = await fetch(`/research-plans/${researchPlanId}/keywords`, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!res.ok) throw new Error('Gagal mengambil keyword');

      const data: ApiKeyword[] = await res.json();

      setKeywords(
        data.map((item) => ({
          id: item.id,
          name: item.name,
          retrievedCount: item.article_count ?? 0,
        })),
      );
    } finally {
      setLoadingKeywords(false);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, [researchPlanId]);

  const addKeyword = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const res = await fetch(`/research-plans/${researchPlanId}/keywords`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-CSRF-TOKEN': getCsrfToken(),
      },
      body: JSON.stringify({ keyword: trimmed }),
    });

    if (!res.ok) throw new Error('Gagal menambah keyword');

    await fetchKeywords();

    dispatch(showSuccess('Keyword berhasil ditambahkan!'));
  };

  const deleteKeyword = async (id: number) => {
    const res = await fetch(
      `/research-plans/${researchPlanId}/keywords/${id}`,
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
      },
    );

    if (!res.ok) throw new Error('Gagal menghapus keyword');

    if (selectedId === id) setSelectedId(null);

    await fetchKeywords();

    dispatch(showSuccess('Keyword berhasil dihapus!'));
  };

  const updateKeyword = async (id: number, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const res = await fetch(`/research-plans/${researchPlanId}/keywords`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-CSRF-TOKEN': getCsrfToken(),
      },
      body: JSON.stringify({
        old_keyword_id: id,
        new_keyword: trimmed,
      }),
    });

    if (!res.ok) throw new Error('Gagal mengubah keyword');

    await fetchKeywords();

    dispatch(showSuccess(`Keyword diubah ke "${trimmed}"`));
  };

  const selectKeyword = (id: number) => {
    setSelectedId(id);
  };

  const previewMetadata = async (
    keywordId: number,
    params: FetchParams,
  ): Promise<MetadataPreviewResult> => {
    const res = await fetch(
      `/research-plans/${researchPlanId}/metadata/preview`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify({
          keyword_id: keywordId,
          start_year: params.yearFrom,
          end_year: params.yearTo,
        }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message ?? 'Gagal mengambil preview metadata');
    }

    return data;
  };

  const fetchMetadata = async (keywordId: number, params: FetchParams) => {
    const currentKeyword = keywords.find((keyword) => keyword.id === keywordId);

    if (!currentKeyword) return;

    const isUpdate = (currentKeyword.retrievedCount ?? 0) > 0;

    const res = await fetch(
      `/research-plans/${researchPlanId}/metadata/execute`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify({
          keyword_id: keywordId,
          start_year: params.yearFrom,
          end_year: params.yearTo,
          can_execute: true,
        }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message ?? 'Gagal menjalankan metadata search');
    }

    if (data.message === 'All sources found in cache.') {
      dispatch(showSuccess('Metadata berhasil dimuat dari cache'));

      await fetchKeywords();

      return;
    }

    if (data.batch_id) {
      dispatch(
        showProgressSnackbar({
          batchId: data.batch_id,
          message: 'Mengambil metadata...',
        }),
      );

      return;
    }
  };

  const pollBatchProgress = async (batchId: string) => {
    const res = await fetch(`/metadata/batches/${batchId}/progress`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) throw new Error('Gagal mengambil progress batch');

    return await res.json();
  };

  useEffect(() => {
    if (!progress.open || !progress.batchId || progress.status !== 'running') {
      return;
    }

    const interval = window.setInterval(async () => {
      try {
        const data = await pollBatchProgress(progress.batchId as string);

        dispatch(
          updateProgressSnackbar({
            percentage: data.percentage,
            status: data.status,
            processedJobs: data.processed_jobs,
            totalJobs: data.total_jobs,
            message: 'Mengambil metadata...',
          }),
        );

        if (
          data.status === 'completed' ||
          data.status === 'failed' ||
          data.status === 'cancelled' ||
          data.status === 'completed_with_errors'
        ) {
          window.clearInterval(interval);

          await fetchKeywords();

          window.setTimeout(() => {
            dispatch(hideProgressSnackbar());

            dispatch(
              showSuccess(
                data.status === 'completed'
                  ? 'Fetch metadata selesai'
                  : 'Fetch metadata selesai dengan catatan',
              ),
            );
          }, 1500);
        }
      } catch {
        window.clearInterval(interval);
        dispatch(hideProgressSnackbar());
      }
    }, 1500);

    return () => window.clearInterval(interval);
  }, [progress.open, progress.batchId, progress.status]);

  return {
    keywords,
    histories,
    selectedKeyword,
    loadingKeywords,
    fetchKeywords,
    addKeyword,
    deleteKeyword,
    selectKeyword,
    updateKeyword,
    previewMetadata,
    fetchMetadata,
  };
}
