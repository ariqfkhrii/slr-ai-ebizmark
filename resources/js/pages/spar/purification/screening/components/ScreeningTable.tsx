import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { Check, ExternalLink, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FilteredArticle } from '../types';

type Props = {
  title: string;
  articles: FilteredArticle[];
  actionLabel: 'Include' | 'Exclude';
  onAction: (id: number) => void;
};

export default function ScreeningTable({
  title,
  articles,
  actionLabel,
  onAction,
}: Props) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const paginatedArticles = useMemo(() => {
    const start = page * rowsPerPage;
    return articles.slice(start, start + rowsPerPage);
  }, [articles, page, rowsPerPage]);

  useEffect(() => {
    setPage(0);
  }, [articles.length]);

  return (
    <Box>
      <Typography
        sx={{
          fontSize: 22,
          fontWeight: 700,
          mb: 2,
        }}
      >
        {title} ({articles.length})
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          maxHeight: '70vh',
          maxWidth: '100vh',

          '&::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },

          '&::-webkit-scrollbar-track': {
            background: '#f8fafc',
          },

          '&::-webkit-scrollbar-thumb': {
            background: '#cbd5e1',
            borderRadius: 999,
            border: '2px solid #f8fafc',
          },

          '&::-webkit-scrollbar-thumb:hover': {
            background: '#94a3b8',
          },
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tahun</TableCell>
              <TableCell>Judul</TableCell>
              <TableCell>Tier</TableCell>
              <TableCell>Jumlah Sitasi</TableCell>
              <TableCell>DOI</TableCell>
              <TableCell>Aksi</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedArticles.map((item) => {
              const article = item.raw_article;

              return (
                <TableRow hover key={item.filtered_article_id}>
                  <TableCell>{article.publish_year}</TableCell>

                  <TableCell>
                    <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                      {article.title}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {article.authors}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip size="small" label={article.tier.toUpperCase()} />
                  </TableCell>

                  <TableCell>{article.citation_count}</TableCell>

                  <TableCell>
                    <Button
                      size="small"
                      href={`https://doi.org/${article.doi}`}
                      target="_blank"
                    >
                      <ExternalLink size={16} />
                    </Button>
                  </TableCell>

                  <TableCell>
                    <Button
                      size="small"
                      color={actionLabel === 'Include' ? 'success' : 'error'}
                      variant="contained"
                      startIcon={
                        actionLabel === 'Include' ? (
                          <Check size={14} />
                        ) : (
                          <X size={14} />
                        )
                      }
                      onClick={() => onAction(item.filtered_article_id)}
                    >
                      {actionLabel}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={articles.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 20, 50]}
      />
    </Box>
  );
}
