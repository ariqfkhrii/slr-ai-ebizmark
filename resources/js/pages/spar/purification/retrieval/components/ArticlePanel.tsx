import { Download, ExternalLink, FileText } from 'lucide-react';

import { useAppDispatch } from '@/lib/store/hooks';
import { showError, showSuccess } from '@/store/slices/snackbarSlice';
import { router } from '@inertiajs/react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import type { ArticlePanelProps } from '../types';

function buildArticleLink(preLink: string, doi: string, postLink: string) {
  return `${preLink}${encodeURIComponent(doi)}${postLink}`;
}

const getArticleStatusColor = (status?: string | null) => {
  if (!status) return 'text.secondary';

  const value = status.toLowerCase();

  if (value.includes('berhasil') || value.includes('sudah tersedia')) {
    return 'success.main';
  }

  if (
    value.includes('gagal') ||
    value.includes('manual') ||
    value.includes('dilewati')
  ) {
    return 'error.main';
  }

  return 'text.secondary';
};

export default function ArticlePanel({
  title,
  count,
  articles,
  accent,
  emptyText,
  preLink,
  postLink,
  researchPlanId,
  onToggleRetrieved,
  onAutoFetch,
}: ArticlePanelProps) {
  const dispatch = useAppDispatch();
  const [fetchingId, setFetchingId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const handleUpload = (articleId: number, file: File | null) => {
    if (!file) return;

    setUploadingId(articleId);
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('research_plan_id', String(researchPlanId));
    formData.append('filtered_article_id', String(articleId));

    router.post('/filtered-articles/check-doi', formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        setUploadingId(null);
        dispatch(
          showSuccess(
            'PDF berhasil diunggah. Silakan periksa kembali status artikel.',
          ),
        );
        router.reload({ only: ['filteredArticles'] });
      },
      onError: () => {
        setUploadingId(null);
        dispatch(showError('Gagal mengunggah PDF. Silakan coba lagi.'));
      },
      onFinish: () => setUploadingId(null),
    });
  };

  const handleAutoFetch = (articleId: number) => {
    setFetchingId(articleId);
    router.post(
      `/filtered-articles/${articleId}/auto-fetch`,
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          // Start polling status until the job completes (retrieved or pdf_path present)
          let attempts = 0;
          const maxAttempts = 24; // ~2 minutes if interval=5000ms
          const intervalMs = 5000;

          const poll = window.setInterval(async () => {
            attempts += 1;
            try {
              const res = await fetch(
                `/filtered-articles/${articleId}/status`,
                {
                  headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                  },
                  credentials: 'same-origin',
                },
              );

              if (res.status === 403) {
                window.clearInterval(poll);
                setFetchingId(null);
                dispatch(showError('Akses ditolak saat memeriksa status.'));
                return;
              }

              if (!res.ok) {
                throw new Error('Network response was not ok');
              }

              const data = await res.json();

              if (data.retrieved || data.pdf_path) {
                window.clearInterval(poll);
                setFetchingId(null);
                dispatch(
                  showSuccess(
                    'PDF berhasil ditemukan/diunduh untuk artikel ini.',
                  ),
                );
                router.reload({ only: ['filteredArticles'] });
                return;
              }

              if (
                data.article_status &&
                (data.article_status.toLowerCase().includes('gagal') ||
                  data.article_status.toLowerCase().includes('dilewati'))
              ) {
                window.clearInterval(poll);
                setFetchingId(null);
                dispatch(showError(data.article_status));
                router.reload({ only: ['filteredArticles'] });
                return;
              }

              if (attempts >= maxAttempts) {
                window.clearInterval(poll);
                setFetchingId(null);
                dispatch(
                  showError(
                    'Tidak ada PDF publik ditemukan. Silakan gunakan fitur Upload PDF manual.',
                  ),
                );
              }
            } catch (e) {
              window.clearInterval(poll);
              setFetchingId(null);
              dispatch(showError('Gagal memeriksa status fetch.'));
            }
          }, intervalMs);
        },
        onError: (errors) => {
          setFetchingId(null);
          try {
            // Try to extract a useful message from server-provided errors
            const message =
              (errors &&
                typeof errors === 'object' &&
                Object.values(errors).flat().join(' ')) ||
              'Akses ditolak atau terjadi kesalahan.';
            dispatch(showError(`Gagal memulai fetch: ${message}`));
          } catch (e) {
            dispatch(showError('Gagal memulai fetch: terjadi kesalahan.'));
          }
        },
        onFinish: () => setFetchingId(null),
      },
    );
  };
  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        minHeight: 0,
        height: '75vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        background: 'linear-gradient(180deg, #ffffff 0%, #fbfcff 100%)',
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          px: 2.5,
          py: 1.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
        }}
      >
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 800,
          }}
        >
          {title}
        </Typography>

        <Chip
          label={`${count} Artikel`}
          size="small"
          sx={{
            bgcolor: accent,
            color: '#fff',
            fontWeight: 500,
            p: 1,
          }}
        />
      </Box>

      {/* CONTENT */}
      <Box
        sx={{
          p: 1.5,
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          gap: 1.5,
          overflowY: 'auto',
        }}
      >
        {articles.length === 0 ? (
          <Box
            sx={{
              minHeight: 180,
              display: 'grid',
              placeItems: 'center',
              color: 'text.secondary',
              border: '1px dashed rgba(15, 23, 42, 0.18)',
              borderRadius: 3,
              bgcolor: '#fff',
            }}
          >
            <Typography sx={{ fontSize: 14 }}>{emptyText}</Typography>
          </Box>
        ) : (
          articles.map((article) => (
            <Paper
              key={article.id}
              elevation={0}
              sx={{
                borderRadius: 3,
                p: 2,
                border: '1px solid rgba(15, 23, 42, 0.08)',
                boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)',
              }}
            >
              <Stack spacing={1.25}>
                {/* TITLE + STATUS */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 17,
                        fontWeight: 800,
                        lineHeight: 1.2,
                      }}
                    >
                      {article.title}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontSize: 12.5,
                        color: 'text.secondary',
                      }}
                    >
                      DOI: {article.doi}
                    </Typography>
                  </Box>

                  {article.retrieved ? (
                    <Chip
                      label={<FileText size={14} />}
                      size="small"
                      sx={{
                        bgcolor: '#dcfce7',
                        color: '#15803d',
                        fontWeight: 700,
                      }}
                    />
                  ) : (
                    <Chip
                      label={<FileText size={14} />}
                      size="small"
                      sx={{
                        bgcolor: '#fee2e2',
                        color: '#b91c1c',
                        fontWeight: 700,
                      }}
                    />
                  )}
                </Box>

                {/* NOTE */}
                <Typography
                  sx={{
                    fontSize: 13,
                    color: 'text.secondary',
                    lineHeight: 1.6,
                  }}
                >
                  {article.note}
                </Typography>

                {article.article_status && (
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: getArticleStatusColor(article.article_status),
                      lineHeight: 1.35,
                    }}
                  >
                    {article.article_status}
                  </Typography>
                )}

                {/* FOOTER */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Chip
                      label={article.source}
                      size="small"
                      sx={{
                        fontWeight: 700,
                      }}
                    />

                    <Typography
                      sx={{
                        fontSize: 12,
                        color: 'text.secondary',
                      }}
                    >
                      {article.year ?? '-'}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    {!article.retrieved && (
                      <>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={
                            fetchingId === article.id ? (
                              <CircularProgress size={14} color="inherit" />
                            ) : (
                              <Download size={14} />
                            )
                          }
                          onClick={() => handleAutoFetch(article.id)}
                          disabled={
                            fetchingId === article.id ||
                            uploadingId === article.id
                          }
                        >
                          {fetchingId === article.id
                            ? 'Memproses...'
                            : 'Coba Unduh PDF'}
                        </Button>

                        <Button
                          component="label"
                          size="small"
                          variant="outlined"
                          color="secondary"
                          disabled={
                            uploadingId === article.id ||
                            fetchingId === article.id
                          }
                        >
                          {uploadingId === article.id
                            ? 'Mengunggah...'
                            : 'Upload PDF'}
                          <input
                            hidden
                            type="file"
                            accept="application/pdf"
                            onChange={(e) =>
                              handleUpload(
                                article.id,
                                e.target.files?.[0] ?? null,
                              )
                            }
                          />
                        </Button>
                      </>
                    )}

                    <Button
                      size="small"
                      variant={article.retrieved ? 'contained' : 'outlined'}
                      endIcon={<ExternalLink size={14} />}
                      href={buildArticleLink(preLink, article.doi, postLink)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Lihat
                    </Button>
                  </Box>
                </Box>
              </Stack>
            </Paper>
          ))
        )}
      </Box>
    </Paper>
  );
}
