import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { getFilteredArticles } from '@/clients/acquisition';
import { RawArticle } from '../types';

type Props = {
  keywordId: number;
  researchPlanId: number;
};

export default function RawArticleTable({ keywordId, researchPlanId }: Props) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [keywordId]);

  const { data, isLoading } = useQuery({
    queryKey: ['filtered-articles', researchPlanId, keywordId, page, size],
    queryFn: () =>
      getFilteredArticles({
        researchPlanId,
        keywordId,
        page,
        size,
      }),
    enabled: !!researchPlanId && !!keywordId,
  });

  const articles: RawArticle[] = useMemo(() => data?.data ?? [], [data]);

  const totalItems = data?.total ?? 0;

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
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
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f9fafb' }}>
              <TableCell sx={{ fontSize: 11, fontWeight: 800 }}>NO</TableCell>
              <TableCell sx={{ fontSize: 11, fontWeight: 800 }}>
                ARTIKEL
              </TableCell>
              <TableCell sx={{ fontSize: 11, fontWeight: 800 }}>
                TAHUN
              </TableCell>
              <TableCell sx={{ fontSize: 11, fontWeight: 800 }}>TIER</TableCell>
              <TableCell sx={{ fontSize: 11, fontWeight: 800 }}>DOI</TableCell>
              <TableCell sx={{ fontSize: 11, fontWeight: 800 }}>LINK</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Belum ada metadata. Klik Fetch Metadata terlebih dahulu.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article, index) => (
                <TableRow key={article.id ?? index} hover>
                  <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {(page - 1) * size + index + 1}
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
                      {article.title}
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ fontSize: 12 }}>
                    {article.publish_year}
                  </TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={article.tier.toUpperCase()}
                      color={article.tier === 'q1' ? 'success' : 'primary'}
                      sx={{ fontSize: 11, height: 22 }}
                    />
                  </TableCell>

                  <TableCell sx={{ fontSize: 12 }}>{article.doi}</TableCell>

                  <TableCell>
                    <IconButton
                      component="a"
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                    >
                      <ExternalLink size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalItems}
        page={page - 1}
        rowsPerPage={size}
        onPageChange={(_, newPage) => setPage(newPage + 1)}
        onRowsPerPageChange={(event) => {
          setSize(Number(event.target.value));
          setPage(1);
        }}
        rowsPerPageOptions={[5, 10, 20, 50]}
      />
    </Box>
  );
}
