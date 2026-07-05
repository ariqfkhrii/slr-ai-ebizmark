import { AutoAwesome, Science } from '@mui/icons-material';
import {
  Box,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#0F172A',
        color: '#FFFFFF',
        py: 6,
        mt: 4,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={4} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h4"
              sx={{
                mb: 1,
                fontWeight: 700,
              }}
            >
              SLR AI Ebizmark
            </Typography>

            <Typography
              sx={{
                color: 'rgba(255,255,255,.72)',
                maxWidth: 700,
              }}
            >
              Platform Systematic Literature Review berbasis AI yang dibangun di
              atas kerangka SPAR-4-SLR dan pedoman PRISMA untuk mendukung
              penelitian yang efisien, transparan, dan dapat direproduksi.
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Chip
              icon={<Science />}
              label="SPAR-4-SLR"
              variant="outlined"
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,.25)',

                '& .MuiChip-icon': {
                  color: 'white',
                },
              }}
            />

            <Chip
              icon={<Science />}
              label="PRISMA"
              variant="outlined"
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,.25)',

                '& .MuiChip-icon': {
                  color: 'white',
                },
              }}
            />

            <Chip
              icon={<AutoAwesome />}
              label="Kecerdasan Buatan"
              variant="outlined"
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,.25)',

                '& .MuiChip-icon': {
                  color: 'white',
                },
              }}
            />
          </Stack>

          <Divider
            sx={{
              width: '100%',
              borderColor: 'rgba(255,255,255,.12)',
            }}
          />

          <Stack spacing={1} sx={{ direction: 'column', alignItems: 'center' }}>
            <Typography
              sx={{
                color: 'rgba(255,255,255,.65)',
              }}
            >
              Made with ❤️ by KoTA 104 Politeknik Negeri Bandung
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
