import YearRangePicker from '@/components/table/YearRangePicker';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FilteredArticle } from '../types';
type Props = {
  title: string;
  articles: FilteredArticle[];
  actionLabel: 'Include' | 'Exclude';
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onCalculateRelevances?: () => void;
  calculateRelevancesPending?: boolean;
  articleStatus?: 'included' | 'excluded';
};

export function getSimilarityLabel(score: number | null | undefined): string {
  if (score == null || Number.isNaN(score)) {
    return '-';
  }
  if (score >= 0.8) return 'High Similarity';
  if (score >= 0.3) return 'Moderate Similarity';

  return 'Low Similarity';
}

export default function ScreeningTable({
  title,
  articles,
  actionLabel,
  selectedIds,
  onSelectionChange,
  onCalculateRelevances,
  calculateRelevancesPending,
  articleStatus,
}: Props) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [yearFrom, setYearFrom] = useState<number>();
  const [yearTo, setYearTo] = useState<number>();
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

  const filteredArticles = useMemo(() => {
    return articles.filter((item) => {
      const article = item.raw_article;

      const keyword = search.trim().toLowerCase();

      const matchSearch =
        keyword === '' ||
        article.title?.toLowerCase().includes(keyword) ||
        article.doi?.toLowerCase().includes(keyword);

      const matchTier =
        selectedTiers.length === 0 ||
        selectedTiers.includes(article.tier?.toLowerCase());

      const year = article.publish_year;

      const matchYear =
        (!yearFrom || year >= yearFrom) && (!yearTo || year <= yearTo);

      return matchSearch && matchTier && matchYear;
    });
  }, [articles, search, selectedTiers, yearFrom, yearTo]);

  const toggleRow = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const sortedArticles = useMemo(() => {
    return [...filteredArticles].sort((a, b) => {
      const scoreA = a.similarity_score ?? Number.NEGATIVE_INFINITY;
      const scoreB = b.similarity_score ?? Number.NEGATIVE_INFINITY;

      return sortDirection === 'asc' ? scoreA - scoreB : scoreB - scoreA;
    });
  }, [filteredArticles, sortDirection]);

  const rankedArticles = useMemo(() => {
    return [...filteredArticles]
      .filter((article) => article.similarity_score != null)
      .sort((a, b) => (b.similarity_score ?? 0) - (a.similarity_score ?? 0))
      .map((article, index) => ({
        id: article.filtered_article_id,
        rank: index + 1,
      }));
  }, [filteredArticles]);

  const rankMap = useMemo(() => {
    return Object.fromEntries(
      rankedArticles.map((item) => [item.id, item.rank]),
    );
  }, [rankedArticles]);

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
  }, [sortedArticles.length]);

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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={`${articles.length} Artikel`}
            color={actionLabel === 'Include' ? 'error' : 'success'}
            size="small"
            sx={{ p: 1 }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          p: 1,
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          alignItems: 'center',
          bgcolor: 'background.default',
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
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 220, ...compactFieldSx }}
        />

        <FormControl size="small" sx={{ width: 150, ...compactFieldSx }}>
          <InputLabel>Tier</InputLabel>

          <Select
            multiple
            value={selectedTiers}
            onChange={(e) =>
              setSelectedTiers(
                typeof e.target.value === 'string'
                  ? e.target.value.split(',')
                  : e.target.value,
              )
            }
            input={<OutlinedInput label="Tier" />}
            renderValue={(selected) => {
              const tiers = selected as string[];
              const display = tiers.slice(0, 2);
              const remain = tiers.length - 2;

              return (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {display.map((tier) => (
                    <Chip
                      key={tier}
                      size="small"
                      label={tier.toUpperCase()}
                      color={
                        tier === 'q1'
                          ? 'success'
                          : tier === 'q2'
                            ? 'primary'
                            : tier === 'q3'
                              ? 'warning'
                              : 'error'
                      }
                      sx={{
                        fontSize: 11,
                        height: 22,
                      }}
                    />
                  ))}

                  {remain > 0 && (
                    <Chip
                      label={`+${remain}`}
                      size="small"
                      sx={{
                        fontSize: 11,
                        height: 22,
                      }}
                    />
                  )}
                </Box>
              );
            }}
          >
            {TIER_OPTIONS.map((tier) => (
              <MenuItem key={tier} value={tier}>
                <Checkbox checked={selectedTiers.includes(tier)} />

                <ListItemText primary={tier.toUpperCase()} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <YearRangePicker
          yearFrom={yearFrom}
          yearTo={yearTo}
          onYearFromChange={setYearFrom}
          onYearToChange={setYearTo}
        />

        {articleStatus === 'included' && (
          <Button
            size="small"
            variant="contained"
            onClick={onCalculateRelevances}
            disabled={calculateRelevancesPending}
            sx={{
              height: 32,
              minHeight: 32,
              fontSize: 12,
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: 1,
            }}
          >
            Urutkan Relevansi
          </Button>
        )}
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
              <TableCell width={48} />
              {hasSimilarity && (
                <TableCell width={70} align="center">
                  Rank
                </TableCell>
              )}
              <TableCell width={70}>Tahun</TableCell>
              <TableCell>Judul</TableCell>
              <TableCell width={70}>Tier</TableCell>
              <TableCell width={90}>Sitasi</TableCell>
              <TableCell width={70}>DOI</TableCell>
              {hasSimilarity && (
                <>
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
                  <TableCell width={70}>Label</TableCell>
                </>
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
              const rank = rankMap[item.filtered_article_id];

              return (
                <>
                  <TableRow hover key={item.filtered_article_id}>
                    <TableCell padding="checkbox">
                      <IconButton
                        size="small"
                        onClick={() => toggleRow(item.filtered_article_id)}
                      >
                        {expandedRows.includes(item.filtered_article_id) ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </IconButton>
                    </TableCell>
                    {hasSimilarity && (
                      <TableCell align="center">
                        <Typography
                          sx={{
                            fontWeight: 400,
                          }}
                        >
                          {rank ?? '-'}
                        </Typography>
                      </TableCell>
                    )}
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
                      <Chip
                        size="small"
                        label={article.tier ? article.tier.toUpperCase() : '-'}
                      />
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
                      <>
                        <TableCell align="center">
                          {item.similarity_score?.toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          {getSimilarityLabel(
                            Number(item.similarity_score?.toFixed(2)),
                          )}
                        </TableCell>
                      </>
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
                  <TableRow>
                    <TableCell
                      colSpan={hasSimilarity ? 8 : 7}
                      sx={{
                        py: 0,
                        borderBottom: 0,
                      }}
                    >
                      <Collapse
                        in={expandedRows.includes(item.filtered_article_id)}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box
                          sx={{
                            px: 2,
                            py: 2,
                            bgcolor: 'grey.50',
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              mb: 0.5,
                            }}
                          >
                            Abstrak
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              whiteSpace: 'pre-wrap',
                              mb: 2,
                            }}
                          >
                            {article.abstract?.trim()
                              ? article.abstract
                              : 'Abstrak artikel tidak tersedia'}
                          </Typography>

                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              mb: 0.5,
                            }}
                          >
                            Kata Kunci
                          </Typography>

                          <Typography variant="body2" color="text.secondary">
                            {article.keyword?.trim()
                              ? article.keyword
                              : 'Kata kunci artikel tidak tersedia'}
                          </Typography>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={sortedArticles.length}
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
