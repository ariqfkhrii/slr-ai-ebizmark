import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Menu,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

export type FetchParams = {
  yearFrom: number;
  yearTo: number;
  tiers: string[];
  includeAbstract: boolean;
};

type Props = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (params: FetchParams) => void;
};

export default function FetchParameterDialog({
  anchorEl,
  open,
  onClose,
  onSubmit,
}: Props) {
  const [yearFrom, setYearFrom] = useState(2019);
  const [yearTo, setYearTo] = useState(2024);
  const [tiers, setTiers] = useState<string[]>(['Q1', 'Q2']);
  const [includeAbstract, setIncludeAbstract] = useState(false);

  const toggleTier = (tier: string) => {
    setTiers((prev) =>
      prev.includes(tier)
        ? prev.filter((item) => item !== tier)
        : [...prev, tier],
    );
  };

  const handleSubmit = () => {
    onSubmit({
      yearFrom,
      yearTo,
      tiers,
      includeAbstract,
    });
  };

  return (
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

      <Stack direction="row" spacing={0.5} sx={{ mb: 1.5 }}>
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

      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 800,
          color: 'text.secondary',
          mb: 0.75,
        }}
      >
        OPSI
      </Typography>

      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={includeAbstract}
            onChange={(e) => setIncludeAbstract(e.target.checked)}
          />
        }
        label="Include Abstract"
        sx={{
          mb: 2,
          '& .MuiFormControlLabel-label': {
            fontSize: 12,
            fontWeight: 600,
          },
        }}
      />

      <Button
        fullWidth
        variant="contained"
        size="small"
        onClick={handleSubmit}
        disabled={tiers.length === 0 || yearFrom > yearTo}
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
  );
}
