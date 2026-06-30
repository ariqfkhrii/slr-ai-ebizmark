import { Box, Card, CardContent, Grid, LinearProgress, Typography } from '@mui/material';

type Props = {
  researchPlanTitle: string;
  researchPlanId: number | string;
  includedArticles: number;
  reportItems: number;
  generatedCount?: number;
};

export default function AutoReportingSummaryCards({
  researchPlanTitle,
  researchPlanId,
  includedArticles,
  reportItems,
  generatedCount = 0,
}: Props) {
  const progress = reportItems > 0 ? Math.round((generatedCount / reportItems) * 100) : 0;

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, md: 3 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="overline" color="text.secondary">Research Plan</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 15 }} noWrap>{researchPlanTitle || 'Research Plan'}</Typography>
            <Typography variant="body2" color="text.secondary">ID: {researchPlanId ?? '-'}</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="overline" color="text.secondary">Included Articles</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>{includedArticles}</Typography>
            <Typography variant="body2" color="text.secondary">Digunakan sebagai konteks AI</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="overline" color="text.secondary">PRISMA Sections</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>{reportItems}</Typography>
            <Typography variant="body2" color="text.secondary">Introduction · Methods · Results · Discussion</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="overline" color="text.secondary">AI Generated</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>{generatedCount}</Typography>
            <Box sx={{ mt: 1 }}>
              <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 1, height: 6 }} />
              <Typography variant="caption" color="text.secondary">{progress}% selesai</Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
