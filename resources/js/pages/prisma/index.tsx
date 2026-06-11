import { Head } from '@inertiajs/react';
import { Box, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import AiClassification from './ai-classification';
import AiExtraction from './ai-extraction';
import Classification from './classification';
import PrismaStepper from './components/PrismaStepper';
import Extraction from './extraction';
import Identification from './identification';
import { useIdentification } from './identification/hooks/useIdentification';
import Retrieval from './retrieval';
import Screening from './screening';
import { useScreening } from './screening/hooks/useScreening';
import { getUniqueArticlesByDoi } from './utils/articles';

export default function Prisma(props: any) {
  const researchPlanId = Number(props?.researchPlan?.research_plan_id ?? 0);
  const identification = useIdentification(researchPlanId);
  const [activeStep, setActiveStep] = useState(0);
  const [classificationMode, setClassificationMode] = useState<'manual' | 'ai'>(
    'ai',
  );
  const [extractionMode, setExtractionMode] = useState<'manual' | 'ai'>('ai');

  const globalArticles = getUniqueArticlesByDoi(identification.keywords);
  const screening = useScreening(globalArticles, researchPlanId);
  const canOpenScreening = globalArticles.length > 0;
  const canOpenRetrieval = screening.counters.included > 0;
  const canOpenClassification = true;
  const canOpenExtraction = true;

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
              canOpenScreening={canOpenScreening}
              canOpenRetrieval={canOpenRetrieval}
              canOpenClassification={canOpenClassification}
              canOpenExtraction={canOpenExtraction}
              classificationMode={classificationMode}
              onClassificationModeChange={setClassificationMode}
              extractionMode={extractionMode}
              onExtractionModeChange={setExtractionMode}
              onStepClick={(step) => {
                if (step === 1 && !canOpenScreening) return;
                if (step === 2 && !canOpenRetrieval) return;
                if (step === 3 && !canOpenClassification) return;
                if (step === 4 && !canOpenExtraction) return;

                setActiveStep(step);
              }}
            />
          </Box>
        </Paper>

        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {activeStep === 0 && (
            <Identification
              {...identification}
              globalArticles={globalArticles}
              sourceDatabase={sourceDatabase}
              researchPlanId={researchPlanId}
            />
          )}

          {activeStep === 1 && <Screening {...screening} />}

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
        </Box>
      </Box>
    </>
  );
}
