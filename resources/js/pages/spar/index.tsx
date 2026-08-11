import { getResearchPlanById } from '@/clients/researchPlan';
import { Head, router } from '@inertiajs/react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { House, Upload } from 'lucide-react';
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

const BreadcrumbDisplay = ({ researchPlanId }: { researchPlanId: number }) => {
  const { title } = useBreadcrumb();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Tooltip title={'Kembali ke Menu Topik SLR'}>
          <IconButton
            component="a"
            href="/dashboard"
            sx={{
              width: 32,
              height: 32,
              borderRadius: 3,
              bgcolor: 'primary.main',
              color: 'common.white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            <House size={26} />
          </IconButton>
        </Tooltip>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            ml: 0.5,
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box>
        <Tooltip title={'Unggah Sumber Lain'}>
          <Button
            variant="contained"
            startIcon={<Upload size={20} />}
            onClick={() =>
              router.visit(
                `/research-plans/${researchPlanId}/upload-other-source`,
              )
            }
            sx={{
              borderRadius: 3,
              textTransform: 'none',
            }}
          >
            Unggah Sumber Lain
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default function Spar(props: any) {
  const researchPlanId = Number(props?.researchPlanId ?? 0);
  const [activeStep, setActiveStep] = useState(0);
  const [classificationMode, setClassificationMode] = useState<'manual' | 'ai'>(
    'manual',
  );
  const [extractionMode, setExtractionMode] = useState<'manual' | 'ai'>(
    'manual',
  );

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
          <BreadcrumbDisplay researchPlanId={researchPlanId} />
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
                  onFetchSuccess={() => {
                    refetch();
                  }}
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
                  filteredArticles={props.filteredArticles ?? []}
                />
              )}
            </SparLayout>
          </GuideProvider>
        </Box>
      </Box>
    </BreadcrumbProvider>
  );
}
