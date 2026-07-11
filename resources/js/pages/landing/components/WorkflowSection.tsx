import {
  ArrowForward,
  AutoAwesome,
  CleaningServices,
  Description,
  Psychology,
  Search,
} from '@mui/icons-material';
import { Box, Card, Chip, Container, Stack, Typography } from '@mui/material';

const workflow = [
  {
    icon: <Search color="primary" />,
    title: 'Acquisition',
    description:
      'Mengumpulkan publikasi dari perpustakaan digital dan basis data akademik.',
  },
  {
    icon: <CleaningServices color="primary" />,
    title: 'Purification',
    description: 'Menghapus duplikat dan menstandarisasi metadata.',
  },
  {
    icon: <Psychology color="primary" />,
    title: 'Classification',
    description:
      'Penyaringan berbantuan AI menggunakan semantic similarity dengan BERT.',
  },
  {
    icon: <Description color="primary" />,
    title: 'Extraction',
    description: 'Mengekstrak variabel penelitian dari studi yang terpilih.',
  },
  {
    icon: <AutoAwesome color="primary" />,
    title: 'Reporting',
    description: 'Menghasilkan laporan SLR terstruktur berdasarkan PRISMA.',
  },
];

export default function WorkflowSection() {
  return (
    <Box
      sx={{
        py: 10,
        bgcolor: '#FFFFFF',
      }}
    >
      <Container maxWidth="xl">
        <Stack
          spacing={2}
          sx={{
            mb: 8,
            alignItems: 'center',
          }}
        >
          <Chip label="Alur Kerja SPAR-4-SLR" color="primary" />

          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
            }}
          >
            Proses Literatur Review End-to-End
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: 820,
              textAlign: 'center',
            }}
          >
            SLR AI Ebizmark memandu peneliti melalui setiap tahap Systematic
            Literature Review mengikuti kerangka SPAR-4-SLR sambil mendukung
            pelaporan PRISMA dengan Kecerdasan Buatan.
          </Typography>
        </Stack>

        <Stack
          direction="row"
          sx={{
            justifyContent: 'center',
            alignItems: 'stretch',
            flexWrap: 'wrap',
          }}
          spacing={2}
        >
          {workflow.map((step, index) => (
            <Stack
              key={step.title}
              direction="row"
              sx={{
                alignItems: 'center',
              }}
            >
              <Card
                elevation={0}
                sx={{
                  width: 210,
                  height: '100%',
                  minHeight: 280,
                  p: 4,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: '.25s',
                  display: 'flex',
                  flexDirection: 'column',

                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: 8,
                  },
                }}
              >
                <Stack
                  spacing={3}
                  sx={{
                    alignItems: 'center',
                    flex: 1,
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      bgcolor: 'primary.50',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {step.icon}
                  </Box>

                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {step.title}
                  </Typography>

                  <Typography
                    align="center"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.8,
                    }}
                  >
                    {step.description}
                  </Typography>
                </Stack>
              </Card>

              {index !== workflow.length - 1 && (
                <ArrowForward
                  color="disabled"
                  sx={{
                    mx: 1,
                    fontSize: 34,
                    alignSelf: 'center',
                  }}
                />
              )}
            </Stack>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
