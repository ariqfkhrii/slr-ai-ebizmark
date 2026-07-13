import { Form, Head, Link } from '@inertiajs/react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowLeft, Lock, Mail } from 'lucide-react';

import { register } from '@/routes';
import { store } from '@/routes/login';

type Props = {
  status?: string;
  canResetPassword: boolean;
  canRegister: boolean;
};

export default function Login({
  status,
  canRegister,
  canResetPassword,
}: Props) {
  return (
    <>
      <Head title="Login" />

      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '1.2fr 0.8fr',
          },
        }}
      >
        <Button
          href="/"
          startIcon={<ArrowLeft size={18} />}
          variant="contained"
          color="inherit"
          sx={{
            position: 'fixed',
            top: 24,
            left: 24,
            bgcolor: 'rgba(255,255,255,0.95)',
            color: 'primary.main',
            borderRadius: 3,
            px: 2,
            boxShadow: 3,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              bgcolor: 'common.white',
            },
          }}
        >
          Beranda
        </Button>
        {/* LEFT */}
        <Box
          sx={{
            display: {
              xs: 'none',
              md: 'flex',
            },
            flexDirection: 'column',
            justifyContent: 'center',
            px: 10,
            color: 'white',
            background:
              'linear-gradient(135deg,#1565C0 0%,#1E88E5 40%,#42A5F5 100%)',
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            SLR AI
          </Typography>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 300,
              mb: 4,
            }}
          >
            Ebizmark
          </Typography>

          <Typography
            variant="h5"
            sx={{
              maxWidth: 480,
              fontWeight: 600,
            }}
          >
            Platform Systematic Literature Review Berbasis AI
          </Typography>

          <Typography
            sx={{
              mt: 2,
              opacity: 0.85,
              maxWidth: 500,
            }}
          >
            Kelola proses Systematic Literature Review mulai dari pencarian
            artikel, penyaringan, klasifikasi, ekstraksi data, hingga penyusunan
            laporan dalam satu platform terintegrasi.
          </Typography>
        </Box>

        {/* RIGHT */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 4,
            bgcolor: '#f5f7fb',
          }}
        >
          <Card
            elevation={6}
            sx={{
              width: '100%',
              maxWidth: 450,
              borderRadius: 4,
            }}
          >
            <CardContent sx={{ p: 5 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
                Selamat Datang!
              </Typography>

              <Typography color="text.secondary" sx={{ mb: 4 }}>
                Masuk untuk menggunakan <b>SLR AI Ebizmark</b>.
              </Typography>

              <Form {...store.form()} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      name="email"
                      label="Email"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email}
                      sx={{
                        '& input:-webkit-autofill': {
                          WebkitBoxShadow: '0 0 0 100px #fff inset',
                          WebkitTextFillColor: '#000',
                          caretColor: '#000',
                          transition: 'background-color 9999s ease-in-out 0s',
                        },
                        '& input:-webkit-autofill:hover': {
                          WebkitBoxShadow: '0 0 0 100px #fff inset',
                        },
                        '& input:-webkit-autofill:focus': {
                          WebkitBoxShadow: '0 0 0 100px #fff inset',
                        },
                      }}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Mail size={18} />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      error={!!errors.password}
                      helperText={errors.password}
                      sx={{
                        '& input:-webkit-autofill': {
                          WebkitBoxShadow: '0 0 0 100px #fff inset',
                          WebkitTextFillColor: '#000',
                          caretColor: '#000',
                          transition: 'background-color 9999s ease-in-out 0s',
                        },
                        '& input:-webkit-autofill:hover': {
                          WebkitBoxShadow: '0 0 0 100px #fff inset',
                        },
                        '& input:-webkit-autofill:focus': {
                          WebkitBoxShadow: '0 0 0 100px #fff inset',
                        },
                      }}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock size={18} />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <FormControlLabel
                        control={<Checkbox name="remember" />}
                        label="Tetap masuk"
                      />

                      {/* {canResetPassword && (
                        <Link
                          href={request()}
                          style={{
                            textDecoration: 'none',
                            color: '#1976d2',
                            fontWeight: 500,
                          }}
                        >
                          Lupa password?
                        </Link>
                      )} */}
                    </Box>

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={processing}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 700,
                      }}
                    >
                      {processing ? 'Signing in...' : 'Sign In'}
                    </Button>

                    {canRegister && (
                      <Typography
                        sx={{ textAlign: 'center' }}
                        color="text.secondary"
                      >
                        Belum memiliki akun?{' '}
                        <Link
                          href={register()}
                          style={{
                            color: '#1976d2',
                            textDecoration: 'underline',
                            textUnderlineOffset: '3px',
                            fontWeight: 600,
                          }}
                        >
                          Buat Akun
                        </Link>
                      </Typography>
                    )}

                    {status && (
                      <Typography
                        color="success.main"
                        sx={{ textAlign: 'center' }}
                      >
                        {status}
                      </Typography>
                    )}
                  </Stack>
                )}
              </Form>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
}
