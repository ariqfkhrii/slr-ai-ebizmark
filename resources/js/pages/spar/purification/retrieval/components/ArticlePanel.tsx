import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { router } from '@inertiajs/react';

import type { ArticlePanelProps } from '../types';

function buildArticleLink(
  preLink: string,
  doi: string,
  postLink: string,
) {
  return `${preLink}${encodeURIComponent(doi)}${postLink}`;
}

export default function ArticlePanel({
  title,
  count,
  articles,
  accent,
  emptyText,
  preLink,
  postLink,
  onToggleRetrieved,
  onAutoFetch,
}: ArticlePanelProps) {
  const [fetchingId, setFetchingId] = useState<number | null>(null);

  const handleAutoFetch = (articleId: number) => {
    setFetchingId(articleId);
    router.post(
      `/filtered-articles/${articleId}/auto-fetch`,
      {},
      {
        preserveScroll: true,
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
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        background:
          'linear-gradient(180deg, #ffffff 0%, #fbfcff 100%)',
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
          borderBottom:
            '1px solid rgba(15, 23, 42, 0.08)',
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
          label={`${count} Record`}
          size="small"
          sx={{
            bgcolor: accent,
            color: '#fff',
            fontWeight: 700,
          }}
        />
      </Box>

      {/* CONTENT */}
      <Box
        sx={{
          p: 1.5,
          display: 'grid',
          gap: 1.5,
          maxHeight: '100%',
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
              border:
                '1px dashed rgba(15, 23, 42, 0.18)',
              borderRadius: 3,
              bgcolor: '#fff',
            }}
          >
            <Typography sx={{ fontSize: 14 }}>
              {emptyText}
            </Typography>
          </Box>
        ) : (
          articles.map((article) => (
            <Paper
              key={article.id}
              elevation={0}
              sx={{
                borderRadius: 3,
                p: 2,
                border:
                  '1px solid rgba(15, 23, 42, 0.08)',
                boxShadow:
                  '0 8px 18px rgba(15, 23, 42, 0.08)',
              }}
            >
              <Stack spacing={1.25}>
                {/* TITLE + STATUS */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent:
                      'space-between',
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
                      icon={
                        <CheckCircle2
                          size={14}
                        />
                      }
                      label="Retrieved"
                      size="small"
                      sx={{
                        bgcolor: '#dcfce7',
                        color: '#15803d',
                        fontWeight: 700,
                      }}
                    />
                  ) : (
                    <Chip
                      icon={
                        <AlertCircle
                          size={14}
                        />
                      }
                      label="Not Retrieved"
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

                {/* FOOTER */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      'space-between',
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
                        color:
                          'text.secondary',
                      }}
                    >
                      {article.year ?? '-'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {/* Auto-Fetch button — only for NOT RETRIEVED articles */}
                    {!article.retrieved && onAutoFetch && (
                      <Tooltip title="Cari & Unduh PDF otomatis (OpenAlex)">
                        <span>
                          <IconButton
                            size="small"
                            disabled={fetchingId === article.id}
                            onClick={() => handleAutoFetch(article.id)}
                            sx={{
                              color: 'primary.main',
                              border: '1px solid',
                              borderColor: 'primary.light',
                              borderRadius: 1.5,
                              p: 0.6,
                              '&:hover': {
                                bgcolor: 'primary.50',
                              },
                            }}
                          >
                            {fetchingId === article.id ? (
                              <CircularProgress size={14} />
                            ) : (
                              <Sparkles size={14} />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}

                    <Button
                      size="small"
                      variant={
                        article.retrieved
                          ? 'contained'
                          : 'outlined'
                      }
                      endIcon={
                        <ExternalLink
                          size={14}
                        />
                      }
                      href={buildArticleLink(
                        preLink,
                        article.doi,
                        postLink,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
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