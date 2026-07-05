import { Link, usePage } from '@inertiajs/react';
import { AppBar, Box, Button, Stack, Toolbar, Typography } from '@mui/material';

type SharedProps = {
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
    } | null;
  };
};

type Props = {
  onNavigate: (id: string) => void;
};

export default function Navbar({ onNavigate }: Props) {
  const { auth } = usePage<SharedProps>().props;

  const isLoggedIn = !!auth.user;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="inherit"
      sx={{
        bgcolor: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar
        sx={{
          maxWidth: '100%',
          width: '100%',
          mx: 'auto',
          py: 1,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            S
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              SLR AI Ebizmark
            </Typography>

            <Typography variant="caption" color="text.secondary">
              PT Ebiz Prima Nusa
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={4} sx={{ alignItems: 'center' }}>
          <Button color="inherit" onClick={() => onNavigate('features')}>
            Fitur
          </Button>

          <Button color="inherit" onClick={() => onNavigate('workflow')}>
            Alur Kerja
          </Button>

          <Button color="inherit" onClick={() => onNavigate('about')}>
            Tentang
          </Button>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          {isLoggedIn ? (
            <Link href={'dashboard'}>
              <Button variant="contained" size="medium">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href={'login'}>
                <Button
                  variant="contained"
                  size="medium"
                  sx={{
                    px: 3,
                    py: 1,
                  }}
                >
                  Masuk
                </Button>
              </Link>

              <Link href={'register'}>
                <Button
                  variant="outlined"
                  size="medium"
                  sx={{
                    px: 3,
                    py: 1,
                  }}
                >
                  Daftar
                </Button>
              </Link>
            </>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
