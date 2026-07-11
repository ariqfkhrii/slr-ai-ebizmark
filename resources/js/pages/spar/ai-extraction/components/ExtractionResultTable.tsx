import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { ExtractionArticle } from '../types';

type Props = {
  articles: ExtractionArticle[];
  onOpenDetail: (articleId: number) => void;
  onOpenEdit: (articleId: number) => void;
  onRunAi: () => void;
  guideOpen?: boolean;
};

export default function ExtractionResultTable({
  articles,
  onOpenDetail,
  onOpenEdit,
  onRunAi,
  guideOpen = false,
}: Props) {
  const [search, setSearch] = useState('');

  const filteredArticles = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return articles;

    return articles.filter((article) =>
      [
        article.title,
        article.authors,
        article.abstract,
        article.introduction,
        article.result,
        article.conclusion,
        article.recommendation,
        article.noveltyGap,
        article.limitation,
        article.futureResearch,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [articles, search]);

  const renderPreview = (text?: string) => (
    <Typography
      variant="body2"
      color={text ? 'text.primary' : 'text.disabled'}
      sx={{
        display: '-webkit-box',
        overflow: 'hidden',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        maxWidth: 260,
        lineHeight: 1.5,
      }}
    >
      {text || 'Not extracted'}
    </Typography>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 4,
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 12px 30px rgba(15,23,42,.06)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 900 }}>
            Extraction Results
          </Typography>

          <Typography sx={{ mt: 0.25, fontSize: 12, color: '#64748b' }}>
            Hasil ekstraksi AI untuk artikel yang berhasil diproses.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            size="small"
            variant="contained"
            onClick={onRunAi}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              borderRadius: 3,
              mr: guideOpen ? 2 : 13,
              transition: 'margin-right 250ms ease',
              p: '10px',
            }}
          >
            Mulai Ekstraksi Otomatis
          </Button>
        </Box>
      </Box>

      {/* Toolbar */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          {['Copy', 'Excel', 'PDF', 'CSV'].map((item) => (
            <Button
              key={item}
              size="small"
              variant="outlined"
              sx={{
                minWidth: 56,
                borderRadius: 2,
                fontSize: 11,
                textTransform: 'none',
              }}
            >
              {item}
            </Button>
          ))}
        </Box>
        <TextField
          size="small"
          placeholder="Cari artikel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            width: 260,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: '#f8fafc',
            },
            '& .MuiInputBase-input': {
              fontSize: 12,
            },
          }}
        />
      </Box>

      {/* Table */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          px: 2,
          pb: 2,

          '&::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#cbd5e1',
            borderRadius: 999,
          },
        }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{
            minWidth: 1200,
            '& .MuiTableCell-root': {
              fontSize: 12,
              borderBottom: '1px solid #eef2f7',
            },
            '& .MuiTableHead-root .MuiTableCell-root': {
              bgcolor: '#f8fafc',
              fontWeight: 900,
              color: '#475569',
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell width={60}>
                <strong>No</strong>
              </TableCell>

              <TableCell width={320}>
                <strong>Article</strong>
              </TableCell>

              <TableCell>
                <strong>Abstract</strong>
              </TableCell>

              <TableCell>
                <strong>Introduction</strong>
              </TableCell>

              <TableCell>
                <strong>Result</strong>
              </TableCell>

              <TableCell>
                <strong>Conclusion</strong>
              </TableCell>

              <TableCell>
                <strong>Recommendation</strong>
              </TableCell>

              <TableCell width={170} align="center">
                <strong>Action</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredArticles.map((article, index) => (
              <TableRow hover key={article.id}>
                <TableCell>{index + 1}</TableCell>

                <TableCell>
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: 12 }}>
                      {article.title}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: '#64748b',
                        fontSize: 11,
                        display: 'block',
                        mt: 0.25,
                      }}
                    >
                      {article.authors}
                      {article.publishYear && ` • ${article.publishYear}`}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>{renderPreview(article.abstract)}</TableCell>
                <TableCell>{renderPreview(article.introduction)}</TableCell>
                <TableCell>{renderPreview(article.result)}</TableCell>
                <TableCell>{renderPreview(article.conclusion)}</TableCell>
                <TableCell>{renderPreview(article.recommendation)}</TableCell>

                <TableCell align="center">
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onOpenDetail(article.id)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      Review
                    </Button>

                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => onOpenEdit(article.id)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      Edit
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}

            {!filteredArticles.length && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  align="center"
                  sx={{
                    py: 6,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: '#64748b',
                    }}
                  >
                    Tidak ada data yang ditemukan.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}
