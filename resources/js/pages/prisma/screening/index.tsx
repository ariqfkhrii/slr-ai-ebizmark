import { Box, Button } from '@mui/material';
import { Check, X } from 'lucide-react';
import { useGuide } from '../components/prisma-layout';
import ScreeningGuide from '../guides/ScreeningGuide';
import ScreeningColumn from './components/ScreeningColumn';
import ScreeningStatusCounter from './components/ScreeningStatusCounter';
import { useScreening } from './hooks/useScreening';

type Props = ReturnType<typeof useScreening>;

export default function Screening({
  filteredArticles,
  counters,
  updateStatus,
  includeAll,
  excludeAll,
}: Props) {
  const rightArticles = filteredArticles.filter(
    (item) => item.included === true,
  );

  const leftArticles = filteredArticles.filter(
    (item) => item.included === false || item.included === null,
  );

  useGuide({
    title: 'Screening',
    content: <ScreeningGuide />,
  });

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
            startIcon={<X size={14} />}
            onClick={excludeAll}
          >
            Exclude All
          </Button>

          <Button
            size="small"
            color="success"
            variant="contained"
            startIcon={<Check size={14} />}
            onClick={includeAll}
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
          onInclude={(id) => updateStatus(id, true)}
          onExclude={(id) => updateStatus(id, false)}
        />

        <ScreeningColumn
          title="Included Record"
          articles={rightArticles}
          onInclude={(id) => updateStatus(id, true)}
          onExclude={(id) => updateStatus(id, false)}
        />
      </Box>
    </Box>
  );
}
