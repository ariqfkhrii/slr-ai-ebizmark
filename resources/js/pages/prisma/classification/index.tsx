import { Box } from '@mui/material';
import ClassificationDetailDialog from './components/ClassificationDetailDialog';
import ClassificationResultTable from './components/ClassificationResultTable';
import ClassificationSetup from './components/ClassificationSetup';
import { useClassification } from './hooks/useClassification';

export default function Classification() {
  const classification = useClassification();

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
        onUpdateCategory={classification.updateCategory}
        onCheckAi={classification.checkIdeaClassificationFromAi}
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
      />
    </Box>
  );
}
