import { Box, Button, CircularProgress } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useBreadcrumb } from '../../components/BreadcrumbContext';
import { useGuide } from '../../components/spar-layout';
import ScreeningGuide from '../../guides/ScreeningGuide';
import ScreeningStatusCounter from './components/ScreeningStatusCounter';
import ScreeningTable from './components/ScreeningTable';
import { useScreening } from './hooks/useScreening';

type Props = {
  researchPlanId: number;
  onScreeningComplete?: () => void;
};

export default function Screening({
  researchPlanId,
  onScreeningComplete,
}: Props) {
  const guideContent = useMemo(() => <ScreeningGuide />, []);
  const { setTitle } = useBreadcrumb();

  useGuide({
    title: 'Screening',
    content: guideContent,
  });

  useEffect(() => {
    setTitle('Purification');
  }, [setTitle]);

  const { data, isLoading, updateStatus, updateAllStatus } = useScreening({
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

  const onInclude = (id: number) => {
    updateStatus.mutate({
      filteredArticleId: id,
      included: true,
    });
  };

  const onExclude = (id: number) => {
    updateStatus.mutate({
      filteredArticleId: id,
      included: false,
    });
  };

  const counters = useMemo(
    () => ({
      included: filteredArticles.filter((x) => x.included === true).length,
      excluded: filteredArticles.filter((x) => x.included === false).length,
    }),
    [filteredArticles],
  );

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
        height: 'calc(100vh - 128px)',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            color="error"
            variant="contained"
            onClick={() =>
              updateAllStatus.mutate({
                researchPlanId,
                included: false,
              })
            }
          >
            Exclude All
          </Button>

          <Button
            size="small"
            color="success"
            variant="contained"
            onClick={() =>
              updateAllStatus.mutate({
                researchPlanId,
                included: true,
              })
            }
          >
            Include All
          </Button>
        </Box>

        <ScreeningStatusCounter
          included={counters.included}
          excluded={counters.excluded}
          total={filteredArticles.length}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
        <ScreeningTable
          title="Included Articles"
          articles={includedArticles}
          actionLabel="Exclude"
          onAction={onExclude}
        />

        <ScreeningTable
          title="Excluded Articles"
          articles={excludedArticles}
          actionLabel="Include"
          onAction={onInclude}
        />
      </Box>
    </Box>
  );
}
