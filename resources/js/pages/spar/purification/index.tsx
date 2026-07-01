import { Box, Tab, Tabs } from '@mui/material';
import { ReactNode, useState } from 'react';
import Retrieval from './retrieval';
import { FilteredArticleSummary, ResearchPlanSummary } from './retrieval/types';
import Screening from './screening';

type Props = {
  researchPlanId: number;
  researchPlan: ResearchPlanSummary;
  filteredArticles: FilteredArticleSummary[];
};

export default function Purification({
  researchPlanId,
  researchPlan,
  filteredArticles,
}: Props) {
  const [tab, setTab] = useState(0);
  const [toolbar, setToolbar] = useState<ReactNode>(null);

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          minHeight: 0,
        }}
      >
        <Tabs value={tab} onChange={(_, value) => setTab(value)}>
          <Tab label="Screening" />
          <Tab label="Retrieval" />
        </Tabs>

        <Box>{toolbar}</Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {tab === 0 && (
          <Screening researchPlanId={researchPlanId} setToolbar={setToolbar} />
        )}

        {tab === 1 && (
          <Retrieval
            researchPlan={researchPlan}
            filteredArticles={filteredArticles}
          />
        )}
      </Box>
    </Box>
  );
}
