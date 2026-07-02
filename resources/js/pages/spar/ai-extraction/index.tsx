import { Box } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useBreadcrumb } from '../components/BreadcrumbContext';
import { useGuide } from '../components/spar-layout';
import AiExtractionGuide from '../guides/AiExtractionGuide';
import type { FilteredArticleSummary } from '../purification/retrieval/types';
import ExtractionDetailDialog from './components/ExtractionDetailDialog';
import ExtractionResultTable from './components/ExtractionResultTable';
import ExtractionSyncDialog from './components/ExtractionSyncDialog';
import { useExtraction } from './hooks/useExtraction';

type Props = {
  filteredArticles: FilteredArticleSummary[];
  researchPlanId: number;
};

export default function Extraction({
  filteredArticles,
  researchPlanId,
}: Props) {
  const extraction = useExtraction(filteredArticles, researchPlanId);
  const guideContent = useMemo(() => <AiExtractionGuide />, []);
  const { setTitle } = useBreadcrumb();
  const { guideOpen } = useGuide({
    title: 'AI Extraction',
    content: guideContent,
  });

  useEffect(() => {
    setTitle('AI Extraction');
  }, [setTitle]);

  return (
    <Box
      sx={{
        height: 'calc(100vh - 128px)',
        minHeight: 0,
        p: 2,
        bgcolor: '#f8fafc',
        overflow: 'hidden',
      }}
    >
      <ExtractionResultTable
        onRunAi={extraction.runAiExtraction}
        articles={extraction.articles}
        onOpenDetail={extraction.openDetail}
        onOpenEdit={extraction.openEdit}
        guideOpen={guideOpen}
      />

      <ExtractionSyncDialog
        open={extraction.syncOpen}
        status={extraction.syncStatus}
        progress={extraction.syncProgress}
        processed={extraction.syncProcessed}
        total={extraction.syncTotal}
        errorMessage={extraction.syncError}
        onClose={extraction.closeSync}
      />

      <ExtractionDetailDialog
        open={!!extraction.selectedArticle}
        mode={extraction.dialogMode}
        article={extraction.selectedArticle}
        onClose={extraction.closeDialog}
        onSave={extraction.updateExtraction}
        saving={extraction.isSavingManualEdit}
      />
    </Box>
  );
}
