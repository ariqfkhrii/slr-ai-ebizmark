import { getResearchPlanById } from '@/clients/researchPlan';
import { Head } from '@inertiajs/react';
import { Box, Paper, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import AiClassification from './ai-classification';
import AiExtraction from './ai-extraction';
import AutoReportingPage from './auto-reporting';
import Classification from './classification';
import {
  BreadcrumbProvider,
  useBreadcrumb,
} from './components/BreadcrumbContext';
import { GuideProvider, PrismaLayout } from './components/prisma-layout';
import PrismaStepper from './components/PrismaStepper';
import Extraction from './extraction';
import { usePrismaStatus } from './hooks/usePrismaStatus';
import Identification from './identification';
import Retrieval from './retrieval';
import Screening from './screening';
import { ResearchPlan } from './types';

const BreadcrumbDisplay = () => {
  const { title } = useBreadcrumb();
  return (
    <Typography variant="h6" sx={{ fontWeight: 700 }}>
      {title}
    </Typography>
  );
};

export default function Prisma(props: any) {
  const researchPlanId = Number(props?.researchPlan?.research_plan_id ?? 0);
  const [activeStep, setActiveStep] = useState(0);
  const [classificationMode, setClassificationMode] = useState<'manual' | 'ai'>(
    'ai',
  );
  const [extractionMode, setExtractionMode] = useState<'manual' | 'ai'>('ai');

  const {
    loading,
    error,
    canOpenScreening,
    canOpenRetrieval,
    canOpenClassification,
    canOpenExtraction,
    canOpenReport,
    refetch,
    invalidate,
  } = usePrismaStatus({
    researchPlanId,
  });

  const topic = useQuery<ResearchPlan>({
    queryKey: ['research_plan', researchPlanId],
    queryFn: () =>
      getResearchPlanById({
        researchPlanId,
      }),
    enabled: !!researchPlanId,
  });

  useEffect(() => {
    console.log('TOPIC: ', topic);
  }, [topic]);

  const sourceDatabase = String(
    props?.researchPlan?.source_database ?? 'scopus',
  ).toLowerCase();

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading PRISMA data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error: {error}</Typography>
        <button onClick={refetch}>Retry</button>
      </Box>
    );
  }

  return (
    <BreadcrumbProvider>
      <Head title="PRISMA" />

      <Box
        sx={{
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        <Paper
          elevation={2}
          sx={{ px: 2, py: 1.5, borderRadius: 0, flexShrink: 0 }}
        >
          <BreadcrumbDisplay />
        </Paper>

        <Paper
          elevation={2}
          sx={{
            borderRadius: 0,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            minHeight: 58,
          }}
        >
          {/* TOPIK AREA */}
          <Box
            sx={{
              width: 280,
              flexShrink: 0,
              px: 2,
              py: 1.5,
              borderRight: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {topic.data?.title ? topic.data?.title : '-'}
            </Typography>
          </Box>

          {/* STEPPER AREA */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              px: 3,
              py: 1.5,
            }}
          >
            <PrismaStepper
              activeStep={activeStep}
              canOpenScreening={canOpenScreening}
              canOpenRetrieval={canOpenRetrieval}
              canOpenClassification={canOpenClassification}
              canOpenExtraction={canOpenExtraction}
              canOpenReport={canOpenReport}
              classificationMode={classificationMode}
              onClassificationModeChange={setClassificationMode}
              extractionMode={extractionMode}
              onExtractionModeChange={setExtractionMode}
              onStepClick={(step) => {
                if (step === 1 && !canOpenScreening) return;
                if (step === 2 && !canOpenRetrieval) return;
                if (step === 3 && !canOpenClassification) return;
                if (step === 4 && !canOpenExtraction) return;
                if (step === 5 && !canOpenReport) return;

                setActiveStep(step);
              }}
            />
          </Box>
        </Paper>

        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <GuideProvider>
            <PrismaLayout>
              {activeStep === 0 && (
                <Identification
                  researchPlanId={researchPlanId}
                  sourceDatabase={sourceDatabase}
                />
              )}

              {activeStep === 1 && (
                <Screening
                  researchPlanId={researchPlanId}
                  onScreeningComplete={invalidate}
                />
              )}

              {activeStep === 2 && <Retrieval {...props} />}

              {activeStep === 3 &&
                (classificationMode === 'manual' ? (
                  <Classification
                    filteredArticles={props.filteredArticles}
                    researchPlanId={researchPlanId}
                    classificationSetup={props.classificationSetup ?? null}
                  />
                ) : (
                  <AiClassification
                    filteredArticles={props.filteredArticles}
                    researchPlanId={researchPlanId}
                    classificationSetup={props.classificationSetup ?? null}
                  />
                ))}

              {activeStep === 4 &&
                (extractionMode === 'manual' ? (
                  <Extraction
                    filteredArticles={props.filteredArticles}
                    researchPlanId={researchPlanId}
                  />
                ) : (
                  <AiExtraction
                    filteredArticles={props.filteredArticles}
                    researchPlanId={researchPlanId}
                  />
                ))}

              {activeStep === 5 && (
                <AutoReportingPage
                  researchPlanId={researchPlanId}
                  researchPlan={props.researchPlan}
                  items={props.items ?? []}
                  filteredArticles={(props.filteredArticles ?? []).filter(
                    (a: any) => a.article_status === 'included',
                  )}
                />
              )}
            </PrismaLayout>
          </GuideProvider>
        </Box>
      </Box>
    </BreadcrumbProvider>
  );
}
