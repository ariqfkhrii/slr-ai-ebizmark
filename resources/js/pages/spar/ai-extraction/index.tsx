import { Box } from '@mui/material';
import type { FilteredArticleSummary } from '../purification/retrieval/types';
import ExtractionDetailDialog from './components/ExtractionDetailDialog';
import ExtractionProcessPanel from './components/ExtractionProcessPanel';
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

  return (
    <Box>
      <ExtractionProcessPanel onRunAi={extraction.runAiExtraction} />
      <ExtractionResultTable
        articles={extraction.articles}
        onOpenDetail={extraction.openDetail}
        onOpenEdit={extraction.openEdit}
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
