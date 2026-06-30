import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Box, Button, Chip, Paper, TextField, Typography } from '@mui/material';
import { ClassificationCategory } from '../types';

type Props = {
  categories: ClassificationCategory[];
  activeCategories: ClassificationCategory[];
  theory: string;
  onUpdateCategory: (id: number, name: string) => void;
  onUpdateTheory: (value: string) => void;
  onSaveSetup: () => void;
  onRunAi: () => void;
};

export default function AiClassificationSetup({
  categories,
  activeCategories,
  theory,
  onUpdateCategory,
  onUpdateTheory,
  onSaveSetup,
  onRunAi,
}: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        minHeight: 0,
        borderRadius: 4,
        border: '1px solid #e5e7eb',
        bgcolor: '#ffffff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)',
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #eef2f7',
          background:
            'linear-gradient(135deg, rgba(37,99,235,.08), rgba(20,184,166,.08))',
        }}
      >
        <Typography sx={{ fontSize: 18, fontWeight: 900 }}>
          AI Classification Setup
        </Typography>

        <Typography sx={{ mt: 0.5, fontSize: 12, color: '#64748b' }}>
          Tentukan hingga 6 kategori sebelum AI mengklasifikasi artikel yang
          sudah berhasil di-retrieve.
        </Typography>

        <Chip
          size="small"
          label={`${activeCategories.length}/6 kategori aktif`}
          sx={{
            mt: 1.5,
            fontSize: 11,
            fontWeight: 800,
            bgcolor: '#eff6ff',
            color: '#2563eb',
          }}
        />
      </Box>

      <Box
        sx={{
          p: 2,
          flex: 1,
          overflowY: 'auto',

          '&::-webkit-scrollbar': {
            width: 8,
          },
          '&::-webkit-scrollbar-track': {
            background: '#f8fafc',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#cbd5e1',
            borderRadius: 999,
            border: '2px solid #f8fafc',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {categories.map((category) => {
            const filled = Boolean(category.name.trim());

            return (
              <Paper
                key={category.id}
                variant="outlined"
                sx={{
                  p: 1.25,
                  borderRadius: 3,
                  borderColor: filled ? 'rgba(37,99,235,.35)' : '#e5e7eb',
                  bgcolor: filled ? '#f8fbff' : '#ffffff',
                  transition: 'all .18s ease',
                  '&:hover': {
                    borderColor: '#93c5fd',
                    boxShadow: '0 8px 18px rgba(15,23,42,.06)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 900,
                      bgcolor: filled ? '#2563eb' : '#f1f5f9',
                      color: filled ? '#ffffff' : '#94a3b8',
                      flexShrink: 0,
                    }}
                  >
                    {category.id}
                  </Box>

                  <TextField
                    size="small"
                    fullWidth
                    value={category.name}
                    placeholder={`Category ${category.id}`}
                    onChange={(e) =>
                      onUpdateCategory(category.id, e.target.value)
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#ffffff',
                      },
                      '& .MuiInputBase-input': {
                        fontSize: 13,
                        fontWeight: 700,
                      },
                    }}
                  />
                </Box>
              </Paper>
            );
          })}
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography
            sx={{ mb: 1, fontSize: 12, fontWeight: 800, color: '#475569' }}
          >
            Theory
          </Typography>

          <TextField
            fullWidth
            multiline
            minRows={3}
            value={theory}
            placeholder="Add theory or notes..."
            onChange={(e) => onUpdateTheory(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: '#ffffff',
              },
              '& .MuiInputBase-input': {
                fontSize: 13,
                lineHeight: 1.6,
              },
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          p: 2,
          borderTop: '1px solid #eef2f7',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Button
          fullWidth
          variant="contained"
          startIcon={<AutoAwesomeIcon fontSize="small" />}
          onClick={onSaveSetup}
          sx={{
            py: 1,
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 900,
            bgcolor: '#2563eb',
            boxShadow: '0 10px 20px rgba(37,99,235,.22)',
            '&:hover': {
              bgcolor: '#1d4ed8',
              boxShadow: '0 12px 24px rgba(37,99,235,.28)',
            },
          }}
        >
          Save Setup
        </Button>

        <Button
          fullWidth
          variant="outlined"
          onClick={onRunAi}
          sx={{
            py: 1,
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 900,
            borderColor: '#1d4ed8',
            color: '#1d4ed8',
            '&:hover': {
              borderColor: '#1e40af',
              bgcolor: '#eff6ff',
            },
          }}
        >
          AI Classification
        </Button>
      </Box>
    </Paper>
  );
}
