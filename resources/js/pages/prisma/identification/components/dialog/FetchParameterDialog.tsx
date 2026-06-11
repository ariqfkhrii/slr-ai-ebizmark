import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Menu,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { MetadataPreviewResult } from '../../hooks/useIdentification';
import { Keyword } from '../../types';
import FetchPreviewDialog from './FetchPreviewDialog';

export type FetchParams = {
  yearFrom: number;
  yearTo: number;
  tiers: string[];
  includeAbstract: boolean;
};

type Props = {
  researchPlanId: number;
  keyword: Keyword;
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (params: FetchParams) => void;
  onPreviewMetadata: (
    keywordId: number,
    params: FetchParams,
  ) => Promise<MetadataPreviewResult>;
  sourceDatabase: string;
};

export default function FetchParameterDialog({
  anchorEl,
  open,
  onClose,
  onSubmit,
  sourceDatabase,
  keyword,
  researchPlanId,
  onPreviewMetadata,
}: Props) {
  const [yearFrom, setYearFrom] = useState(2019);
  const [yearTo, setYearTo] = useState(2024);
  const [tiers, setTiers] = useState<string[]>(['Q1', 'Q2']);
  const [includeAbstract, setIncludeAbstract] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pendingParams, setPendingParams] = useState<FetchParams | null>(null);
  const isScopus = sourceDatabase === 'scopus';
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [previewResult, setPreviewResult] =
    useState<MetadataPreviewResult | null>(null);

  const toggleTier = (tier: string) => {
    setTiers((prev) =>
      prev.includes(tier)
        ? prev.filter((item) => item !== tier)
        : [...prev, tier],
    );
  };

  const handleSubmit = async () => {
    const params = {
      yearFrom,
      yearTo,
      tiers: isScopus ? tiers : [],
      includeAbstract,
    };

    setPendingParams(params);
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError('');
    setPreviewResult(null);

    try {
      const result = await onPreviewMetadata(keyword.id, params);
      setPreviewResult(result);
    } catch (err: any) {
      setPreviewError(err?.message ?? 'Gagal mengambil preview metadata');
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <>
      <FetchPreviewDialog
        open={previewOpen}
        loading={previewLoading}
        error={previewError}
        preview={previewResult}
        sourceDatabase={sourceDatabase}
        keyword={keyword}
        onClose={() => setPreviewOpen(false)}
        onConfirm={() => {
          if (!pendingParams) return;

          onSubmit(pendingParams);
          setPreviewOpen(false);
          onClose();
        }}
      />
      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              width: 280,
              p: 2,
              borderRadius: 2,
            },
          },
        }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 800, mb: 2 }}>
          Parameter Fetch
        </Typography>

        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 800,
            color: 'text.secondary',
            mb: 0.75,
          }}
        >
          RENTANG TAHUN
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1.5,
          }}
        >
          <TextField
            size="small"
            type="number"
            value={yearFrom}
            onChange={(e) => setYearFrom(Number(e.target.value))}
            sx={{ width: 80 }}
          />
          <Typography color="text.secondary">–</Typography>
          <TextField
            size="small"
            type="number"
            value={yearTo}
            onChange={(e) => setYearTo(Number(e.target.value))}
            sx={{ width: 80 }}
          />
        </Box>

        {isScopus && (
          <>
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 800,
                color: 'text.secondary',
                mb: 0.75,
              }}
            >
              TIER JURNAL
            </Typography>

            <Stack
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 0.5,
                mb: 1.5,
              }}
            >
              {['Q1', 'Q2', 'Q3', 'Q4'].map((tier) => (
                <FormControlLabel
                  key={tier}
                  control={
                    <Checkbox
                      size="small"
                      checked={tiers.includes(tier)}
                      onChange={() => toggleTier(tier)}
                    />
                  }
                  label={tier}
                  sx={{
                    m: 0,
                    '& .MuiFormControlLabel-label': {
                      fontSize: 11,
                      fontWeight: 700,
                    },
                  }}
                />
              ))}
            </Stack>
          </>
        )}

        <Button
          fullWidth
          variant="contained"
          size="small"
          onClick={handleSubmit}
          disabled={(isScopus && tiers.length === 0) || yearFrom > yearTo}
          sx={{
            textTransform: 'none',
            fontSize: 12,
            fontWeight: 700,
            py: 0.8,
          }}
        >
          Mulai Fetch
        </Button>
      </Menu>
    </>
  );
}
