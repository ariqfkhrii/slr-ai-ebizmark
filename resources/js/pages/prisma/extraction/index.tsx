import { Box } from '@mui/material';
import type { FilteredArticleSummary } from '../retrieval/types';
import ExtractionArticleTable from './components/ExtractionArticleTable';
import ExtractionWorkspace from './components/ExtractionWorkspace';
import { useExtraction } from './hooks/useExtraction';

type Props = {
  filteredArticles?: FilteredArticleSummary[];
  researchPlanId?: number;
};

export default function Extraction({ filteredArticles = [], researchPlanId = 0 }: Props) {
  const extraction = useExtraction({ filteredArticles, researchPlanId });

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
      <ExtractionArticleTable
        articles={extraction.articles}
        onOpenExtraction={extraction.openExtraction}
        onSynchronizeArticle={extraction.synchronizeArticle}
        onSynchronizePdf={extraction.synchronizePdf}
      />

      <ExtractionWorkspace
        open={!!extraction.selectedArticle}
        article={extraction.selectedArticle}
        values={extraction.formValues}
        onClose={extraction.closeExtraction}
        onChange={extraction.updateField}
        onSave={extraction.saveExtraction}
      />
    </Box>
  );
}
