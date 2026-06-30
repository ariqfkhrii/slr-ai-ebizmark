import { Head } from '@inertiajs/react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import AutoReportingDetailDialog from './components/AutoReportingDetailDialog';
import AutoReportingChapterPanel from './components/AutoReportingChapterPanel';
import AutoReportingItemCard from './components/AutoReportingItemCard';
import AutoReportingSummaryCards from './components/AutoReportingSummaryCards';
import { chapterOrder, useAutoReporting } from './hooks/useAutoReporting';

export default function AutoReportingPage(props: any) {
  const filteredArticles = props.filteredArticles ?? [];
  const ar = useAutoReporting(props);

  return (
    <>
      <Head title="Auto Reporting" />
      <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Auto Reporting
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Generate narasi laporan SLR berbasis PRISMA secara otomatis menggunakan Gemini 2.5 Flash.
        </Typography>

        <AutoReportingSummaryCards
          researchPlanTitle={props.researchPlan?.title ?? 'Research Plan'}
          researchPlanId={props.researchPlanId ?? '-'}
          includedArticles={filteredArticles.length}
          reportItems={ar.items.length}
          generatedCount={ar.generatedCount}
        />

        {/* Chapter Tabs */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent sx={{ pb: '12px !important' }}>
            <Tabs
              value={ar.activeChapter}
              onChange={(_, value) => ar.setActiveChapter(value)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {chapterOrder.map((chapter) => {
                const group = ar.groupedItems.find((g) => g.chapter === chapter);
                const count = group?.items?.length ?? 0;
                const generated = group?.items?.filter((i: any) => i.status === 'generated').length ?? 0;
                return (
                  <Tab
                    key={chapter}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        {chapter}
                        <Chip
                          size="small"
                          label={`${generated}/${count}`}
                          sx={{ height: 18, fontSize: 10, '& .MuiChip-label': { px: 0.75 } }}
                        />
                      </Box>
                    }
                    value={chapter}
                  />
                );
              })}
            </Tabs>
          </CardContent>
        </Card>

        {/* Chapter Panel */}
        <Stack spacing={2}>
          {ar.currentGroup && (
            <AutoReportingChapterPanel
              chapter={ar.currentGroup.chapter}
              items={ar.currentGroup.items}
              processingIds={ar.processingIds}
              onProcessChapter={ar.processChapter}
              renderItem={(item: any) => (
                <AutoReportingItemCard
                  key={item.id}
                  item={item}
                  processing={ar.processingIds.has(Number(item.id))}
                  onProcess={ar.processItem}
                  onRegenerate={ar.regenerateItem}
                  onOpenDetail={ar.openDetail}
                />
              )}
            />
          )}
        </Stack>

        {/* Edit Dialog */}
        <AutoReportingDetailDialog
          open={ar.openDialog}
          item={ar.selectedItem}
          draftContent={ar.draftContent}
          onClose={() => ar.setOpenDialog(false)}
          onChangeContent={ar.setDraftContent}
          onSave={ar.saveDetail}
        />
      </Box>
    </>
  );
}
