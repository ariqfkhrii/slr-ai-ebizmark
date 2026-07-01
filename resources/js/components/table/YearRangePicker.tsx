import {
  Box,
  InputAdornment,
  Popover,
  TextField,
  Typography,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import dayjs from 'dayjs';
import { Calendar, X } from 'lucide-react';
import { useState } from 'react';

type YearRangePickerProps = {
  yearFrom?: number;
  yearTo?: number;
  onYearFromChange: (year?: number) => void;
  onYearToChange: (year?: number) => void;
  onPageReset?: () => void;
};

const scrollbarSx = {
  '&::-webkit-scrollbar': {
    width: 8,
    height: 8,
  },
  '&::-webkit-scrollbar-track': {
    background: '#f8fafc',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#cbd5e1',
    borderRadius: 999,
    border: '2px solid #f8fafc',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#94a3b8',
  },
};

export default function YearRangePicker({
  yearFrom,
  yearTo,
  onYearFromChange,
  onYearToChange,
  onPageReset,
}: YearRangePickerProps) {
  const [anchorElFrom, setAnchorElFrom] = useState<HTMLElement | null>(null);
  const [anchorElTo, setAnchorElTo] = useState<HTMLElement | null>(null);

  const getDisplayValue = (value: number | undefined) => {
    return value ? dayjs().year(value).format('YYYY') : '';
  };

  const hasYearFrom = Boolean(yearFrom);
  const hasYearTo = Boolean(yearTo);

  const handleYearFromChange = (value: number) => {
    onYearFromChange(value);
    if (onPageReset) onPageReset();
    setAnchorElFrom(null);
  };

  const handleYearToChange = (value: number) => {
    onYearToChange(value);
    if (onPageReset) onPageReset();
    setAnchorElTo(null);
  };

  const handleClearYearFrom = () => {
    onYearFromChange(undefined);
    if (onPageReset) onPageReset();
  };

  const handleClearYearTo = () => {
    onYearToChange(undefined);
    if (onPageReset) onPageReset();
  };

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {/* Dari tahun */}
      <TextField
        size="small"
        placeholder="Dari tahun"
        value={getDisplayValue(yearFrom)}
        onClick={(e) => {
          if (!hasYearFrom) {
            setAnchorElFrom(e.currentTarget);
          }
        }}
        sx={{
          width: 160,
          '& .MuiOutlinedInput-root': {
            cursor: 'pointer',
            height: 32,
            fontSize: 12,
          },
          '& .MuiInputBase-input': {
            cursor: 'pointer',
            caretColor: 'transparent',
            fontSize: 12,
            py: 0,
          },
        }}
        slotProps={{
          input: {
            readOnly: true,
            tabIndex: -1,
            startAdornment: (
              <InputAdornment position="start">
                <Calendar size="1.1rem" />
              </InputAdornment>
            ),
            endAdornment: hasYearFrom && (
              <InputAdornment
                position="end"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearYearFrom();
                }}
                sx={{ cursor: 'pointer' }}
              >
                <X size="1rem" />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Sampai tahun */}
      <TextField
        size="small"
        placeholder="Sampai tahun"
        value={getDisplayValue(yearTo)}
        onClick={(e) => {
          if (!hasYearTo && yearFrom) {
            setAnchorElTo(e.currentTarget);
          }
        }}
        sx={{
          width: 160,
          '& .MuiOutlinedInput-root': {
            cursor: 'pointer',
            height: 32,
            fontSize: 12,
          },
          '& .MuiInputBase-input': {
            cursor: 'pointer',
            caretColor: 'transparent',
            fontSize: 12,
            py: 0,
          },
        }}
        slotProps={{
          input: {
            readOnly: true,
            tabIndex: -1,
            startAdornment: (
              <InputAdornment position="start">
                <Calendar size="1.1rem" />
              </InputAdornment>
            ),
            endAdornment: hasYearTo && (
              <InputAdornment
                position="end"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearYearTo();
                }}
                sx={{ cursor: 'pointer' }}
              >
                <X size="1rem" />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Popover Dari tahun */}
      <Popover
        open={Boolean(anchorElFrom)}
        anchorEl={anchorElFrom}
        onClose={() => setAnchorElFrom(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              ...scrollbarSx,
              maxHeight: 400,
            },
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Pilih tahun
            </Typography>
            <StaticDatePicker
              displayStaticWrapperAs="desktop"
              views={['year']}
              openTo="year"
              value={yearFrom ? dayjs().year(yearFrom) : null}
              onChange={(value) => {
                if (value) {
                  handleYearFromChange(value.year());
                }
              }}
              slotProps={{
                actionBar: {
                  actions: ['clear', 'accept'],
                },
              }}
            />
          </LocalizationProvider>
        </Box>
      </Popover>

      {/* Popover Sampai tahun */}
      <Popover
        open={Boolean(anchorElTo)}
        anchorEl={anchorElTo}
        onClose={() => setAnchorElTo(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              ...scrollbarSx,
              maxHeight: 400,
            },
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Pilih tahun
            </Typography>
            <StaticDatePicker
              displayStaticWrapperAs="desktop"
              views={['year']}
              openTo="year"
              minDate={yearFrom ? dayjs().year(yearFrom) : undefined}
              value={yearTo ? dayjs().year(yearTo) : null}
              onChange={(value) => {
                if (value) {
                  handleYearToChange(value.year());
                }
              }}
              slotProps={{
                actionBar: {
                  actions: ['clear', 'accept'],
                },
              }}
            />
          </LocalizationProvider>
        </Box>
      </Popover>
    </Box>
  );
}
