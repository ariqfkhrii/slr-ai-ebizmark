import { Box, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useBreadcrumb } from '../../components/BreadcrumbContext';
import { useGuide } from '../../components/spar-layout';
import ScreeningGuide from '../../guides/ScreeningGuide';
import ScreeningTable from './components/ScreeningTable';
import { useScreening } from './hooks/useScreening';

type Props = {
  researchPlanId: number;
  onScreeningComplete?: () => void;
  setToolbar: (toolbar: React.ReactNode) => void;
};

export default function Screening({
  researchPlanId,
  onScreeningComplete,
  setToolbar,
}: Props) {
  const [selectedIncluded, setSelectedIncluded] = useState<number[]>([]);
  const [selectedExcluded, setSelectedExcluded] = useState<number[]>([]);

  const guideContent = useMemo(() => <ScreeningGuide />, []);
  const { setTitle } = useBreadcrumb();

  const { data, isLoading, bulkUpdateStatus, calculateRelevances } =
    useScreening({
      researchPlanId,
      onStatusChange: onScreeningComplete,
    });

  useGuide({
    title: 'Screening',
    content: guideContent,
  });

  useEffect(() => {
    setTitle('Purification');
  }, [setTitle]);

  useEffect(() => {
    setToolbar(null);

    return () => setToolbar(null);
  }, []);

  const filteredArticles = data ?? [];

  const excludedArticles = useMemo(
    () => filteredArticles.filter((item) => item.included !== true),
    [filteredArticles],
  );

  const includedArticles = useMemo(
    () => filteredArticles.filter((item) => item.included === true),
    [filteredArticles],
  );

  const handleExclude = async () => {
    if (selectedIncluded.length === 0) return;

    try {
      await bulkUpdateStatus.mutateAsync({
        filteredArticleIds: selectedIncluded,
        included: false,
      });

      setSelectedIncluded([]);
    } catch {}
  };

  const handleInclude = async () => {
    if (selectedExcluded.length === 0) return;

    try {
      await bulkUpdateStatus.mutateAsync({
        filteredArticleIds: selectedExcluded,
        included: true,
      });

      setSelectedExcluded([]);
    } catch {}
  };

  const handleCalculateRelevances = async () => {
    try {
      await calculateRelevances.mutateAsync({
        researchPlanId,
      });
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
          onCalculateRelevances={handleCalculateRelevances}
          calculateRelevancesPending={calculateRelevances.isPending}
          articleStatus="included"
        />
        <Box
          sx={{
            width: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <Tooltip title="Pindahkan ke Excluded">
              <span>
                <IconButton
                  onClick={handleExclude}
                  disabled={
                    selectedIncluded.length === 0 || bulkUpdateStatus.isPending
                  }
                  sx={{
                    bgcolor:
                      selectedIncluded.length > 0
                        ? 'error.main'
                        : 'action.disabledBackground',
                    color:
                      selectedIncluded.length > 0
                        ? 'common.white'
                        : 'action.disabled',
                    width: 42,
                    height: 42,
                    transition: 'all .2s',

                    '&:hover': {
                      bgcolor: 'error.dark',
                    },

                    '&.Mui-disabled': {
                      bgcolor: 'action.disabledBackground',
                      color: 'action.disabled',
                    },
                  }}
                >
                  <ChevronRight size={22} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Pindahkan ke Included">
              <span>
                <IconButton
                  onClick={handleInclude}
                  disabled={
                    selectedExcluded.length === 0 || bulkUpdateStatus.isPending
                  }
                  sx={{
                    bgcolor:
                      selectedExcluded.length > 0
                        ? 'success.main'
                        : 'action.disabledBackground',
                    color:
                      selectedExcluded.length > 0
                        ? 'common.white'
                        : 'action.disabled',
                    width: 42,
                    height: 42,
                    transition: 'all .2s',

                    '&:hover': {
                      bgcolor: 'success.dark',
                    },

                    '&.Mui-disabled': {
                      bgcolor: 'action.disabledBackground',
                      color: 'action.disabled',
                    },
                  }}
                >
                  <ChevronLeft size={22} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

        <ScreeningTable
          title="Artikel di-exclude"
          articles={excludedArticles}
          actionLabel="Include"
          selectedIds={selectedExcluded}
          onSelectionChange={setSelectedExcluded}
          articleStatus="excluded"
        />
      </Box>
    </Box>
  );
}
