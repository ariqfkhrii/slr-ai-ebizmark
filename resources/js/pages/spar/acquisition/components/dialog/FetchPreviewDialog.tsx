import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from '@mui/material';
import { MetadataPreviewResult } from '../../hooks/useAcquisition';
import { Keyword } from '../../types';

type Props = {
  open: boolean;
  loading: boolean;
  error: string;
  preview: MetadataPreviewResult | null;
  sourceDatabase: string;
  keyword: Keyword;
  onClose: () => void;
  onConfirm: () => void;
};

export default function FetchPreviewDialog({
  open,
  loading,
  error,
  preview,
  sourceDatabase,
  keyword,
  onClose,
  onConfirm,
}: Props) {
  const totalCount = preview?.data?.total_count ?? 0;
  const isRecommended = Boolean(preview?.data?.is_recommended);
  const sourceLabel = sourceDatabase.toUpperCase();

  const sampleArticles =
    preview?.data?.sample_articles ??
    preview?.data?.samples ??
    preview?.data?.articles ??
    preview?.data?.sample ??
    [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      sx={{
        '& .MuiPaper-root': {
          borderRadius: 0,
        },
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            HASIL FETCH
          </Typography>

          <Typography sx={{ fontSize: 18, fontWeight: 900 }}>
            {keyword.name}
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {loading && (
          <Box
            sx={{
              height: 260,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress size={30} />
          </Box>
        )}

        {!loading && error && (
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#fee2e2',
                color: '#991b1b',
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                {error}
              </Typography>
            </Box>
          </Box>
        )}

        {!loading && preview && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '210px 1fr',
              minHeight: 300,
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRight: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 1.5,
                  mb: 2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 900,
                    color: 'text.secondary',
                    mb: 0.5,
                  }}
                >
                  ARTIKEL DITEMUKAN
                </Typography>

                <Typography
                  sx={{
                    fontSize: 30,
                    fontWeight: 900,
                    color: '#14b8a6',
                    lineHeight: 1,
                  }}
                >
                  {totalCount}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'text.secondary',
                    mt: 0.75,
                  }}
                >
                  {sourceLabel}
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: 900,
                  color: 'text.secondary',
                  mb: 1,
                }}
              >
                JUMLAH DATA
              </Typography>

              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  borderRadius: 2,
                  px: 1.25,
                  py: 0.75,
                  fontSize: 12,
                  fontWeight: 800,
                  bgcolor: isRecommended ? '#ccfbf1' : '#fee2e2',
                  color: isRecommended ? '#0f766e' : '#991b1b',
                  border: '1px solid',
                  borderColor: isRecommended ? '#5eead4' : '#fecaca',
                  mb: 1.25,
                }}
              >
                {isRecommended
                  ? '✓ Dalam Rentang Ideal'
                  : 'Di luar Rentang Ideal'}
              </Box>

              <Typography
                sx={{
                  fontSize: 12,
                  color: 'text.secondary',
                  lineHeight: 1.5,
                }}
              >
                {preview.message}
              </Typography>
            </Box>

            <Box sx={{ p: 2.25 }}>
              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: 900,
                  color: 'text.secondary',
                  mb: 1.5,
                }}
              >
                SAMPLE ARTIKEL
              </Typography>

              {sampleArticles.length > 0 ? (
                <Box>
                  {sampleArticles
                    .slice(0, 5)
                    .map((article: any, index: number) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '28px 1fr',
                          gap: 1,
                          py: 1.25,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: 'text.disabled',
                          }}
                        >
                          {index + 1}
                        </Typography>

                        <Box>
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 400,
                              color: 'text.primary',
                              mb: 0.25,
                            }}
                          >
                            {article.title ?? article.name ?? '-'}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 11,
                              color: 'text.secondary',
                            }}
                          >
                            {article.source ?? article.journal ?? sourceLabel}
                            {article.year ? ` · ${article.year}` : ''}
                            {article.tier ? ` · ${article.tier}` : ''}
                            {article.citation_count
                              ? ` · ${article.citation_count} sitasi`
                              : ''}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    py: 5,
                    textAlign: 'center',
                    color: 'text.secondary',
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                  }}
                >
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                    Sample artikel belum dikirim dari API.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 2,
          py: 1.5,
        }}
      >
        <Button onClick={onClose} color="inherit">
          Batalkan
        </Button>

        <Button
          variant="contained"
          disabled={!preview?.can_execute || loading}
          onClick={onConfirm}
        >
          ✓ Gunakan Data Ini
        </Button>
      </DialogActions>
    </Dialog>
  );
}
