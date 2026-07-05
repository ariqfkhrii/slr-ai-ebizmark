import { AutoAwesome, Checklist, Science } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';

const highlights = [
  {
    icon: <Science color="primary" fontSize="large" />,
    title: 'Kerangka SPAR-4-SLR',
    description:
      'Mengimplementasikan alur kerja terstruktur yang mencakup akuisisi, purifikasi, klasifikasi, ekstraksi, dan pelaporan.',
  },
  {
    icon: <Checklist color="primary" fontSize="large" />,
    title: 'Pedoman PRISMA',
    description:
      'Mendukung pelaporan yang transparan dan dapat direproduksi sesuai rekomendasi PRISMA.',
  },
  {
    icon: <AutoAwesome color="primary" fontSize="large" />,
    title: 'Kecerdasan Buatan',
    description:
      'Memanfaatkan semantic similarity dan otomatisasi cerdas untuk membantu peneliti selama proses review.',
  },
];

export default function AboutSection() {
  return (
    <Box
      sx={{
        py: 10,
        bgcolor: '#F8FAFC',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          spacing={2}
          sx={{
            mb: 7,
            alignItems: 'center',
          }}
        >
          <Chip label="Tentang" color="primary" />

          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Platform Penelitian untuk Literatur Review Modern
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              textAlign: 'center',
              maxWidth: 900,
            }}
          >
            SLR AI Ebizmark menggabungkan kerangka penelitian yang mapan dengan
            Kecerdasan Buatan untuk menyederhanakan dan mempercepat kegiatan
            Systematic Literature Review dari akuisisi literatur hingga
            pelaporan yang sesuai dengan PRISMA.
          </Typography>
        </Stack>

        <Grid container spacing={4}>
          {highlights.map((item) => (
            <Grid
              key={item.title}
              size={{
                xs: 4,
              }}
            >
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <CardContent
                  sx={{
                    p: 4,
                  }}
                >
                  <Stack spacing={3}>
                    {item.icon}

                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {item.title}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.8,
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
