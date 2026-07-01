import {
  bulkUpdatePurificationStatus,
  getAllPurificationArticles,
  updateAllPurificationStatus,
  updatePurificationStatus,
} from '@/clients/screening';
import { showError, showSuccess } from '@/lib/store/snackbarSlice';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { FilteredArticle } from '../types';

interface UseScreeningProps {
  researchPlanId: number;
  page?: number;
  size?: number;
  onStatusChange?: () => void;
}

export const useScreening = ({
  researchPlanId,
  onStatusChange,
}: UseScreeningProps) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const queryKey = ['purification-all', researchPlanId];

  const query = useQuery<FilteredArticle[]>({
    queryKey,
    queryFn: () =>
      getAllPurificationArticles({
        researchPlanId,
      }),
    enabled: !!researchPlanId,
  });

  const updateStatus = useMutation({
    mutationFn: updatePurificationStatus,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({
        queryKey: ['purification', researchPlanId],
      });

      if (onStatusChange) {
        onStatusChange();
      }
    },

    onError: () => {
      dispatch(showError('Gagal memperbarui status artikel.'));
    },
  });

  const updateAllStatus = useMutation({
    mutationFn: updateAllPurificationStatus,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({
        queryKey: ['purification', researchPlanId],
      });

      if (onStatusChange) {
        onStatusChange();
      }

      dispatch(showSuccess('Status seluruh artikel berhasil diperbarui.'));
    },

    onError: () => {
      dispatch(showError('Gagal memperbarui seluruh status artikel.'));
    },
  });

  const bulkUpdateStatus = useMutation({
    mutationFn: bulkUpdatePurificationStatus,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });

      queryClient.invalidateQueries({
        queryKey: ['purification', researchPlanId],
      });

      dispatch(showSuccess('Status artikel berhasil diperbarui.'));

      onStatusChange?.();
    },

    onError: () => {
      dispatch(showError('Gagal memperbarui status artikel.'));
    },
  });

  return {
    ...query,
    updateStatus,
    updateAllStatus,
    bulkUpdateStatus,
  };
};
