import { Head } from '@inertiajs/react';
import { Box, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import AiClassification from './ai-classification';
import AiExtraction from './ai-extraction';
import AutoReportingPage from './auto-reporting';
import Classification from './classification';
import { GuideProvider, PrismaLayout } from './components/prisma-layout';
import PrismaStepper from './components/PrismaStepper';
import Extraction from './extraction';
import Identification from './identification';
import Retrieval from './retrieval';
import Screening from './screening';

export default function Prisma(props: any) {
  const researchPlanId = Number(props?.researchPlan?.research_plan_id ?? 0);
  const [activeStep, setActiveStep] = useState(0);
  const [classificationMode, setClassificationMode] = useState<'manual' | 'ai'>(
    'ai',
  );
  const [extractionMode, setExtractionMode] = useState<'manual' | 'ai'>('ai');

  const globalArticles = undefined;
  // const canOpenScreening = globalArticles.length > 0;
  // const canOpenRetrieval = screening.counters.included > 0;
  // const canOpenClassification = true;
  // const canOpenExtraction = true;
  // const canOpenReport = researchPlanId > 0;

  const sourceDatabase = String(
    props?.researchPlan?.source_database ?? 'scopus',
  ).toLowerCase();
  return (
    <>
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
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            PRISMA
          </Typography>
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
              Topik
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
              // canOpenScreening={canOpenScreening}
              // canOpenRetrieval={canOpenRetrieval}
              // canOpenClassification={canOpenClassification}
              // canOpenExtraction={canOpenExtraction}
              // canOpenReport={canOpenReport}
              canOpenScreening={true}
              canOpenRetrieval={true}
              canOpenClassification={true}
              canOpenExtraction={true}
              canOpenReport={true}
              classificationMode={classificationMode}
              onClassificationModeChange={setClassificationMode}
              extractionMode={extractionMode}
              onExtractionModeChange={setExtractionMode}
              onStepClick={(step) => {
                // if (step === 1 && !canOpenScreening) return;
                // if (step === 2 && !canOpenRetrieval) return;
                // if (step === 3 && !canOpenClassification) return;
                // if (step === 4 && !canOpenExtraction) return;
                // if (step === 5 && !canOpenReport) return;

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
                <Screening researchPlanId={researchPlanId} />
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
    </>
  );
}
