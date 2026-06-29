import { Box, Button, CircularProgress } from '@mui/material';
import { useMemo } from 'react';
import { useGuide } from '../components/prisma-layout';
import ScreeningGuide from '../guides/ScreeningGuide';
import ScreeningColumn from './components/ScreeningColumn';
import ScreeningStatusCounter from './components/ScreeningStatusCounter';
import { useScreening } from './hooks/useScreening';

type Props = {
  researchPlanId: number;
  onScreeningComplete?: () => void; // Tambahkan prop ini
};

export default function Screening({
  researchPlanId,
  onScreeningComplete,
}: Props) {
  const guideContent = useMemo(() => <ScreeningGuide />, []);
  useGuide({
    title: 'Screening',
    content: guideContent,
  });

  const { data, isLoading, updateStatus, updateAllStatus } = useScreening({
    researchPlanId,
    onStatusChange: onScreeningComplete,
  });

  const filteredArticles = data ?? [];
  const leftArticles = useMemo(
    () => filteredArticles.filter((item) => item.included !== true),
    [filteredArticles],
  );

  const rightArticles = useMemo(
    () => filteredArticles.filter((item) => item.included === true),
    [filteredArticles],
  );

  const counters = useMemo(
    () => ({
      included: filteredArticles.filter((x) => x.included === true).length,
      excluded: filteredArticles.filter((x) => x.included === false).length,
      pending: filteredArticles.filter((x) => x.included === null).length,
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
          pending={counters.pending}
          total={filteredArticles.length}
        />
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', gap: 2 }}>
        <ScreeningColumn
          title="Pending / Excluded Record"
          articles={leftArticles}
          onInclude={(id) =>
            updateStatus.mutate({
              filteredArticleId: id,
              included: true,
            })
          }
          onExclude={(id) =>
            updateStatus.mutate({
              filteredArticleId: id,
              included: false,
            })
          }
        />

        <ScreeningColumn
          title="Included Record"
          articles={rightArticles}
          onInclude={(id) =>
            updateStatus.mutate({
              filteredArticleId: id,
              included: true,
            })
          }
          onExclude={(id) =>
            updateStatus.mutate({
              filteredArticleId: id,
              included: false,
            })
          }
        />
      </Box>
    </Box>
  );
}
