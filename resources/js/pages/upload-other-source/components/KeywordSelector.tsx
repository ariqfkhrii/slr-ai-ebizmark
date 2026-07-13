'use client';

import { Autocomplete, TextField } from '@mui/material';

import { useResearchPlanKeywords } from '../hooks/useResearchPlanKeywords';

interface Props {
  researchPlanId: number;
  value: string;
  disabled?: boolean;
  onChange: (keywordId: string) => void;
}

export default function KeywordSelector({
  researchPlanId,
  value,
  disabled,
  onChange,
}: Props) {
  const { data = [], isLoading } = useResearchPlanKeywords(researchPlanId);

  return (
    <Autocomplete
      options={data}
      loading={isLoading}
      loadingText="Memuat kata kunci..."
      noOptionsText="Tidak ada kata kunci"
      disabled={disabled}
      getOptionLabel={(option) => option.keyword}
      value={data.find((item) => String(item.id) === value) ?? null}
      onChange={(_, option) => onChange(option ? String(option.id) : '')}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Kata Kunci Topik SLR"
          helperText="Pilih kata kunci topik SLR."
        />
      )}
    />
  );
}
