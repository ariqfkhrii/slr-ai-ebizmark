import { Box } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useBreadcrumb } from '../components/BreadcrumbContext';
import { useGuide } from '../components/spar-layout';
import AiClassificationGuide from '../guides/AiClassificationGuide';
import type { FilteredArticleSummary } from '../purification/retrieval/types';
import AiClassificationDetailDialog from './components/AiClassificationDetailDialog';
import AiClassificationResultTable from './components/AiClassificationResultTable';
import AiClassificationSetup from './components/AiClassificationSetup';
import AiClassificationSyncDialog from './components/AiClassificationSyncDialog';
import { useAiClassification } from './hooks/useAiClassification';
import type { ClassificationSetup } from './types';

type Props = {
  filteredArticles: FilteredArticleSummary[];
  researchPlanId: number;
  classificationSetup: ClassificationSetup | null;
};

export default function AiClassification({
  filteredArticles,
  researchPlanId,
  classificationSetup,
}: Props) {
  const classification = useAiClassification(
    filteredArticles,
    researchPlanId,
    classificationSetup,
  );

  const guideContent = useMemo(() => <AiClassificationGuide />, []);
  const { setTitle } = useBreadcrumb();
  const { guideOpen } = useGuide({
    title: 'AI Classification',
    content: guideContent,
  });

  useEffect(() => {
    setTitle('AI Classification');
  }, [setTitle]);

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
        theory={classification.theory}
        onUpdateCategory={classification.updateCategory}
        onUpdateTheory={classification.setTheory}
        onSaveSetup={classification.saveSetup}
        onRunAi={classification.runAiClassification}
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
        onSave={classification.saveClassification}
        saving={classification.isSavingManualEdit}
      />

      <AiClassificationSyncDialog
        open={classification.syncOpen}
        status={classification.syncStatus}
        progress={classification.syncProgress}
        processed={classification.syncProcessed}
        total={classification.syncTotal}
        errorMessage={classification.syncError}
        onClose={classification.closeSync}
      />
    </Box>
  );
}
