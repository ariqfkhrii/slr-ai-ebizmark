import { Box } from '@mui/material';
import type { FilteredArticleSummary } from '../purification/retrieval/types';
import ClassificationDetailDialog from './components/ClassificationDetailDialog';
import ClassificationResultTable from './components/ClassificationResultTable';
import ClassificationSetup from './components/ClassificationSetup';
import { useClassification } from './hooks/useClassification';
import type { ClassificationSetup as SetupType } from './types';

type Props = {
  filteredArticles: FilteredArticleSummary[];
  researchPlanId: number;
  classificationSetup: SetupType | null;
};

export default function Classification({
  filteredArticles,
  researchPlanId,
  classificationSetup,
}: Props) {
  const classification = useClassification(
    filteredArticles,
    researchPlanId,
    classificationSetup,
  );

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
      <ClassificationSetup
        categories={classification.categories}
        activeCategories={classification.activeCategories}
        theory={classification.theory}
        onUpdateCategory={classification.updateCategory}
        onUpdateTheory={classification.setTheory}
        onSaveSetup={classification.saveSetup}
      />

      <ClassificationResultTable
        articles={classification.articles}
        activeCategories={classification.activeCategories}
        onOpenDetail={classification.openDetail}
      />

      <ClassificationDetailDialog
        open={!!classification.selectedArticle}
        article={classification.selectedArticle}
        activeCategories={classification.activeCategories}
        onClose={classification.closeDetail}
        onUpdateClassification={classification.updateClassification}
        onUpdateResearchMethod={classification.updateResearchMethod}
        onSave={classification.saveClassification}
      />
    </Box>
  );
}
