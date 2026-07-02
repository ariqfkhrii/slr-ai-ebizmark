import {
  Box,
  Button,
  Checkbox,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import { ExternalLink } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FilteredArticle } from '../types';

type Props = {
  title: string;
  articles: FilteredArticle[];
  actionLabel: 'Include' | 'Exclude';
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
};

export default function ScreeningTable({
  title,
  articles,
  actionLabel,
  selectedIds,
  onSelectionChange,
}: Props) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedArticles = useMemo(() => {
    return [...articles].sort((a, b) => {
      const scoreA = a.similarity_score ?? Number.NEGATIVE_INFINITY;
      const scoreB = b.similarity_score ?? Number.NEGATIVE_INFINITY;

      return sortDirection === 'asc' ? scoreA - scoreB : scoreB - scoreA;
    });
  }, [articles, sortDirection]);

  const paginatedArticles = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedArticles.slice(start, start + rowsPerPage);
  }, [sortedArticles, page, rowsPerPage]);

  const hasSimilarity = useMemo(
    () => articles.some((a) => a.similarity_score !== null),
    [articles],
  );

  useEffect(() => {
    setPage(0);
  }, [articles.length]);

  return (
    <Paper
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          {title}
        </Typography>

        <Chip
          label={`${articles.length} Artikel`}
          color={actionLabel === 'Include' ? 'error' : 'success'}
          size="small"
          sx={{ p: 1 }}
        />
      </Box>

      <TableContainer
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',

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
              <TableCell width={70}>Tahun</TableCell>
              <TableCell>Judul</TableCell>
              <TableCell width={70}>Tier</TableCell>
              <TableCell width={90}>Sitasi</TableCell>
              <TableCell width={70}>DOI</TableCell>
              {hasSimilarity && (
                <TableCell width={100}>
                  <TableSortLabel
                    active
                    direction={sortDirection}
                    onClick={() =>
                      setSortDirection((prev) =>
                        prev === 'asc' ? 'desc' : 'asc',
                      )
                    }
                  >
                    Similarity
                  </TableSortLabel>
                </TableCell>
              )}

              <TableCell width={90} align="center">
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {actionLabel}
                  </Typography>

                  <Checkbox
                    checked={
                      articles.length > 0 &&
                      selectedIds.length === articles.length
                    }
                    indeterminate={
                      selectedIds.length > 0 &&
                      selectedIds.length < articles.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        onSelectionChange(
                          articles.map((a) => a.filtered_article_id),
                        );
                      } else {
                        onSelectionChange([]);
                      }
                    }}
                  />
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedArticles.map((item) => {
              const article = item.raw_article;

              return (
                <TableRow hover key={item.filtered_article_id}>
                  <TableCell>{article.publish_year}</TableCell>

                  <TableCell>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: 13,
                        mb: 0.25,
                      }}
                    >
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
                      sx={{
                        minWidth: 36,
                      }}
                    >
                      <ExternalLink size={16} />
                    </Button>
                  </TableCell>

                  {hasSimilarity && (
                    <TableCell align="center">
                      {item.similarity_score?.toFixed(2)}
                    </TableCell>
                  )}

                  <TableCell align="center">
                    <Checkbox
                      checked={selectedIds.includes(item.filtered_article_id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onSelectionChange([
                            ...selectedIds,
                            item.filtered_article_id,
                          ]);
                        } else {
                          onSelectionChange(
                            selectedIds.filter(
                              (id) => id !== item.filtered_article_id,
                            ),
                          );
                        }
                      }}
                    />
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
    </Paper>
  );
}
