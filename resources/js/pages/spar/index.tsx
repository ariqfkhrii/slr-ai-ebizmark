import { getResearchPlanById } from '@/clients/researchPlan';
import { Head } from '@inertiajs/react';
import { Box, Paper, Tooltip, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import Acquisition from './acquisition';
import AiClassification from './ai-classification';
import AiExtraction from './ai-extraction';
import AutoReportingPage from './auto-reporting';
import Classification from './classification';
import {
  BreadcrumbProvider,
  useBreadcrumb,
} from './components/BreadcrumbContext';
import { GuideProvider, SparLayout } from './components/spar-layout';
import SparStepper from './components/SparStepper';
import Extraction from './extraction';
import { useSparStatus } from './hooks/useSparStatus';
import Purification from './purification';
import { ApiResponse, ResearchPlan } from './types';

const BreadcrumbDisplay = () => {
  const { title } = useBreadcrumb();
  return (
    <Typography variant="h6" sx={{ fontWeight: 700 }}>
      {title}
    </Typography>
  );
};

export default function Spar(props: any) {
  const researchPlanId = Number(props?.researchPlanId ?? 0);
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
  } = useSparStatus({
    researchPlanId,
  });

  const topicResponse = useQuery<ApiResponse<ResearchPlan>>({
    queryKey: ['research_plan', researchPlanId],
    queryFn: () =>
      getResearchPlanById({
        researchPlanId,
      }),
    enabled: !!researchPlanId,
  });

  const topic = topicResponse.data?.data;

  useEffect(() => {
    console.log('TOPIC: ', topic);
    console.log('PROPS: ', props);
  }, [topic, props]);

  const sourceDatabase = String(
    props?.researchPlan?.source_database ?? 'scopus',
  ).toLowerCase();

  if (loading) {
    return (
      <Box
        sx={{
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography>Memuat...</Typography>
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
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                mb: 0.25,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Topik Penelitian
            </Typography>

            <Tooltip title={topic?.title ?? '-'} arrow>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 700,
                  cursor: 'default',
                }}
              >
                {topic?.title ?? '-'}
              </Typography>
            </Tooltip>
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
            <SparStepper
              activeStep={activeStep}
              canOpenScreening={canOpenScreening}
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
            <SparLayout>
              {activeStep === 0 && (
                <Acquisition
                  researchPlanId={researchPlanId}
                  sourceDatabase={sourceDatabase}
                />
              )}

              {activeStep === 1 && (
                <Purification
                  researchPlanId={researchPlanId}
                  researchPlan={props.researchPlan}
                  filteredArticles={props.filteredArticles}
                />
              )}

              {activeStep === 2 &&
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

              {activeStep === 3 &&
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

              {activeStep === 4 && (
                <AutoReportingPage
                  researchPlanId={researchPlanId}
                  researchPlan={props.researchPlan}
                  items={props.items ?? []}
                  filteredArticles={(props.filteredArticles ?? []).filter(
                    (a: any) => a.included === true,
                  )}
                />
              )}
            </SparLayout>
          </GuideProvider>
        </Box>
      </Box>
    </BreadcrumbProvider>
  );
}
