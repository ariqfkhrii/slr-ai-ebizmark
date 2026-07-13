import { Box, Typography } from '@mui/material';
import { Keyword } from '../types';

type Props = {
  keyword: Keyword;
};

export default function KeywordResearchSummary({ keyword }: Props) {
  const articleCount = keyword.retrievedCount ?? 0;
  const duplicateCount = keyword.duplicateCount ?? 0;
  const unmatchedTierCount = keyword.unmatchedTierCount ?? 0;
  const missingDoiCount = keyword.missingDoiCount ?? 0;
  const outOfYearRangeCount = keyword.outOfYearRangeCount ?? 0;

  const totalPreviewCount =
    articleCount + duplicateCount + unmatchedTierCount + missingDoiCount;

  const summaryItems = [
    {
      label: 'Total Artikel Preview',
      value: totalPreviewCount,
      caption: 'Total keseluruhan artikel yang didapatkan ketika preview.',
    },
    {
      label: 'Artikel Diperoleh',
      value: articleCount,
      caption: 'Jumlah artikel yang berhasil diperoleh setelah proses filtering.',
    },
    {
      label: 'Duplikat',
      value: duplicateCount,
      caption:
        'Artikel dengan identitas sama saat ditarik, atau sudah didapatkan dari keyword lain.',
    },
    {
      label: 'Tier tidak cocok',
      value: unmatchedTierCount,
      caption: 'Artikel dengan tier di luar rentang pilihan.',
    },
    {
      label: 'Tanpa DOI',
      value: missingDoiCount,
      caption: 'Artikel yang tidak memiliki DOI.',
    },
    {
      label: 'Di luar tahun',
      value: outOfYearRangeCount,
      caption: 'Artikel yang berada di luar rentang tahun yang ditentukan.',
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          sm: 'repeat(3, minmax(0, 1fr))',
        },
        gap: 1,
        pb: 1,
      }}
    >
      {summaryItems.map((item) => (
        <Box
          key={item.label}
          sx={{
            p: 2,
            bgcolor: '#f8fafc',
            borderRadius: 2,
            border: '1px solid #e2e8f0',
          }}
        >
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}>
            {item.label}
          </Typography>
          <Typography sx={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>
            {item.value}
          </Typography>
          <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.75 }}>
            {item.caption}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
