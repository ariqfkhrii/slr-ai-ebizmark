'use client';

import { Box } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import KeywordDetail from './components/KeywordDetail';
import KeywordList from './components/KeywordList';

import { useAppSelector } from '@/lib/store/hooks';
import {
  hideProgressSnackbar,
  showProgressSnackbar,
  showSuccess,
  updateProgressSnackbar,
} from '@/store/slices/snackbarSlice';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useBreadcrumb } from '../components/BreadcrumbContext';
import { useGuide } from '../components/spar-layout';
import AcquisitionGuide from '../guides/IdentificationGuide';
import { FetchParams } from './components/dialog/FetchParameterDialog';
import { useAcquisition } from './hooks/useAcquisition';
import { FetchHistory, Keyword } from './types';

type Props = {
  researchPlanId: number;
  sourceDatabase: string;
  onFetchSuccess?: () => void;
};

export default function AcquisitionPage({
  researchPlanId,
  sourceDatabase,
  onFetchSuccess,
}: Props) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { setTitle } = useBreadcrumb();

  const progress = useAppSelector((state) => state.snackbar.progress);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [articleRefreshKey, setArticleRefreshKey] = useState(0);

  const histories = useMemo<FetchHistory[]>(() => [], []);

  const guideContent = useMemo(() => <AcquisitionGuide />, []);

  useGuide({
    title: 'Acquisition',
    content: guideContent,
  });

  useEffect(() => {
    setTitle('Acquisition');
  }, [setTitle]);

  const {
    keywordsQuery,
    previewMetadata,
    executeMetadata,
    createKeyword,
    updateKeyword,
    deleteKeyword,
    batchProgressQuery,
  } = useAcquisition({
    researchPlanId,
    keywordId: selectedId ?? undefined,
    batchId: progress.batchId ?? undefined,
  });

  const keywords: Keyword[] = useMemo(() => {
    if (!keywordsQuery.data) return [];

    return keywordsQuery.data.map((item: any) => ({
      id: item.id,
      name: item.name,
      retrievedCount: item.article_count,
      duplicateCount: item.duplicate_count,
      unmatchedTierCount: item.unmatched_tier_count,
      missingDoiCount: item.missing_doi_count,
      outOfYearRangeCount: item.out_of_year_range_count,
    }));
  }, [keywordsQuery.data]);

  useEffect(() => {
    if (keywords.length > 0) {
      const exists = keywords.some((k) => k.id === selectedId);
      if (selectedId === null || !exists) {
        setSelectedId(keywords[0].id);
      }
    }
  }, [keywords, selectedId]);

  const selectedKeyword = useMemo(
    () => keywords.find((k) => k.id === selectedId) ?? null,
    [keywords, selectedId],
  );

  const refreshArticles = () => {
    setArticleRefreshKey((prev) => prev + 1);
  };

  const handleAddKeyword = (name: string) => {
    createKeyword.mutate(name);
  };

  const handleUpdateKeyword = (id: number, name: string) => {
    updateKeyword.mutate({
      id,
      name,
    });
  };

  const handleDeleteKeyword = (id: number) => {
    deleteKeyword.mutate(id, {
      onSuccess: () => {
        setSelectedId(null);
      },
    });
  };

  const handlePreviewMetadata = (keywordId: number, params: FetchParams) => {
    return previewMetadata.mutateAsync({
      keywordId,
      params,
    });
  };

  const handleFetchMetadata = async (
    keywordId: number,
    params: FetchParams,
  ) => {
    const response = await executeMetadata.mutateAsync({
      keywordId,
      params,
    });

    if (response.message === 'All sources found in cache.') {
      refreshArticles();
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

    refreshArticles();
  };

  useEffect(() => {
    const data = batchProgressQuery.data;

    if (!progress.open || !data) return;

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
      queryClient.invalidateQueries({
        queryKey: ['keywords', researchPlanId],
      });

      queryClient.invalidateQueries({
        queryKey: ['filtered-articles', researchPlanId],
      });
      refreshArticles();

      if (onFetchSuccess) {
        onFetchSuccess();
      }

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
  }, [batchProgressQuery.data, progress.open, dispatch]);

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
        keyword={selectedKeyword}
        onSave={(query) => {
          if (selectedKeyword) {
            handleUpdateKeyword(selectedKeyword.id, query);
          } else {
            handleAddKeyword(query);
          }
        }}
      />

      <KeywordDetail
        researchPlanId={researchPlanId}
        keyword={selectedKeyword}
        histories={histories}
        sourceDatabase={sourceDatabase}
        onPreviewMetadata={handlePreviewMetadata}
        onFetchMetadata={handleFetchMetadata}
        onDeleteKeyword={handleDeleteKeyword}
        refreshTrigger={articleRefreshKey}
      />
    </Box>
  );
}
