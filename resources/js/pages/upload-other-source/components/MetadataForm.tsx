'use client';

import { Autocomplete, Stack, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';

import { OtherSourceForm } from '../page';
import KeywordSelector from './KeywordSelector';

interface TierOption {
  label: string;
  value: string;
}

interface MetadataFormProps {
  value: OtherSourceForm;
  onChange: (value: OtherSourceForm) => void;
  disabled?: boolean;
  researchPlanId: number;
  tierOptions: TierOption[];
}

export default function MetadataForm({
  value,
  onChange,
  researchPlanId,
  disabled,
  tierOptions,
}: MetadataFormProps) {
  const handleChange =
    (field: keyof OtherSourceForm) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({
        ...value,
        [field]: event.target.value,
      });
    };

  return (
    <Stack spacing={3}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
        }}
      >
        Metadata Artikel
      </Typography>

      <Grid container spacing={2}>
        <Grid size={12}>
          <TextField
            fullWidth
            label="DOI"
            value={value.doi}
            onChange={handleChange('doi')}
          />
        </Grid>

        <Grid size={12}>
          <TextField
            fullWidth
            disabled={disabled}
            label="Judul"
            value={value.title}
            onChange={handleChange('title')}
          />
        </Grid>

        <Grid size={12}>
          <TextField
            fullWidth
            disabled={disabled}
            multiline
            minRows={2}
            label="Author"
            value={value.authors}
            onChange={handleChange('authors')}
          />
        </Grid>

        <Grid size={12}>
          <Autocomplete
            options={tierOptions}
            disabled={disabled}
            value={
              tierOptions.find((item) => item.value === value.tier) ?? null
            }
            getOptionLabel={(option) => option.label}
            onChange={(_, option) =>
              onChange({
                ...value,
                tier: option?.value ?? '',
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tier Artikel"
                helperText="Tier jurnal dari artikel (opsional)."
              />
            )}
          />
        </Grid>

        <Grid size={12}>
          <KeywordSelector
            researchPlanId={researchPlanId}
            value={value.researchPlanKeywordId}
            disabled={disabled}
            onChange={(researchPlanKeywordId) =>
              onChange({
                ...value,
                researchPlanKeywordId,
              })
            }
          />
        </Grid>

        <Grid size={12}>
          <TextField
            fullWidth
            disabled={disabled}
            multiline
            minRows={2}
            label="Kata Kunci Artikel"
            helperText="Kata kunci yang terdapat pada metadata artikel."
            value={value.articleKeyword}
            onChange={handleChange('articleKeyword')}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            disabled={disabled}
            label="Jumlah Sitasi"
            type="number"
            value={value.citationCount}
            onChange={handleChange('citationCount')}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            disabled={disabled}
            label="Tahun Publikasi"
            type="number"
            value={value.publishYear}
            onChange={handleChange('publishYear')}
          />
        </Grid>

        <Grid size={12}>
          <TextField
            fullWidth
            disabled={disabled}
            multiline
            minRows={6}
            label="Abstrak"
            value={value.abstract}
            onChange={handleChange('abstract')}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
