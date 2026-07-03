import { Head } from '@inertiajs/react';
import { Box, Card, CardContent, Chip, Stack, Tab, Tabs } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useBreadcrumb } from '../components/BreadcrumbContext';
import { useGuide } from '../components/spar-layout';
import AutoReportingGuide from '../guides/AutoReportingGuide';
import AutoReportingChapterPanel from './components/AutoReportingChapterPanel';
import AutoReportingDetailDialog from './components/AutoReportingDetailDialog';
import AutoReportingItemCard from './components/AutoReportingItemCard';
import AutoReportingSummaryCards from './components/AutoReportingSummaryCards';
import { chapterOrder, useAutoReporting } from './hooks/useAutoReporting';

export default function AutoReportingPage(props: any) {
  const filteredArticles = props.filteredArticles ?? [];
  const ar = useAutoReporting(props);

  const guideContent = useMemo(() => <AutoReportingGuide />, []);
  const { setTitle } = useBreadcrumb();
  const { guideOpen } = useGuide({
    title: 'Auto Reporting',
    content: guideContent,
  });

  useEffect(() => {
    setTitle('Auto Reporting');
  }, [setTitle]);

  return (
    <>
      <Head title="Auto Reporting" />
      <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
        <AutoReportingSummaryCards
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
                const group = ar.groupedItems.find(
                  (g) => g.chapter === chapter,
                );
                const count = group?.items?.length ?? 0;
                const generated =
                  group?.items?.filter((i: any) => i.status === 'generated')
                    .length ?? 0;
                return (
                  <Tab
                    key={chapter}
                    label={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75,
                        }}
                      >
                        {chapter}
                        <Chip
                          size="small"
                          label={`${generated}/${count}`}
                          sx={{
                            height: 18,
                            fontSize: 10,
                            '& .MuiChip-label': { px: 0.75 },
                          }}
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
