import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { ExtractionFormValues } from '../types';

type Props = {
  values: ExtractionFormValues;
  onChange: <K extends keyof ExtractionFormValues>(
    key: K,
    value: ExtractionFormValues[K],
  ) => void;
};

const yesNoOptions = ['Yes', 'No', 'N/A'];

function Field({
  label,
  value,
  onChange,
  multiline = false,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
}) {
  return (
    <TextField
      label={label}
      value={value}
      type={type}
      fullWidth
      size="small"
      multiline={multiline}
      minRows={multiline ? 3 : undefined}
      onChange={(e) => onChange(e.target.value)}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          bgcolor: '#ffffff',
        },
        '& .MuiInputBase-input': {
          fontSize: 12,
        },
        '& .MuiInputLabel-root': {
          fontSize: 12,
        },
      }}
    />
  );
}

function SelectField({
  label,
  value,
  onChange,
  options = yesNoOptions,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options?: string[];
}) {
  return (
    <TextField
      select
      label={label}
      value={value}
      fullWidth
      size="small"
      onChange={(e) => onChange(e.target.value)}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          bgcolor: '#ffffff',
        },
        '& .MuiInputBase-input': {
          fontSize: 12,
        },
        '& .MuiInputLabel-root': {
          fontSize: 12,
        },
      }}
    >
      {options.map((item) => (
        <MenuItem key={item} value={item}>
          {item}
        </MenuItem>
      ))}
    </TextField>
  );
}

export default function ExtractionForm({ values, onChange }: Props) {
  return (
    <Box
      sx={{
        p: 2,
        overflowY: 'auto',
        borderRight: '1px solid #e5e7eb',

        '&::-webkit-scrollbar': {
          width: 8,
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#cbd5e1',
          borderRadius: 999,
        },
      }}
    >
      <Accordion defaultExpanded disableGutters elevation={0}>
        <AccordionSummary expandIcon={<ExpandLessIcon />}>
          <Typography sx={{ fontWeight: 900 }}>Extraction Text</Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <Field
              label="Abstract"
              value={values.abstract}
              multiline
              onChange={(v) => onChange('abstract', v)}
            />

            <Field
              label="Introduction"
              value={values.introduction}
              multiline
              onChange={(v) => onChange('introduction', v)}
            />

            <Field
              label="Result"
              value={values.result}
              multiline
              onChange={(v) => onChange('result', v)}
            />

            <Field
              label="Conclusion"
              value={values.conclusion}
              multiline
              onChange={(v) => onChange('conclusion', v)}
            />

            <Field
              label="Recommendation"
              value={values.recommendation}
              multiline
              onChange={(v) => onChange('recommendation', v)}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 1 }} />

      <Accordion defaultExpanded disableGutters elevation={0}>
        <AccordionSummary expandIcon={<ExpandLessIcon />}>
          <Typography sx={{ fontWeight: 900 }}>Informasi Umum</Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1.5,
            }}
          >
            <Field
              label="Received"
              type="date"
              value={values.receivedDate}
              onChange={(v) => onChange('receivedDate', v)}
            />

            <Field
              label="Accepted"
              type="date"
              value={values.acceptedDate}
              onChange={(v) => onChange('acceptedDate', v)}
            />

            <Field
              label="Published"
              type="date"
              value={values.publishedDate}
              onChange={(v) => onChange('publishedDate', v)}
            />

            <Field
              label="Country"
              value={values.country}
              onChange={(v) => onChange('country', v)}
            />

            <Box sx={{ gridColumn: '1 / -1' }}>
              <Field
                label="Context Area"
                value={values.contextArea}
                multiline
                onChange={(v) => onChange('contextArea', v)}
              />
            </Box>

            <Field
              label="Focus On"
              value={values.focusOn}
              onChange={(v) => onChange('focusOn', v)}
            />

            <Field
              label="Research Methods"
              value={values.researchMethod}
              onChange={(v) => onChange('researchMethod', v)}
            />

            <SelectField
              label="Using Stimulus"
              value={values.usingStimulus}
              onChange={(v) => onChange('usingStimulus', v)}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 1 }} />

      <Accordion defaultExpanded disableGutters elevation={0}>
        <AccordionSummary expandIcon={<ExpandLessIcon />}>
          <Typography sx={{ fontWeight: 900 }}>Analysis Information</Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 1.5,
            }}
          >
            <SelectField
              label="Data Collection"
              value={values.dataCollection}
              onChange={(v) => onChange('dataCollection', v)}
            />

            <SelectField
              label="Analysis Methods"
              value={values.analysisMethod}
              onChange={(v) => onChange('analysisMethod', v)}
            />

            <SelectField
              label="Software"
              value={values.software}
              onChange={(v) => onChange('software', v)}
            />

            <SelectField
              label="Research Design"
              value={values.researchDesign}
              onChange={(v) => onChange('researchDesign', v)}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 1 }} />

      <Accordion defaultExpanded disableGutters elevation={0}>
        <AccordionSummary expandIcon={<ExpandLessIcon />}>
          <Typography sx={{ fontWeight: 900 }}>Gaps & Future</Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1.5,
            }}
          >
            <Field
              label="Novelty / Gap"
              value={values.noveltyGap}
              multiline
              onChange={(v) => onChange('noveltyGap', v)}
            />

            <Field
              label="Limitation"
              value={values.limitation}
              multiline
              onChange={(v) => onChange('limitation', v)}
            />

            <Field
              label="Future Research"
              value={values.futureResearch}
              multiline
              onChange={(v) => onChange('futureResearch', v)}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 1 }} />

      <Accordion defaultExpanded disableGutters elevation={0}>
        <AccordionSummary expandIcon={<ExpandLessIcon />}>
          <Typography sx={{ fontWeight: 900 }}>
            Classification & Criteria
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1.5,
            }}
          >
            <Field
              label="Category 1"
              value={values.category1}
              onChange={(v) => onChange('category1', v)}
            />

            <Field
              label="Category 2"
              value={values.category2}
              onChange={(v) => onChange('category2', v)}
            />

            <Field
              label="Category 3"
              value={values.category3}
              onChange={(v) => onChange('category3', v)}
            />

            <Field
              label="Category 4"
              value={values.category4}
              onChange={(v) => onChange('category4', v)}
            />

            <Field
              label="Category 5"
              value={values.category5}
              onChange={(v) => onChange('category5', v)}
            />

            <Field
              label="Category 6"
              value={values.category6}
              onChange={(v) => onChange('category6', v)}
            />

            <SelectField
              label="Theory"
              value={values.theory}
              onChange={(v) => onChange('theory', v)}
            />

            <SelectField
              label="Article Not Relevant"
              value={values.articleNotRelevant}
              onChange={(v) => onChange('articleNotRelevant', v)}
            />

            <SelectField
              label="Article Qualitative"
              value={values.articleQualitative}
              onChange={(v) => onChange('articleQualitative', v)}
            />

            <SelectField
              label="Share Reference"
              value={values.shareReference}
              onChange={(v) => onChange('shareReference', v)}
            />

            <SelectField
              label="No Hypothesis"
              value={values.noHypothesis}
              onChange={(v) => onChange('noHypothesis', v)}
            />
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
