'use client';

import { Box } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import GlobalPanel from './components/GlobalPanel';
import KeywordDetail from './components/KeywordDetail';
import KeywordList from './components/KeywordList';

import {
  createKeyword,
  deleteKeyword,
  executeMetadata,
  getBatchProgress,
  getKeywords,
  previewMetadata,
  updateKeyword as updateKeywordApi,
} from './hooks/useIdentification';

import { useAppSelector } from '@/lib/store/hooks';
import {
  hideProgressSnackbar,
  showProgressSnackbar,
  showSuccess,
  updateProgressSnackbar,
} from '@/lib/store/snackbarSlice';
import { useDispatch } from 'react-redux';
import { FetchParams } from './components/dialog/FetchParameterDialog';
import { FetchHistory, Keyword } from './types';

type ApiKeyword = {
  id: number;
  name: string;
  article_count: number;
};

type Props = {
  researchPlanId: number;
  sourceDatabase: string;
};

export default function Identification({
  researchPlanId,
  sourceDatabase,
}: Props) {
  const dispatch = useDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [histories] = useState<FetchHistory[]>([]);
  const [loadingKeywords, setLoadingKeywords] = useState(false);
  const progress = useAppSelector((state) => state.snackbar.progress);

  const selectedKeyword = useMemo(
    () => keywords.find((k) => k.id === selectedId) ?? null,
    [keywords, selectedId],
  );

  const loadKeywords = async () => {
    if (!researchPlanId) return;

    setLoadingKeywords(true);

    try {
      const data: ApiKeyword[] = await getKeywords(researchPlanId);

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
    loadKeywords();
  }, [researchPlanId]);

  const handleAddKeyword = async (name: string) => {
    await createKeyword(researchPlanId, name);
    dispatch(showSuccess('Keyword berhasil ditambahkan.'));
    await loadKeywords();
  };

  const handleDeleteKeyword = async (id: number) => {
    await deleteKeyword(researchPlanId, id);

    dispatch(showSuccess('Keyword berhasil dihapus.'));
    await loadKeywords();
  };

  const handleUpdateKeyword = async (id: number, name: string) => {
    await updateKeywordApi(researchPlanId, id, name);
    dispatch(showSuccess('Keyword berhasil diubah.'));
    await loadKeywords();
  };

  const handlePreviewMetadata = async (
    keywordId: number,
    params: FetchParams,
  ) => {
    return previewMetadata(researchPlanId, keywordId, params);
  };

  const handleFetchMetadata = async (
    keywordId: number,
    params: FetchParams,
  ) => {
    const response = await executeMetadata(researchPlanId, keywordId, params);

    if (response.message === 'All sources found in cache.') {
      dispatch(showSuccess('Metadata berhasil dimuat dari cache'));

      await loadKeywords();

      return;
    }

    if (response.batch_id) {
      dispatch(
        showProgressSnackbar({
          batchId: response.batch_id,
          message: 'Mengambil metadata...',
        }),
      );

      return;
    }

    await loadKeywords();
  };

  useEffect(() => {
    if (!progress.open || !progress.batchId || progress.status !== 'running') {
      return;
    }

    const interval = window.setInterval(async () => {
      try {
        const data = await getBatchProgress(progress.batchId as string);

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

          loadKeywords();

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

  return (
    <Box
      sx={{
        height: 'calc(100vh - 128px)',
        minHeight: 0,
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      <KeywordList
        keywords={keywords}
        onAdd={handleAddKeyword}
        onDelete={handleDeleteKeyword}
        onSelect={setSelectedId}
        onUpdate={handleUpdateKeyword}
      />

      <KeywordDetail
        researchPlanId={researchPlanId}
        keyword={selectedKeyword}
        histories={histories}
        sourceDatabase={sourceDatabase}
        onFetchMetadata={handleFetchMetadata}
        onPreviewMetadata={handlePreviewMetadata}
        onDeleteKeyword={handleDeleteKeyword}
      />

      <GlobalPanel keywordId={selectedId!} researchPlanId={researchPlanId} />
    </Box>
  );
}
