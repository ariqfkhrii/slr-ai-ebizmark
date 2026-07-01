import {
  createKeyword,
  deleteKeyword,
  executeMetadata,
  getBatchProgress,
  getFilteredArticles,
  getKeywords,
  previewMetadata,
  updateKeyword,
} from '@/clients/acquisition';
import { showError, showSuccess } from '@/store/slices/snackbarSlice';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { FetchParams } from '../components/dialog/FetchParameterDialog';

interface UseAcquisitionProps {
  researchPlanId: number;
  keywordId?: number;
  batchId?: string;
  page?: number;
  size?: number;
  onKeywordChange?: () => void;
  onMetadataExecute?: () => void;
}

export const useAcquisition = ({
  researchPlanId,
  keywordId,
  batchId,
  page = 1,
  size = 10,
  onKeywordChange,
  onMetadataExecute,
}: UseAcquisitionProps) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const keywordQueryKey = ['keywords', researchPlanId];
  const filteredArticleQueryKey = [
    'filtered-articles',
    researchPlanId,
    keywordId,
    page,
    size,
  ];

  const keywordsQuery = useQuery<any>({
    queryKey: keywordQueryKey,
    queryFn: () => getKeywords(researchPlanId),
    enabled: !!researchPlanId,
  });

  const filteredArticlesQuery = useQuery<any>({
    queryKey: filteredArticleQueryKey,
    queryFn: () =>
      getFilteredArticles({
        researchPlanId,
        keywordId,
        page,
        size,
      }),
    enabled: !!researchPlanId,
  });

  const batchProgressQuery = useQuery<any>({
    queryKey: ['metadata-progress', batchId],
    queryFn: () => getBatchProgress(batchId!),
    enabled: !!batchId,
    refetchInterval: (query) => {
      const data: any = query.state.data;

      if (!data) return 3000;

      if (
        data.status === 'completed' ||
        data.status === 'failed' ||
        data.finished
      ) {
        return false;
      }

      return 3000;
    },
  });

  const createKeywordMutation = useMutation({
    mutationFn: (keyword: string) => createKeyword(researchPlanId, keyword),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: keywordQueryKey,
      });

      dispatch(showSuccess('Keyword berhasil ditambahkan.'));
      onKeywordChange?.();
    },

    onError: () => {
      dispatch(showError('Gagal menambahkan keyword.'));
    },
  });

  const updateKeywordMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      updateKeyword(researchPlanId, id, name),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: keywordQueryKey,
      });

      dispatch(showSuccess('Keyword berhasil diperbarui.'));
      onKeywordChange?.();
    },

    onError: () => {
      dispatch(showError('Gagal memperbarui keyword.'));
    },
  });

  const deleteKeywordMutation = useMutation({
    mutationFn: (keywordId: number) => deleteKeyword(researchPlanId, keywordId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: keywordQueryKey,
      });

      dispatch(showSuccess('Keyword berhasil dihapus.'));
      onKeywordChange?.();
    },

    onError: () => {
      dispatch(showError('Gagal menghapus keyword.'));
    },
  });

  const previewMetadataMutation = useMutation({
    mutationFn: ({
      keywordId,
      params,
    }: {
      keywordId: number;
      params: FetchParams;
    }) => previewMetadata(researchPlanId, keywordId, params),

    onError: (error: any) => {
      dispatch(
        showError(error?.message ?? 'Gagal mengambil preview metadata.'),
      );
    },
  });

  const executeMetadataMutation = useMutation({
    mutationFn: ({
      keywordId,
      params,
    }: {
      keywordId: number;
      params: FetchParams;
    }) => executeMetadata(researchPlanId, keywordId, params),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: filteredArticleQueryKey,
      });

      dispatch(showSuccess('Metadata berhasil dijalankan.'));
      onMetadataExecute?.();
    },

    onError: (error: any) => {
      dispatch(
        showError(error?.message ?? 'Gagal menjalankan metadata search.'),
      );
    },
  });

  return {
    keywordsQuery,
    filteredArticlesQuery,
    batchProgressQuery,

    createKeyword: createKeywordMutation,
    updateKeyword: updateKeywordMutation,
    deleteKeyword: deleteKeywordMutation,

    previewMetadata: previewMetadataMutation,
    executeMetadata: executeMetadataMutation,
  };
};
