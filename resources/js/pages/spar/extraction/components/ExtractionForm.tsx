import {
  Box,
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

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <TextField
      label={label}
      value={value}
      fullWidth
      multiline
      minRows={4}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Enter ${label.toLowerCase()}...`}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          bgcolor: '#ffffff',
        },
        '& .MuiInputBase-input': { fontSize: 13 },
        '& .MuiInputLabel-root': {
          fontSize: 13,
        },
      }}
    />
  );
}

export default function ExtractionForm({ values, onChange }: Props) {
  const fields: Array<{ label: string; key: keyof ExtractionFormValues }> = [
    { label: 'Abstract', key: 'abstract' },
    { label: 'Introduction', key: 'introduction' },
    { label: 'Result', key: 'result' },
    { label: 'Conclusion', key: 'conclusion' },
    { label: 'Recommendation', key: 'recommendation' },
    { label: 'Novelty Gap', key: 'noveltyGap' },
    { label: 'Limitation', key: 'limitation' },
    { label: 'Future Research', key: 'futureResearch' },
  ];

  return (
    <Box
      sx={{
        p: 2.5,
        overflowY: 'auto',
        borderRight: '1px solid #e5e7eb',
        display: 'grid',
        gap: 1.75,
        alignContent: 'start',

        '&::-webkit-scrollbar': {
          width: 8,
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#cbd5e1',
          borderRadius: 999,
        },
      }}
    >
      <Typography sx={{ fontWeight: 900, fontSize: 16 }}>Extraction Fields</Typography>
      <Typography sx={{ color: '#64748b', fontSize: 12.5, mb: 0.5 }}>
        Struktur form disamakan dengan AI Extraction.
      </Typography>

      {fields.map((field) => (
        <Box key={field.key}>
          <Field
            label={field.label}
            value={values[field.key] as string}
            onChange={(v) => onChange(field.key, v as ExtractionFormValues[typeof field.key])}
          />
        </Box>
      ))}
    </Box>
  );
}
