import { showSuccess } from '@/store/slices/snackbarSlice';
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
  IconButton,
  Tooltip,
} from '@mui/material';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

export default function DashboardPage({ auth, researchPlans = [] }: any) {
  const dispatch = useDispatch();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [guideVisible, setGuideVisible] = useState(true);
  const [guideTab, setGuideTab] = useState<'overview' | 'topik'>('overview');

  const { data, setData, post, put, processing, reset, errors } = useForm({
    title: '',
    source_database: 'scopus',
  });

  const isProfileOpen = Boolean(profileAnchorEl);

  const renderBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/);
    return parts.map((part, idx) => {
      if (part.match(/\*\*.*?\*\*/) && part.length > 4) {
        return <strong key={idx}>{part.replace(/\*\*/g, '')}</strong>;
      }
      return <span key={idx}>{part}</span>;
    });
  };

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
        dispatch(showSuccess('Topik berhasil dibuat'));

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
        dispatch(showSuccess('Topik berhasil diperbarui'));

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
        dispatch(showSuccess('Topik berhasil dihapus'));

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
        label: 'Artikel',
        value: plan.pubmed_quantity ?? 0,
      };
    }

    return {
      source: 'scopus',
      label: 'Artikel',
      value: plan.scopus_quantity ?? 0,
    };
  };

  return (
    <Box
      sx={{
        height: '100vh',
        bgcolor: '#f5f6f8',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid #e2e4e9',
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Topik Systematic Literature Review
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {researchPlans.length} topik
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Tooltip title={guideVisible ? 'Sembunyikan Panduan' : 'Tampilkan Panduan'}>
            <Button
              variant={guideVisible ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setGuideVisible(!guideVisible)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '12px',
              }}
            >
              <InfoIcon sx={{ fontSize: 16, mr: 0.5 }} /> Panduan
            </Button>
          </Tooltip>

          <Button
            onClick={handleOpenProfile}
            variant="outlined"
            size="small"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '12px' }}>
              {auth?.user?.name?.charAt(0) ?? 'U'}
            </Avatar>
            {auth?.user?.name}
          </Button>

          <Menu
            anchorEl={profileAnchorEl}
            open={Boolean(profileAnchorEl)}
            onClose={handleCloseProfile}
            sx={{
              '& .MuiPaper-root': {
                borderRadius: 2,
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '12px' }}>
                {auth?.user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {auth?.user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => (window.location.href = '/settings/profile')} sx={{ fontSize: '12px' }}>
              Profile
            </MenuItem>
            <MenuItem onClick={() => router.post('/logout')} sx={{ color: 'error.main', fontSize: '12px' }}>
              Logout
            </MenuItem>
          </Menu>

          <Button
            variant="contained"
            size="small"
            onClick={handleOpenCreateModal}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '12px',
            }}
          >
            Buat Baru
          </Button>
        </Stack>
      </Box>

      {/* Main Layout - List + Guide */}
      <Box
        sx={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: guideVisible ? '1fr 280px' : '1fr 0px',
          gap: 0,
          overflow: 'hidden',
          minHeight: 0,
          transition: 'grid-template-columns 0.3s ease',
        }}
      >
        {/* LEFT PANEL - Research List */}
        <Box
          sx={{
            bgcolor: 'white',
            borderRight: guideVisible ? '1px solid #e2e4e9' : 'none',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minWidth: 0,
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              px: 1.5,
              py: 1.5,
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-thumb': {
                background: '#e5e7eb',
                borderRadius: '99px',
              },
            }}
          >
            {researchPlans.length > 0 ? (
              <Grid container spacing={1}>
                {researchPlans.map((plan: any) => {
                  const articleInfo = getArticleInfo(plan);
                  return (
                    <Grid size={{ xs: 12, sm: 6 }} key={plan.research_plan_id}>
                      <Box
                        sx={{
                          border: '1px solid #e2e4e9',
                          borderRadius: 2,
                          p: 1.5,
                          bgcolor: 'white',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          '&:hover': {
                            borderColor: '#4f6ef7',
                            boxShadow: '0 2px 8px rgba(79,110,247,0.1)',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontSize: '11px', flex: 1 }}>
                            {plan.title}
                          </Typography>
                          <Chip
                            label={articleInfo.source.toUpperCase()}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '9px',
                              fontWeight: 700,
                              borderRadius: 1.5,
                              bgcolor: articleInfo.source === 'pubmed' ? '#e0f2fe' : '#eef2ff',
                              color: articleInfo.source === 'pubmed' ? '#0369a1' : '#3730a3',
                              textTransform: 'uppercase',
                            }}
                          />
                        </Box>
                        <Grid container spacing={0.5} sx={{ mb: 1, flex: 1 }}>
                          <Grid size={4}>
                            <Box sx={{ bgcolor: '#f3f4f6', borderRadius: 1.5, p: 0.75, textAlign: 'center' }}>
                              <Typography sx={{ fontWeight: 700, fontSize: '11px' }}>
                                {plan.keyword_count ?? 0}
                              </Typography>
                              <Typography variant="caption" sx={{ fontSize: '11px'}}>
                                Keyword
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid size={4}>
                            <Box sx={{ bgcolor: '#f3f4f6', borderRadius: 1.5, p: 0.75, textAlign: 'center' }}>
                              <Typography sx={{ fontWeight: 700, fontSize: '11px' }}>
                                {articleInfo.value}
                              </Typography>
                              <Typography variant="caption" sx={{ fontSize: '11px'}}>
                                Artikel
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid size={4}>
                            <Box sx={{ bgcolor: '#f3f4f6', borderRadius: 1.5, p: 0.75, textAlign: 'center' }}>
                              <Typography sx={{ fontWeight: 700, fontSize: '11px' }}>
                                {plan.extraction_count ?? 0}
                              </Typography>
                              <Typography variant="caption" sx={{ fontSize: '11px'}}>
                                Ekstrak
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                        <Stack direction="row" spacing={0.5} sx={{ mt: 'auto' }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() =>
                              router.visit(`/spar?research_plan_id=${plan.research_plan_id}`)
                            }
                            sx={{
                              flex: 1,
                              fontSize: '9px',
                              textTransform: 'none',
                              borderRadius: 1.5,
                              py: 0.4,
                            }}
                          >
                            Mulai
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={() => openEditModal(plan)}
                            sx={{
                              fontSize: '9px',
                              textTransform: 'none',
                              borderRadius: 1.5,
                              py: 0.4,
                              px: 0.75,
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => openDeleteModal(plan)}
                            sx={{
                              fontSize: '9px',
                              textTransform: 'none',
                              borderRadius: 1.5,
                              py: 0.4,
                              px: 0.75,
                            }}
                          >
                            Hapus
                          </Button>
                        </Stack>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4, color: '#6b7280', fontSize: '12px' }}>
                <Typography variant="caption">Belum ada topik SLR</Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* RIGHT PANEL - Guide */}
        {guideVisible && (
          <Box
            sx={{
              bgcolor: 'white',
              borderLeft: '1px solid #e2e4e9',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              minWidth: 0,
              minHeight: 0,
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid #e2e4e9', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '10px' }}>
                Panduan
              </Typography>
              <IconButton size="small" onClick={() => setGuideVisible(false)}>
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>

            {/* Tab Buttons */}
            <Box sx={{ px: 2, pt: 2, display: 'flex', gap: 0.5, flexShrink: 0 }}>
              {(['overview', 'topik'] as const).map((tab) => (
                <Button
                  key={tab}
                  size="small"
                  onClick={() => setGuideTab(tab)}
                  sx={{
                    flex: 1,
                    fontSize: '10px',
                    textTransform: 'capitalize',
                    borderRadius: 1.5,
                    bgcolor: guideTab === tab ? 'white' : '#f3f4f6',
                    color: guideTab === tab ? '#4f6ef7' : '#6b7280',
                    border: guideTab === tab ? '1px solid #c7d2fe' : 'none',
                    fontWeight: guideTab === tab ? 600 : 400,
                    '&:hover': {
                      bgcolor: guideTab === tab ? 'white' : '#e5e7eb',
                    },
                  }}
                >
                  {tab === 'overview' ? 'Overview' : 'Topik'}
                </Button>
              ))}
            </Box>

            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-thumb': {
                  background: '#e5e7eb',
                  borderRadius: '99px',
                },
              }}
            >
              {guideTab === 'overview' && (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '10px' }}>
                      Mulai dari sini
                    </Typography>
                    <Stack spacing={1.5} sx={{ mt: 1 }}>
                      {[
                        { num: 1, title: 'Buat Topik Baru', desc: 'Klik tombol **Buat Baru** di pojok kanan atas panel kiri untuk membuat topik SLR pertamamu.' },
                        { num: 2, title: 'Pilih Database', desc: 'Tentukan apakah kamu akan mencari artikel dari **Scopus** atau **PubMed** saat membuat sebuah topik baru.' },
                        { num: 3, title: 'Buka Topik SLR', desc: 'Klik **Mulai SLR** pada card untuk masuk ke halaman detail dan mulai proses SLR.' },
                      ].map((step) => (
                        <Box key={step.num} sx={{ display: 'flex', gap: 1 }}>
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              bgcolor: '#eef0fe',
                              color: '#4f6ef7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {step.num}
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: '11px', fontWeight: 600 }}>{step.title}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '9px', lineHeight: 1.4 }}>
                              {renderBoldText(step.desc)}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              )}

              {guideTab === 'topik' && (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '10px' }}>
                      Mengelola Topik SLR
                    </Typography>
                    <Stack spacing={1.5} sx={{ mt: 1 }}>
                      {[
                        { num: 1, title: 'Membuat Topik Baru', desc: 'Klik **Buat Baru** → isi topik SLR yang representatif → pilih database (Scopus/PubMed) → klik **Buat Topik** atau tekan Enter.' },
                        { num: 2, title: 'Edit Topik SLR', desc: 'Klik tombol **Edit** untuk mengubah judul. Perubahan langsung tersimpan setelah klik **Simpan Perubahan**.' },
                        { num: 3, title: 'Hapus Topik SLR', desc: 'Klik tombol **Hapus** → akan muncul konfirmasi. Klik **Ya, Hapus** untuk menghapus permanen.' },
                        { num: 4, title: 'Statistik Card', desc: 'Setiap card menampilkan **Kata Kunci** (jumlah kata kunci pada topik SLR), **Artikel** (jumlah artikel yang berhasil diperoleh dari Scopus atau PubMed), dan **Ekstrak** (jumlah artikel yang telah berhasil diekstraksi).' },
                      ].map((step) => (
                        <Box key={step.num} sx={{ display: 'flex', gap: 1 }}>
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              bgcolor: '#eef0fe',
                              color: '#4f6ef7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {step.num}
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: '11px', fontWeight: 600 }}>{step.title}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '9px', lineHeight: 1.4 }}>
                              {renderBoldText(step.desc)}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                  <Box sx={{ bgcolor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 1.5, p: 1.5 }}>
                    <Typography variant="caption" sx={{ fontSize: '9px', color: '#92400e', lineHeight: 1.5 }}>
                      <strong>⚠️ Perhatian:</strong> Penghapusan topik SLR bersifat permanen dan tidak dapat dibatalkan. Pastikan sudah mengekspor data yang diperlukan sebelum menghapus.
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '9px' }}>
                      Badge Database
                    </Typography>
                    <Stack spacing={0.75} sx={{ mt: 1 }}>
                      <Typography variant="caption" sx={{ fontSize: '9px', color: '#1a1d23' }}>
                        <strong>SCOPUS</strong> = badge di card menunjukkan topik ini menggunakan data dari Scopus.
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '9px', color: '#1a1d23' }}>
                        <strong>PUBMED</strong> = badge di card menunjukkan topik ini menggunakan data dari PubMed.
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              )}


            </Box>
          </Box>
        )}
      </Box>

      {/* CREATE MODAL */}
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
        <DialogTitle sx={{ fontWeight: 800 }}>
          Buat Topik SLR
        </DialogTitle>

        <form onSubmit={submit}>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Topik SLR"
                placeholder="Masukkan topik SLR"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                error={Boolean(errors.title)}
                helperText={errors.title}
                fullWidth
              />

              <FormControl fullWidth error={Boolean(errors.source_database)}>
                <InputLabel>Basis Data Literatur Ilmiah</InputLabel>
                <Select
                  label="Basis Data Literatur Ilmiah"
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
              Buat Topik SLR
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* EDIT MODAL */}
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
        <DialogTitle sx={{ fontWeight: 800 }}>
          Edit Topik
        </DialogTitle>

        <form onSubmit={updatePlan}>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Topik SLR"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                error={Boolean(errors.title)}
                helperText={errors.title}
                fullWidth
              />

              <FormControl fullWidth error={Boolean(errors.source_database)}>
                <InputLabel>Basis Data Literatur Ilmiah</InputLabel>
                <Select
                  label="Basis Data Literatur Ilmiah"
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

      {/* DELETE MODAL */}
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
        <DialogTitle sx={{ fontWeight: 800 }}>
          Hapus Topik
        </DialogTitle>

        <DialogContent>
          <Typography color="text.secondary">
            Apakah Anda yakin ingin menghapus topik SLR{' '}
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
