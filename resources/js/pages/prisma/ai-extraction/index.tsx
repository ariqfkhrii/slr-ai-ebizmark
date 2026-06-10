import { Box } from '@mui/material';
import ExtractionProcessPanel from './components/ExtractionProcessPanel';
import ExtractionResultTable from './components/ExtractionResultTable';
import ExtractionSyncDialog from './components/ExtractionSyncDialog';
import ExtractionDetailDialog from './components/ExtractionDetailDialog';
import { useExtraction } from './hooks/useExtraction';
import type { FilteredArticleSummary } from '../retrieval/types';

type Props = {
  filteredArticles: FilteredArticleSummary[];
  researchPlanId: number;
};

export default function Extraction({ filteredArticles, researchPlanId }: Props) {
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
      />
    </Box>
  );
}
