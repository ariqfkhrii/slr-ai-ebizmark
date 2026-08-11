'use client';

import { showError, showSuccess } from '@/store/slices/snackbarSlice';
import { router } from '@inertiajs/react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useGuide } from '../spar/components/spar-layout';
import UploadOtherSourceGuide from '../spar/guides/UploadOtherSourceGuide';
import MetadataForm from './components/MetadataForm';
import PdfPreview from './components/PdfPreview';
import UploadedFileCard from './components/UploadedFileCard';
import UploadInfoAlert from './components/UploadInfoAlert';
import UploadStepper from './components/UploadStepper';
import UploadZone from './components/UploadZone';
import { useStoreOtherSource } from './hooks/useStoreOtherSource';
import UploadOtherSourceLayout from './UploadOtherSourceLayout';

export interface OtherSourceForm {
  doi: string;
  title: string;
  authors: string;
  researchPlanKeywordId: string;
  articleKeyword: string;
  tier: string;
  abstract: string;
  citationCount: string;
  publishYear: string;
}

export default function UploadOtherSourceContent() {
  const researchPlanId = Number(window.location.pathname.split('/')[2]);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form, setForm] = useState<OtherSourceForm>({
    doi: '',
    title: '',
    authors: '',
    researchPlanKeywordId: '',
    articleKeyword: '',
    tier: '',
    abstract: '',
    citationCount: '',
    publishYear: '',
  });
  const tierOptions = [
    {
      label: 'Q1',
      value: 'q1',
    },
    {
      label: 'Q2',
      value: 'q2',
    },
    {
      label: 'Q3',
      value: 'q3',
    },
    {
      label: 'Q4',
      value: 'q4',
    },
    {
      label: 'Tidak ada',
      value: '',
    },
  ];
  const dispatch = useDispatch();
  const mutation = useStoreOtherSource();

  const guideContent = useMemo(() => <UploadOtherSourceGuide />, []);

  useGuide({
    title: 'Unggah Sumber Lain',
    content: guideContent,
  });

  const handleGoBack = () => {
    router.visit(`/spar?research_plan_id=${researchPlanId}`);
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      dispatch(showError('Silakan pilih file PDF.'));
      return;
    }

    if (!form.title.trim()) {
      dispatch(showError('Judul artikel wajib diisi.'));
      return;
    }

    if (!form.researchPlanKeywordId) {
      dispatch(showError('Pilih keyword penelitian.'));
      return;
    }

    mutation.mutate(
      {
        researchPlanId,
        payload: {
          pdf: selectedFile,
          doi: form.doi,
          title: form.title,
          authors: form.authors,
          researchPlanKeywordId: Number(form.researchPlanKeywordId),
          articleKeyword: form.articleKeyword,
          tier: form.tier === '' ? null : form.tier,
          abstract: form.abstract,
          citationCount:
            form.citationCount === '' ? null : Number(form.citationCount),
          publishYear:
            form.publishYear === '' ? null : Number(form.publishYear),
        },
      },
      {
        onSuccess: () => {
          dispatch(showSuccess('Artikel berhasil ditambahkan.'));
          setTimeout(() => {
            router.visit(`/spar?research_plan_id=${researchPlanId}`);
          }, 800);
        },
        onError: (error) => {
          dispatch(showError(error.message));
        },
      },
    );
  };

  const handleNext = () => setActiveStep(1);
  const handleBack = () => setActiveStep(0);

  return (
    <UploadOtherSourceLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          {/* Back Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleGoBack}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              Kembali
            </Button>
          </Box>

          <UploadStepper activeStep={activeStep} />

          {activeStep === 0 && (
            <Paper sx={{ p: 4 }}>
              <Stack spacing={3}>
                <UploadInfoAlert />

                {!selectedFile ? (
                  <UploadZone
                    file={selectedFile}
                    disabled={mutation.isPending}
                    onSelect={setSelectedFile}
                  />
                ) : (
                  <UploadedFileCard
                    file={selectedFile}
                    disabled={mutation.isPending}
                    onRemove={() => setSelectedFile(null)}
                  />
                )}

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Button
                    variant="contained"
                    disabled={!selectedFile}
                    onClick={handleNext}
                  >
                    Konfirmasi
                  </Button>
                </Box>
              </Stack>
            </Paper>
          )}

          {activeStep === 1 && (
            <Paper sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 5 }}>
                  <MetadataForm
                    disabled={mutation.isPending}
                    value={form}
                    onChange={setForm}
                    researchPlanId={researchPlanId}
                    tierOptions={tierOptions}
                  />
                </Grid>

                <Grid size={{ xs: 12, lg: 7 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {selectedFile?.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      {(selectedFile!.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Paper>
                  <PdfPreview file={selectedFile} />
                </Grid>
              </Grid>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 4,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={mutation.isPending}
                >
                  Kembali
                </Button>

                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={mutation.isPending}
                  startIcon={
                    mutation.isPending ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : undefined
                  }
                >
                  {mutation.isPending ? 'Menyimpan...' : 'Simpan Artikel'}
                </Button>
              </Box>
            </Paper>
          )}
        </Stack>
      </Container>
    </UploadOtherSourceLayout>
  );
}
