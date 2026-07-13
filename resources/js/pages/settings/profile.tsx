import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { Form, Head, usePage } from '@inertiajs/react';

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowLeft, User } from 'lucide-react';

export default function Profile() {
  const { auth } = usePage().props as any;

  return (
    <>
      <Head title="Profil Saya" />

      <Box
        sx={{
          minHeight: '100%',
          px: 3,
          py: 4,
          bgcolor: '#f5f7fb',
        }}
      >
        {/* Back Button */}
        <Button
          component="a"
          href="/dashboard"
          startIcon={<ArrowLeft size={18} />}
          variant="text"
          sx={{
            mb: 4,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Kembali
        </Button>

        {/* Center Content */}
        <Stack
          spacing={3}
          sx={{
            maxWidth: 700,
            mx: 'auto',
          }}
        >
          <Card elevation={3}>
            <CardContent sx={{ p: 4 }}>
              <Stack
                direction="row"
                spacing={3}
                sx={{ mb: 4, alignItems: 'center' }}
              >
                <Avatar
                  sx={{
                    width: 72,
                    height: 72,
                    bgcolor: 'primary.main',
                  }}
                >
                  <User size={34} />
                </Avatar>

                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {auth.user.name}
                  </Typography>

                  <Typography color="text.secondary">
                    {auth.user.email}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ mb: 4 }} />

              <Form
                {...ProfileController.update.form()}
                options={{
                  preserveScroll: true,
                }}
              >
                {({ processing, errors }) => (
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Nama Lengkap"
                      name="name"
                      defaultValue={auth.user.name}
                      error={!!errors.name}
                      helperText={errors.name}
                    />

                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      name="email"
                      defaultValue={auth.user.email}
                      error={!!errors.email}
                      helperText={errors.email}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={processing}
                        sx={{
                          px: 4,
                          py: 1.2,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </Button>
                    </Box>
                  </Stack>
                )}
              </Form>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </>
  );
}
