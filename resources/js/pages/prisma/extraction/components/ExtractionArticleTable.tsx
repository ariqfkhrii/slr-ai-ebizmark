import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SyncIcon from '@mui/icons-material/Sync';
import {
  Box,
  Button,
  Chip,
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
  onOpenExtraction: (articleId: number) => void;
  onSynchronizePdf: () => void;
  onSynchronizeArticle: () => void;
};

export default function ExtractionArticleTable({
  articles,
  onOpenExtraction,
  onSynchronizePdf,
  onSynchronizeArticle,
}: Props) {
  const [search, setSearch] = useState('');

  const filteredArticles = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return articles;

    return articles.filter((item) =>
      [item.title, item.authors, item.journal]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [articles, search]);

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
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 900 }}>
            Extraction - Path & Item
          </Typography>

          <Typography sx={{ mt: 0.25, fontSize: 12, color: '#64748b' }}>
            Sinkronisasi PDF dan ekstrak informasi artikel yang sudah lolos
            proses retrieval.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<SyncIcon fontSize="small" />}
            onClick={onSynchronizeArticle}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800 }}
          >
            Synchronize Article
          </Button>

          <Button
            size="small"
            color="warning"
            variant="contained"
            startIcon={<SyncIcon fontSize="small" />}
            onClick={onSynchronizePdf}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800 }}
          >
            Synchronize PDF
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          alignItems: 'center',
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
              <TableCell>No</TableCell>
              <TableCell>Authors</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Journal</TableCell>
              <TableCell>Penggunaan AI</TableCell>
              <TableCell>Citation</TableCell>
              <TableCell>Journal Rank</TableCell>
              <TableCell>Text</TableCell>
              <TableCell>Novelty</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Act</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredArticles.map((article, index) => (
              <TableRow key={article.id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell sx={{ maxWidth: 220 }}>{article.authors}</TableCell>
                <TableCell>{article.year}</TableCell>
                <TableCell sx={{ minWidth: 320 }}>{article.title}</TableCell>
                <TableCell>{article.journal}</TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={article.aiUsage ? 'Ya' : 'Tidak'}
                    color={article.aiUsage ? 'primary' : 'error'}
                    variant="outlined"
                  />
                </TableCell>

                <TableCell>{article.citation}</TableCell>

                <TableCell>
                  <Chip size="small" label={article.quartile} color="success" />
                </TableCell>

                <TableCell>{article.text}</TableCell>

                <TableCell>
                  {article.novelty ? (
                    <CheckCircleIcon sx={{ fontSize: 18, color: '#22c55e' }} />
                  ) : (
                    '-'
                  )}
                </TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={article.status}
                    color={
                      article.status === 'extracted' ? 'success' : 'warning'
                    }
                  />
                </TableCell>

                <TableCell align="center">
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={() => onOpenExtraction(article.id)}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}
