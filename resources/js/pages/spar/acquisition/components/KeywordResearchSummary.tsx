import { Box, Typography } from '@mui/material';
import { Keyword } from '../types';

type Props = {
  keyword: Keyword;
  sourceDatabase?: string;
};

function SummaryCard({
  label,
  value,
  caption,
}: {
  label: string;
  value: number;
  caption: string;
}) {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: '#f8fafc',
        borderRadius: 2,
        border: '1px solid #e2e8f0',
      }}
    >
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}>
        {label}
      </Typography>

      <Typography sx={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>
        {value}
      </Typography>

      <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.75 }}>
        {caption}
      </Typography>
    </Box>
  );
}

export default function KeywordResearchSummary({
  keyword,
  sourceDatabase,
}: Props) {
  const articleCount = keyword.retrievedCount ?? 0;
  const duplicateCount = keyword.duplicateCount ?? 0;
  const unmatchedTierCount = keyword.unmatchedTierCount ?? 0;
  const missingDoiCount = keyword.missingDoiCount ?? 0;
  const outOfYearRangeCount = keyword.outOfYearRangeCount ?? 0;

  const isScopus = (sourceDatabase ?? '').toLowerCase() === 'scopus';
  const totalPreviewCount =
    articleCount +
    duplicateCount +
    (isScopus ? unmatchedTierCount : 0) +
    missingDoiCount;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: '2fr 1fr 1fr',
        },
        gap: 1,
      }}
    >
      {/* Hero Card */}
      <Box
        sx={{
          gridRow: {
            md: 'span 3',
          },
          p: 3,
          bgcolor: '#f8fafc',
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            fontSize: 14,
            color: 'text.secondary',
            mb: 1,
          }}
        >
          Artikel Diperoleh
        </Typography>

        <Typography
          sx={{
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          {articleCount}
        </Typography>

        <Typography
          sx={{
            mt: 2,
            fontSize: 12,
            color: 'text.secondary',
          }}
        >
          Jumlah artikel yang berhasil diperoleh setelah proses filtering.
        </Typography>
      </Box>

      <SummaryCard
        label="Total Artikel Preview"
        value={totalPreviewCount}
        caption="Total keseluruhan artikel yang didapatkan ketika preview."
      />

      <SummaryCard
        label="Duplikat"
        value={duplicateCount}
        caption="Artikel dengan identitas sama saat ditarik."
      />

      {isScopus && (
        <SummaryCard
          label="Tier tidak cocok"
          value={unmatchedTierCount}
          caption="Artikel dengan tier di luar rentang pilihan."
        />
      )}

      <SummaryCard
        label="Tanpa DOI"
        value={missingDoiCount}
        caption="Artikel yang tidak memiliki DOI."
      />
    </Box>
  );
}
