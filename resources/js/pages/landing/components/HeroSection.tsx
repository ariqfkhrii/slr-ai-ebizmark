import { usePage } from '@inertiajs/react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Chip, Stack, Typography } from '@mui/material';

type SharedProps = {
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
    } | null;
  };
};

const technologies = [
  'SPAR-4-SLR',
  'PRISMA',
  'BERT',
  'Semantic Similarity',
  'Klasifikasi AI',
];

const workflow = [
  {
    title: 'Akuisisi',
    icon: <SearchIcon color="primary" />,
    completed: true,
  },
  {
    title: 'Purifikasi',
    icon: <CheckCircleIcon color="success" />,
    completed: true,
  },
  {
    title: 'Klasifikasi',
    icon: <PsychologyIcon color="primary" />,
    completed: true,
  },
  {
    title: 'Ekstraksi',
    icon: <DescriptionIcon color="disabled" />,
    completed: false,
  },
  {
    title: 'Pelaporan',
    icon: <AutoAwesomeIcon color="disabled" />,
    completed: false,
  },
];

export default function HeroSection() {
  const { auth } = usePage<SharedProps>().props;

  const isLoggedIn = !!auth.user;

  return (
    <Box
      sx={{
        maxWidth: 1280,
        mx: 'auto',
        px: 4,
        py: 10,
      }}
    >
      <Stack
        direction="row"
        spacing={8}
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            flex: 1,
            maxWidth: 800,
            textAlign: 'center',
          }}
        >
          <Typography
            color="primary"
            gutterBottom
            sx={{
              fontWeight: 700,
            }}
          >
            Systematic Literature Review Berbasis AI
          </Typography>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              lineHeight: 1.15,
              mb: 3,
            }}
          >
            SLR AI
            <br />
            Ebizmark
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              lineHeight: 1.8,
              maxWidth: 650,
              mx: 'auto',
            }}
          >
            Percepat Systematic Literature Review Anda menggunakan Kecerdasan
            Buatan dengan kerangka SPAR-4-SLR dan pedoman PRISMA. Otomatiskan
            akuisisi literatur, screening, klasifikasi, ekstraksi, dan pelaporan
            melalui platform penelitian terintegrasi.
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{
              mt: 4,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {technologies.map((item) => (
              <Chip
                key={item}
                label={item}
                variant="outlined"
                color="primary"
              />
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
