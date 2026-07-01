import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useBreadcrumb } from '../../components/BreadcrumbContext';
import { useGuide } from '../../components/spar-layout';
import ScreeningGuide from '../../guides/ScreeningGuide';
import ScreeningTable from './components/ScreeningTable';
import { useScreening } from './hooks/useScreening';

type Props = {
  researchPlanId: number;
  onScreeningComplete?: () => void;
  setToolbar: (toolbar: ReactNode) => void;
};

export default function Screening({
  researchPlanId,
  onScreeningComplete,
  setToolbar,
}: Props) {
  const [selectedIncluded, setSelectedIncluded] = useState<number[]>([]);
  const [selectedExcluded, setSelectedExcluded] = useState<number[]>([]);
  const selectedCount = selectedIncluded.length + selectedExcluded.length;
  const guideContent = useMemo(() => <ScreeningGuide />, []);
  const { setTitle } = useBreadcrumb();

  const { guideOpen } = useGuide({
    title: 'Screening',
    content: guideContent,
  });

  useEffect(() => {
    setTitle('Purification');
  }, [setTitle]);

  useEffect(() => {
    setToolbar(
      selectedCount > 0 ? (
        <Paper
          elevation={3}
          sx={{
            px: 2,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            borderRadius: 2,
            mt: 1,
            mr: guideOpen ? 2 : 15,
            transition: 'margin-right 250ms ease',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {selectedCount} artikel dipilih
          </Typography>

          <Button size="small" onClick={handleCancelSelection}>
            Batal
          </Button>

          <Button
            size="small"
            variant="contained"
            onClick={handleConfirmSelection}
            disabled={bulkUpdateStatus.isPending}
          >
            Konfirmasi
          </Button>
        </Paper>
      ) : null,
    );

    return () => setToolbar(null);
  }, [selectedCount, guideOpen]);

  const { data, isLoading, bulkUpdateStatus } = useScreening({
    researchPlanId,
    onStatusChange: onScreeningComplete,
  });

  const filteredArticles = data ?? [];
  const excludedArticles = useMemo(
    () => filteredArticles.filter((item) => item.included !== true),
    [filteredArticles],
  );

  const includedArticles = useMemo(
    () => filteredArticles.filter((item) => item.included === true),
    [filteredArticles],
  );

  const handleCancelSelection = () => {
    setSelectedIncluded([]);
    setSelectedExcluded([]);
  };

  const handleConfirmSelection = async () => {
    if (selectedCount === 0) return;

    try {
      if (selectedExcluded.length > 0) {
        await bulkUpdateStatus.mutateAsync({
          filteredArticleIds: selectedExcluded,
          included: true,
        });
      }

      if (selectedIncluded.length > 0) {
        await bulkUpdateStatus.mutateAsync({
          filteredArticleIds: selectedIncluded,
          included: false,
        });
      }

      handleCancelSelection();
    } catch {}
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          height: 'calc(100vh - 128px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 2,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          maxHeight: '78vh',
        }}
      >
        <ScreeningTable
          title="Artikel di-include"
          articles={includedArticles}
          actionLabel="Exclude"
          selectedIds={selectedIncluded}
          onSelectionChange={setSelectedIncluded}
        />

        <ScreeningTable
          title="Artikel di-exclude"
          articles={excludedArticles}
          actionLabel="Include"
          selectedIds={selectedExcluded}
          onSelectionChange={setSelectedExcluded}
        />
      </Box>
    </Box>
  );
}
