import {
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Typography,
} from '@mui/material';

type Props = {
  includedArticles: number;
  reportItems: number;
  generatedCount?: number;
};

export default function AutoReportingSummaryCards({
  includedArticles,
  reportItems,
  generatedCount = 0,
}: Props) {
  const progress =
    reportItems > 0 ? Math.round((generatedCount / reportItems) * 100) : 0;

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
        <Card variant="outlined" sx={{ width: '100%', display: 'flex' }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Artikel di-include
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {includedArticles}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Digunakan sebagai konteks laporan
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
        <Card variant="outlined" sx={{ width: '100%', display: 'flex' }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              PRISMA Sections
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {reportItems}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Introduction · Methods · Results · Discussion
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
        <Card variant="outlined" sx={{ width: '100%', display: 'flex' }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Bagian Selesai
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {generatedCount}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ borderRadius: 1, height: 6 }}
              />
              <Typography variant="caption" color="text.secondary">
                {progress}% selesai
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
