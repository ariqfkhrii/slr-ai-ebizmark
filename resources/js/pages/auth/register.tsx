import { Form, Head, Link } from '@inertiajs/react';
import {
  Box,
  Button,
  Card,
  CardContent,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowLeft, Mail, User } from 'lucide-react';

import PasswordInput from '@/components/password-input';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
  return (
    <>
      <Head title="Daftar" />

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
        {/* Left Panel */}
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

        {/* Right Panel */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: '#f5f7fb',
            p: 4,
          }}
        >
          <Card
            elevation={6}
            sx={{
              width: '100%',
              maxWidth: 500,
              borderRadius: 4,
            }}
          >
            <CardContent sx={{ p: 5 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                }}
              >
                Buat Akun
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 1,
                  mb: 4,
                }}
              >
                Lengkapi data berikut untuk mulai menggunakan{' '}
                <b>SLR AI Ebizmark</b>.
              </Typography>

              <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
              >
                {({ processing, errors }) => (
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Nama Lengkap"
                      name="name"
                      autoFocus
                      error={!!errors.name}
                      helperText={errors.name}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <User size={18} />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      name="email"
                      error={!!errors.email}
                      helperText={errors.email}
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

                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 1,
                          fontWeight: 500,
                        }}
                      >
                        Kata Sandi
                      </Typography>

                      <PasswordInput
                        id="password"
                        name="password"
                        autoComplete="new-password"
                        placeholder="Masukkan kata sandi"
                      />

                      {errors.password && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5 }}
                        >
                          {errors.password}
                        </Typography>
                      )}
                    </Box>

                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 1,
                          fontWeight: 500,
                        }}
                      >
                        Konfirmasi Kata Sandi
                      </Typography>

                      <PasswordInput
                        id="password_confirmation"
                        name="password_confirmation"
                        autoComplete="new-password"
                        placeholder="Ulangi kata sandi"
                      />

                      {errors.password_confirmation && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5 }}
                        >
                          {errors.password_confirmation}
                        </Typography>
                      )}
                    </Box>

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={processing}
                      sx={{
                        mt: 1,
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 700,
                        textTransform: 'none',
                      }}
                    >
                      {processing ? 'Mendaftarkan...' : 'Daftar'}
                    </Button>

                    <Typography
                      color="text.secondary"
                      sx={{
                        textAlign: 'center',
                      }}
                    >
                      Sudah memiliki akun?{' '}
                      <Link
                        href={login()}
                        style={{
                          color: '#1976d2',
                          textDecoration: 'underline',
                          textUnderlineOffset: '3px',
                          fontWeight: 600,
                        }}
                      >
                        Masuk
                      </Link>
                    </Typography>
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
