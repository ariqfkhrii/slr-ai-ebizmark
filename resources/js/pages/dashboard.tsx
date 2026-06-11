import { showSuccess } from '@/lib/store/snackbarSlice';
import { router, useForm } from '@inertiajs/react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

export default function Dashboard({ auth, researchPlans = [] }: any) {
  const dispatch = useDispatch();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const { data, setData, post, put, processing, reset, errors } = useForm({
    title: '',
    source_database: 'scopus',
  });

  const isProfileOpen = Boolean(profileAnchorEl);

  const handleOpenProfile = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleCloseProfile = () => {
    setProfileAnchorEl(null);
  };

  const handleOpenCreateModal = () => {
    reset();
    setData({
      title: '',
      source_database: 'scopus',
    });
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    reset();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    post('/research-plans', {
      preserveScroll: true,

      onSuccess: () => {
        dispatch(showSuccess('Research plan berhasil dibuat'));

        reset();
        setShowCreateModal(false);
      },
    });
  };

  const openEditModal = (plan: any) => {
    setSelectedPlan(plan);

    setData({
      title: plan.title ?? '',
      source_database: plan.source_database ?? 'scopus',
    });

    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedPlan(null);
    reset();
  };

  const updatePlan = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlan?.research_plan_id) return;

    put(`/research-plans/${selectedPlan.research_plan_id}`, {
      preserveScroll: true,

      onSuccess: () => {
        dispatch(showSuccess('Research plan berhasil diperbarui'));

        reset();
        setShowEditModal(false);
        setSelectedPlan(null);
      },
    });
  };

  const openDeleteModal = (plan: any) => {
    setSelectedPlan(plan);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedPlan(null);
  };

  const deletePlan = () => {
    if (!selectedPlan?.research_plan_id) return;

    router.delete(`/research-plans/${selectedPlan.research_plan_id}`, {
      preserveScroll: true,

      onSuccess: () => {
        dispatch(showSuccess('Research plan berhasil dihapus'));

        setShowDeleteModal(false);
        setSelectedPlan(null);
      },
    });
  };

  const getArticleInfo = (plan: any) => {
    const sourceDatabase = String(
      plan.source_database ?? 'scopus',
    ).toLowerCase();

    if (sourceDatabase === 'pubmed') {
      return {
        source: 'pubmed',
        label: 'PubMed Articles',
        value: plan.pubmed_quantity ?? 0,
      };
    }

    return {
      source: 'scopus',
      label: 'Scopus Articles',
      value: plan.scopus_quantity ?? 0,
    };
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.100',
        p: { xs: 2, md: 4 },
      }}
    >
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Stack
            spacing={2}
            sx={{
              mb: 3,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'center' },
            }}
          >
            <Box>
              <Stack
                spacing={1}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Research Plans
                </Typography>
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {researchPlans.length} research plan
              </Typography>
            </Box>

            <Stack
              spacing={1.5}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <Button
                onClick={handleOpenProfile}
                variant="outlined"
                color="inherit"
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  px: 1.5,
                  py: 1,
                  minHeight: 48,
                  alignItems: 'center',
                }}
              >
                <Stack
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                    }}
                  >
                    {auth?.user?.name?.charAt(0) ?? 'U'}
                  </Avatar>

                  <Box
                    sx={{
                      display: {
                        xs: 'none',
                        sm: 'flex',
                      },
                      alignItems: 'center',
                      height: 32,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {auth?.user?.name}
                    </Typography>
                  </Box>
                </Stack>
              </Button>

              <Menu
                anchorEl={profileAnchorEl}
                open={isProfileOpen}
                onClose={handleCloseProfile}
                sx={{
                  '& .MuiPaper-root': {
                    width: 240,
                    mt: 1,
                    borderRadius: 3,
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography sx={{ fontWeight: 700 }}>
                    {auth?.user?.name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" noWrap>
                    {auth?.user?.email}
                  </Typography>
                </Box>

                <Divider />

                <MenuItem
                  onClick={() => {
                    window.location.href = '/settings/profile';
                  }}
                >
                  Profile
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    router.post('/logout');
                  }}
                  sx={{ color: 'error.main' }}
                >
                  Logout
                </MenuItem>
              </Menu>

              <Button
                variant="contained"
                onClick={handleOpenCreateModal}
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 2.5,
                }}
              >
                Buat Baru
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {researchPlans.length > 0 ? (
            <Grid container={true} spacing={3}>
              {researchPlans.map((plan: any) => {
                const articleInfo = getArticleInfo(plan);
                const sourceLabel = articleInfo.source.toUpperCase();

                return (
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        transition: '0.2s ease',
                        bgcolor: 'background.paper',
                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Stack spacing={2}>
                          <Stack
                            spacing={1}
                            sx={{
                              display: 'flex',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                            }}
                          >
                            <Typography
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                fontWeight: 800,
                              }}
                            >
                              {plan.title}
                            </Typography>

                            <Chip
                              size="small"
                              label={sourceLabel}
                              color={
                                articleInfo.source === 'pubmed'
                                  ? 'success'
                                  : 'primary'
                              }
                              variant="outlined"
                              sx={{ fontWeight: 700 }}
                            />
                          </Stack>

                          <Grid container={true} spacing={1.5}>
                            <Grid size={{ xs: 6 }}>
                              <Box
                                sx={{
                                  bgcolor: 'grey.100',
                                  borderRadius: 3,
                                  p: 1.5,
                                  height: '100%',
                                }}
                              >
                                <Typography
                                  sx={{ fontWeight: 900, fontSize: 24 }}
                                >
                                  {articleInfo.value}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {articleInfo.label}
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid size={{ xs: 6 }}>
                              <Box
                                sx={{
                                  bgcolor: 'grey.100',
                                  borderRadius: 3,
                                  p: 1.5,
                                  height: '100%',
                                }}
                              >
                                <Typography
                                  sx={{ fontWeight: 900, fontSize: 24 }}
                                >
                                  {plan.extraction_count ?? 0}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontWeight: 700 }}
                                >
                                  Extraction
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Stack>
                      </CardContent>

                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Stack spacing={1} sx={{ width: '100%' }}>
                          <Button
                            onClick={() =>
                              router.visit(
                                `/prisma?research_plan_id=${plan.research_plan_id}`,
                              )
                            }
                            variant="contained"
                            fullWidth
                          >
                            Lihat Research
                          </Button>

                          <Stack
                            sx={{
                              display: 'flex',
                              flexDirection: 'row',
                              gap: 3,
                            }}
                          >
                            <Button
                              variant="outlined"
                              color="warning"
                              fullWidth
                              onClick={() => openEditModal(plan)}
                              sx={{
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 700,
                              }}
                            >
                              Edit
                            </Button>

                            <Button
                              variant="outlined"
                              color="error"
                              fullWidth
                              onClick={() => openDeleteModal(plan)}
                              sx={{
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 700,
                              }}
                            >
                              Hapus
                            </Button>
                          </Stack>
                        </Stack>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Box
              sx={{
                py: 10,
                textAlign: 'center',
                borderRadius: 4,
                border: '1px dashed',
                borderColor: 'divider',
                bgcolor: 'grey.50',
              }}
            >
              <Typography sx={{ fontWeight: 700, color: 'text.secondary' }}>
                Belum ada research plan.
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Buat research plan pertama untuk mulai proses PRISMA.
              </Typography>
            </Box>
          )}
        </Box>
      </Card>

      <Dialog
        open={showCreateModal}
        onClose={handleCloseCreateModal}
        fullWidth
        maxWidth="sm"
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 4,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Buat Research Plan</DialogTitle>

        <form onSubmit={submit}>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Research Title"
                placeholder="Masukkan judul research"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                error={Boolean(errors.title)}
                helperText={errors.title}
                fullWidth
              />

              <FormControl fullWidth error={Boolean(errors.source_database)}>
                <InputLabel>Source Database</InputLabel>
                <Select
                  label="Source Database"
                  value={data.source_database}
                  onChange={(e) =>
                    setData('source_database', String(e.target.value))
                  }
                >
                  <MenuItem value="scopus">Scopus</MenuItem>
                  <MenuItem value="pubmed">PubMed</MenuItem>
                </Select>

                {errors.source_database && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 0.75, ml: 1.75 }}
                  >
                    {errors.source_database}
                  </Typography>
                )}
              </FormControl>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={handleCloseCreateModal}
              color="inherit"
              sx={{ borderRadius: 3, textTransform: 'none' }}
            >
              Batal
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={processing}
              sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }}
            >
              Buat Plan
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={showEditModal}
        onClose={closeEditModal}
        fullWidth
        maxWidth="sm"
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 4,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Edit Research Plan</DialogTitle>

        <form onSubmit={updatePlan}>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Judul Research Plan"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                error={Boolean(errors.title)}
                helperText={errors.title}
                fullWidth
              />

              <FormControl fullWidth error={Boolean(errors.source_database)}>
                <InputLabel>Source Database</InputLabel>
                <Select
                  label="Source Database"
                  value={data.source_database}
                  onChange={(e) =>
                    setData('source_database', String(e.target.value))
                  }
                >
                  <MenuItem value="scopus">Scopus</MenuItem>
                  <MenuItem value="pubmed">PubMed</MenuItem>
                </Select>

                {errors.source_database && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 0.75, ml: 1.75 }}
                  >
                    {errors.source_database}
                  </Typography>
                )}
              </FormControl>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={closeEditModal}
              color="inherit"
              sx={{ borderRadius: 3, textTransform: 'none' }}
            >
              Batal
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={processing}
              sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }}
            >
              Simpan Perubahan
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={showDeleteModal}
        onClose={closeDeleteModal}
        fullWidth
        maxWidth="xs"
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 4,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Hapus Research Plan</DialogTitle>

        <DialogContent>
          <Typography color="text.secondary">
            Apakah Anda yakin ingin menghapus research plan{' '}
            <strong>{selectedPlan?.title}</strong>?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={closeDeleteModal}
            color="inherit"
            sx={{ borderRadius: 3, textTransform: 'none' }}
          >
            Batal
          </Button>

          <Button
            onClick={deletePlan}
            variant="contained"
            color="error"
            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }}
          >
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
