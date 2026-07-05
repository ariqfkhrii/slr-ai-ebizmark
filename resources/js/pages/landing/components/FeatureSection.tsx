import {
  AutoAwesome,
  CleaningServices,
  Description,
  Psychology,
  Search,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';

const features = [
  {
    icon: <Search color="primary" fontSize="large" />,
    title: 'Akuisisi Literatur',
    description:
      'Mengumpulkan artikel penelitian dari berbagai basis data akademik sebagai titik awal proses SLR.',
  },
  {
    icon: <CleaningServices color="primary" fontSize="large" />,
    title: 'Purifikasi',
    description:
      'Membersihkan metadata, menghapus duplikat, dan menyiapkan dataset berkualitas tinggi sebelum screening.',
  },
  {
    icon: <Psychology color="primary" fontSize="large" />,
    title: 'Klasifikasi AI',
    description:
      'Memanfaatkan semantic similarity menggunakan embedding BERT untuk mengklasifikasikan publikasi yang relevan secara efisien.',
  },
  {
    icon: <Description color="primary" fontSize="large" />,
    title: 'Ekstraksi Data',
    description:
      'Mengekstrak variabel penelitian dan bukti dari studi primer terpilih dengan bantuan AI.',
  },
  {
    icon: <AutoAwesome color="primary" fontSize="large" />,
    title: 'Pelaporan Otomatis',
    description:
      'Menghasilkan laporan terstruktur mengikuti alur kerja SPAR-4-SLR dan pedoman PRISMA.',
  },
];

export default function FeaturesSection() {
  return (
    <Box
      sx={{
        py: 10,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          spacing={2}
          sx={{
            mb: 6,
            textAlign: 'center',
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Fitur Platform
          </Typography>

          <Typography variant="h6" color="text.secondary">
            Semua yang Anda butuhkan untuk melakukan Systematic Literature
            Review berkualitas tinggi dalam satu platform terintegrasi.
          </Typography>
        </Stack>

        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
              key={feature.title}
            >
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  transition: '.25s',

                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: 8,
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: 4,
                  }}
                >
                  <Box
                    sx={{
                      mb: 3,
                    }}
                  >
                    {feature.icon}
                  </Box>

                  <Typography
                    variant="h5"
                    sx={{
                      mb: 2,
                      fontWeight: 700,
                    }}
                  >
                    {feature.title}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.8,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
