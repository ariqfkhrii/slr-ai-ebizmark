import { Box, Typography } from '@mui/material';
import { RawArticle } from '../types';

type Props = {
  articles: RawArticle[];
  title: string;
};

export default function ArticleYearChart({ articles, title }: Props) {
  const years = [2019, 2020, 2021, 2022, 2023, 2024];

  const data = years.map((year) => ({
    year,
    count: articles.filter((article) => article.publish_year === year).length,
  }));

  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        p: 1.5,
      }}
    >
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 800,
          color: 'text.secondary',
          textTransform: 'uppercase',
          mb: 1,
        }}
      >
        {title}
      </Typography>

      <Box
        sx={{
          height: 150,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
        }}
      >
        {data.map((item) => (
          <Box
            key={item.year}
            sx={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 0.75,
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 800,
                color: item.count > 0 ? '#14b8a6' : 'transparent',
              }}
            >
              {item.count}
            </Typography>

            <Box
              sx={{
                width: '100%',
                height: `${(item.count / maxCount) * 90}%`,
                minHeight: item.count > 0 ? 16 : 0,
                borderRadius: '4px 4px 0 0',
                background:
                  item.count === maxCount && item.count > 0
                    ? 'linear-gradient(to top, #0f766e, #2dd4bf)'
                    : 'linear-gradient(to top, #99f6e4, #5eead4)',
              }}
            />

            <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
              {item.year}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
