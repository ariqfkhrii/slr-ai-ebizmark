import {
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
}

export const useScreening = ({ researchPlanId }: UseScreeningProps) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const query = useQuery<FilteredArticle[]>({
    queryKey: ['purification-all', researchPlanId],
    queryFn: () =>
      getAllPurificationArticles({
        researchPlanId,
      }),
    enabled: !!researchPlanId,
  });

  const updateStatus = useMutation({
    mutationFn: updatePurificationStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['purification', researchPlanId],
      });
    },
  });

  const updateAllStatus = useMutation({
    mutationFn: updateAllPurificationStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['purification', researchPlanId],
      });

      dispatch(showSuccess('Status seluruh artikel berhasil diperbarui.'));
    },
    onError: () => {
      dispatch(showError('Gagal memperbarui seluruh status artikel.'));
    },
  });

  return {
    ...query,
    updateStatus,
    updateAllStatus,
  };
};
