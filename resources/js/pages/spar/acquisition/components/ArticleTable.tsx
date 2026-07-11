import {
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getFilteredArticles } from '@/clients/acquisition';
import YearRangePicker from '@/components/table/YearRangePicker';
import {
  setIncluded,
  setPage,
  setSearch,
  setSelectedTiers,
  setSize,
  setYearFrom,
  setYearTo,
} from '@/store/slices/articleFilterSlice';
import { RootState } from '@/store/store';
import { RawArticle } from '../types';

type Props = {
  keywordId?: number;
  researchPlanId: number;
  tabType: 'per-keyword' | 'all-keywords';
};

const compactFieldSx = {
  '& .MuiInputBase-root': {
    height: 32,
    fontSize: 12,
  },
  '& .MuiInputBase-input': {
    fontSize: 12,
    py: 0,
  },
  '& .MuiInputLabel-root': {
    fontSize: 12,
    top: -2,
  },
  '& .MuiInputLabel-shrink': {
    transform: 'translate(14px, -6px) scale(0.75)',
  },
};

const TIER_OPTIONS = ['q1', 'q2', 'q3', 'q4'];

const getArticleStatusColor = (status?: string | null) => {
  if (!status) return 'text.secondary';

  const value = status.toLowerCase();

  if (value.includes('berhasil') || value.includes('sudah tersedia')) {
    return 'success.main';
  }

  if (value.includes('gagal') || value.includes('manual')) {
    return 'error.main';
  }

  return 'text.secondary';
};

export default function ArticleTable({
  keywordId,
  researchPlanId,
  tabType,
}: Props) {
  const dispatch = useDispatch();

  const filterState = useSelector(
    (state: RootState) => state.articleFilter[tabType],
  );
  const { page, size, search, included, yearFrom, yearTo, selectedTiers } =
    filterState;

  const { data, isLoading } = useQuery({
    queryKey: [
      'filtered-articles',
      researchPlanId,
      keywordId,
      page,
      size,
      search,
      included,
      yearFrom,
      yearTo,
      selectedTiers,
    ],
    queryFn: () =>
      getFilteredArticles({
        researchPlanId,
        keywordId,
        page,
        size,
        search,
        included,
        yearFrom,
        yearTo,
        tiers: selectedTiers.length > 0 ? selectedTiers : undefined,
      }),
    enabled: !!researchPlanId,
  });

  const articles: RawArticle[] = useMemo(() => data?.data ?? [], [data]);
  const totalItems = data?.total ?? 0;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearch({ tab: tabType, search: e.target.value }));
  };

  const handleIncludedChange = (e: any) => {
    const val = e.target.value;
    dispatch(
      setIncluded({
        tab: tabType,
        included: val === '' ? undefined : val === 'true',
      }),
    );
  };

  const handleTierChange = (event: any) => {
    const value = event.target.value;
    const tiers = typeof value === 'string' ? value.split(',') : value;
    dispatch(setSelectedTiers({ tab: tabType, tiers }));
  };

  const handleYearFromChange = (year: number | undefined) => {
    dispatch(setYearFrom({ tab: tabType, yearFrom: year }));
  };

  const handleYearToChange = (year: number | undefined) => {
    dispatch(setYearTo({ tab: tabType, yearTo: year }));
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    dispatch(setPage({ tab: tabType, page: newPage + 1 }));
  };

  const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSize({ tab: tabType, size: Number(event.target.value) }));
  };

  return (
    <>
      <Box
        sx={{
          p: 1,
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          alignItems: 'center',
          bgcolor: 'background.default',
          fontSize: 12,
          '& .MuiInputBase-input': {
            fontSize: 12,
          },
          '& .MuiInputLabel-root': {
            fontSize: 12,
          },
        }}
      >
        <TextField
          size="small"
          placeholder="Cari Judul / DOI"
          value={search}
          onChange={handleSearchChange}
          sx={{ width: 220, ...compactFieldSx }}
        />

        <FormControl size="small" sx={{ width: 120, ...compactFieldSx }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={included === undefined ? '' : String(included)}
            label="Status"
            onChange={handleIncludedChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Included</MenuItem>
            <MenuItem value="false">Excluded</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ width: 150, ...compactFieldSx }}>
          <InputLabel>Tier</InputLabel>
          <Select
            multiple
            value={selectedTiers}
            onChange={handleTierChange}
            input={<OutlinedInput label="Tier" />}
            renderValue={(selected) => {
              const selectedArray = selected as string[];
              const displayTiers = selectedArray.slice(0, 2);
              const remainingCount = selectedArray.length - 2;

              return (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {displayTiers.map((value) => (
                    <Chip
                      key={value}
                      label={value.toUpperCase()}
                      size="small"
                      color={
                        value === 'q1'
                          ? 'success'
                          : value === 'q2'
                            ? 'primary'
                            : value === 'q3'
                              ? 'warning'
                              : 'error'
                      }
                      sx={{ fontSize: 11, height: 22 }}
                    />
                  ))}
                  {remainingCount > 0 && (
                    <Chip
                      label={`+${remainingCount}`}
                      size="small"
                      sx={{ fontSize: 11, height: 22, bgcolor: 'grey.300' }}
                    />
                  )}
                </Box>
              );
            }}
          >
            {TIER_OPTIONS.map((tier) => (
              <MenuItem key={tier} value={tier}>
                <Checkbox
                  checked={selectedTiers.indexOf(tier) > -1}
                  size="small"
                />
                <ListItemText primary={tier.toUpperCase()} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <YearRangePicker
          yearFrom={yearFrom}
          yearTo={yearTo}
          onYearFromChange={handleYearFromChange}
          onYearToChange={handleYearToChange}
        />
      </Box>

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
                <TableCell sx={{ fontSize: 11, fontWeight: 800 }}>
                  STATUS
                </TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 800 }}>
                  TIER
                </TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 800 }}>
                  DOI
                </TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 800 }}>
                  LINK
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : articles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
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

                    <TableCell sx={{ fontSize: 12 }}>
                      {article.included ? (
                        <Chip
                          size="small"
                          label="Included"
                          color="success"
                          sx={{ fontSize: 11, height: 22 }}
                        />
                      ) : (
                        <Chip
                          size="small"
                          label="Excluded"
                          color="error"
                          sx={{ fontSize: 11, height: 22 }}
                        />
                      )}
                      {article.article_status ? (
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            color: getArticleStatusColor(
                              article.article_status,
                            ),
                            lineHeight: 1.35,
                          }}
                        >
                          {article.article_status}
                        </Typography>
                      ) : null}
                    </TableCell>

                    <TableCell>
                      {article.tier ? (
                        <Chip
                          size="small"
                          label={article.tier.toUpperCase()}
                          color={
                            article.tier === 'q1'
                              ? 'success'
                              : article.tier === 'q2'
                                ? 'primary'
                                : article.tier === 'q3'
                                  ? 'warning'
                                  : 'error'
                          }
                          sx={{ fontSize: 11, height: 22 }}
                        />
                      ) : (
                        <Chip
                          size="small"
                          label="-"
                          color="default"
                          sx={{ fontSize: 11, height: 22 }}
                        />
                      )}
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
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleSizeChange}
          rowsPerPageOptions={[5, 10, 20, 50]}
        />
      </Box>
    </>
  );
}
