import { Box } from '@mui/material';
import AiClassificationDetailDialog from './components/AiClassificationDetailDialog';
import AiClassificationResultTable from './components/AiClassificationResultTable';
import AiClassificationSetup from './components/AiClassificationSetup';
import { useAiClassification } from './hooks/useAiClassification';
import type { FilteredArticleSummary } from '../retrieval/types';

type Props = {
  filteredArticles: FilteredArticleSummary[];
};

export default function AiClassification({ filteredArticles }: Props) {
  const classification = useAiClassification(filteredArticles);

  return (
    <Box
      sx={{
        height: 'calc(100vh - 128px)',
        minHeight: 0,
        p: 2,
        display: 'grid',
        gridTemplateColumns: '340px minmax(0, 1fr)',
        gap: 2,
        overflow: 'hidden',
        bgcolor: '#f8fafc',
      }}
    >
      <AiClassificationSetup
        categories={classification.categories}
        activeCategories={classification.activeCategories}
        onUpdateCategory={classification.updateCategory}
        onCheckAi={classification.checkIdeaClassificationFromAi}
      />

      <AiClassificationResultTable
        articles={classification.articles}
        activeCategories={classification.activeCategories}
        onOpenDetail={classification.openDetail}
      />

      <AiClassificationDetailDialog
        open={!!classification.selectedArticle}
        article={classification.selectedArticle}
        activeCategories={classification.activeCategories}
        onClose={classification.closeDetail}
        onUpdateClassification={classification.updateClassification}
        onUpdateResearchMethod={classification.updateResearchMethod}
      />
    </Box>
  );
}
