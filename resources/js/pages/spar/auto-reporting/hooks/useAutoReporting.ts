import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export const chapterOrder = ['Introduction', 'Methods', 'Results', 'Discussion'];

export const fallbackReportItems = [
  { id: 'intro-1', chapter: 'Introduction', title: 'Rationale', detail: 'Describe the rationale for the review in the context of existing knowledge.', status: 'draft', order_no: 1, generated_content: '', word_count: 0 },
  { id: 'intro-2', chapter: 'Introduction', title: 'Objectives', detail: 'Provide an explicit statement of the objective(s) or question(s) the review addresses.', status: 'draft', order_no: 2, generated_content: '', word_count: 0 },
  { id: 'methods-1', chapter: 'Methods', title: 'Eligibility Criteria', detail: 'Specify the inclusion and exclusion criteria for the review and how studies were grouped for the syntheses.', status: 'draft', order_no: 3, generated_content: '', word_count: 0 },
  { id: 'methods-2', chapter: 'Methods', title: 'Information Sources', detail: 'Specify all databases, registers, websites, organisations, reference lists and other sources searched or consulted to identify studies.', status: 'draft', order_no: 4, generated_content: '', word_count: 0 },
  { id: 'methods-3', chapter: 'Methods', title: 'Search Strategy', detail: 'Present the full search strategies for all databases, registers and websites, including any filters and limits used.', status: 'draft', order_no: 5, generated_content: '', word_count: 0 },
  { id: 'methods-4', chapter: 'Methods', title: 'Selection Process', detail: 'Specify the methods used to decide whether a study met the inclusion criteria of the review.', status: 'draft', order_no: 6, generated_content: '', word_count: 0 },
  { id: 'methods-5', chapter: 'Methods', title: 'Data Collection Process', detail: 'Specify the methods used to collect data from reports, including how many reviewers collected data from each report.', status: 'draft', order_no: 7, generated_content: '', word_count: 0 },
  { id: 'methods-6', chapter: 'Methods', title: 'Data Items', detail: 'List and define all outcomes and other variables for which data were sought.', status: 'draft', order_no: 8, generated_content: '', word_count: 0 },
  { id: 'methods-7', chapter: 'Methods', title: 'Study Risk of Bias Assessment', detail: 'Specify the methods used to assess risk of bias in the included studies.', status: 'draft', order_no: 9, generated_content: '', word_count: 0 },
  { id: 'methods-8', chapter: 'Methods', title: 'Effect Measures', detail: 'Specify for each outcome the effect measure(s) used in the synthesis or presentation of results.', status: 'draft', order_no: 10, generated_content: '', word_count: 0 },
  { id: 'methods-9', chapter: 'Methods', title: 'Synthesis Methods', detail: 'Describe the methods used to synthesise results and provide a rationale for the choice(s).', status: 'draft', order_no: 11, generated_content: '', word_count: 0 },
  { id: 'methods-10', chapter: 'Methods', title: 'Reporting Bias Assessment', detail: 'Describe any methods used to assess risk of bias due to missing results in a synthesis.', status: 'draft', order_no: 12, generated_content: '', word_count: 0 },
  { id: 'methods-11', chapter: 'Methods', title: 'Certainty Assessment', detail: 'Describe any methods used to assess certainty in the body of evidence.', status: 'draft', order_no: 13, generated_content: '', word_count: 0 },
  { id: 'results-1', chapter: 'Results', title: 'Study Selection', detail: 'Describe the results of the search and selection process, from the number of records identified to the number of studies included.', status: 'draft', order_no: 14, generated_content: '', word_count: 0 },
  { id: 'results-2', chapter: 'Results', title: 'Study Characteristics', detail: 'Cite each included study and present its characteristics.', status: 'draft', order_no: 15, generated_content: '', word_count: 0 },
  { id: 'results-3', chapter: 'Results', title: 'Risk of Bias in Studies', detail: 'Present assessments of risk of bias for each included study.', status: 'draft', order_no: 16, generated_content: '', word_count: 0 },
  { id: 'results-4', chapter: 'Results', title: 'Results of Individual Studies', detail: 'Present the findings of each study, including summary statistics and effect estimates where appropriate.', status: 'draft', order_no: 17, generated_content: '', word_count: 0 },
  { id: 'results-5', chapter: 'Results', title: 'Results of Syntheses', detail: 'Present results of all statistical syntheses conducted.', status: 'draft', order_no: 18, generated_content: '', word_count: 0 },
  { id: 'results-6', chapter: 'Results', title: 'Reporting Biases', detail: 'Present assessments of risk of bias due to missing results for each synthesis assessed.', status: 'draft', order_no: 19, generated_content: '', word_count: 0 },
  { id: 'results-7', chapter: 'Results', title: 'Certainty of Evidence', detail: 'Present assessments of certainty in the body of evidence for each outcome assessed.', status: 'draft', order_no: 20, generated_content: '', word_count: 0 },
  { id: 'discussion-1', chapter: 'Discussion', title: 'Interpretation of Results', detail: 'Provide a general interpretation of the results in the context of other evidence.', status: 'draft', order_no: 21, generated_content: '', word_count: 0 },
  { id: 'discussion-2', chapter: 'Discussion', title: 'Limitations of Evidence', detail: 'Discuss any limitations of the evidence included in the review.', status: 'draft', order_no: 22, generated_content: '', word_count: 0 },
  { id: 'discussion-3', chapter: 'Discussion', title: 'Limitations of Review Process', detail: 'Discuss any limitations of the review processes used.', status: 'draft', order_no: 23, generated_content: '', word_count: 0 },
  { id: 'discussion-4', chapter: 'Discussion', title: 'Implications for Practice, Policy, and Future Research', detail: 'Discuss implications of the results for practice, policy, and future research.', status: 'draft', order_no: 24, generated_content: '', word_count: 0 },
];

/** Ambil CSRF token dari meta tag Laravel */
function getCsrfToken(): string {
  return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
}

/** Request JSON ke route Laravel (non-Inertia JSON) */
async function apiRequest(
  url: string,
  method: 'POST' | 'PUT',
  body?: Record<string, unknown>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(url, {
      method,
      headers: {
        'X-CSRF-TOKEN': getCsrfToken(),
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json?.error ?? `HTTP ${res.status}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message ?? 'Network error' };
  }
}

export function useAutoReporting(props: any) {
  const rawItems =
    Array.isArray(props?.items) && props.items.length > 0 ? props.items : fallbackReportItems;

  const [activeChapter, setActiveChapter] = useState('Introduction');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [draftContent, setDraftContent] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  // Track which item IDs are currently being processed
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

  const generatedCount = rawItems.filter((item: any) => item.status === 'generated').length;

  const groupedItems = useMemo(
    () =>
      chapterOrder.map((chapter) => ({
        chapter,
        items: rawItems.filter((item: any) => item.chapter === chapter),
      })),
    [rawItems],
  );

  const currentGroup =
    groupedItems.find((group) => group.chapter === activeChapter) ?? groupedItems[0];

  // ──────────────────────────────────────────
  // View / Edit dialog
  // ──────────────────────────────────────────
  const openDetail = (item: any) => {
    setSelectedItem(item);
    setDraftContent(item.generated_content ?? '');
    setOpenDialog(true);
  };

  const saveDetail = async () => {
    if (!selectedItem) return;

    const result = await apiRequest(`/auto-reportings/${selectedItem.id}`, 'PUT', {
      generated_content: draftContent,
    });

    if (!result.success) {
      alert(`Gagal menyimpan: ${result.error}`);
      return;
    }

    setOpenDialog(false);
    setDraftContent('');
    setSelectedItem(null);

    router.reload({
      only: ['items'],
      preserveScroll: true,
    });
  };

  // ──────────────────────────────────────────
  // Disabled auto-generation actions; manual report editing only.
  // ──────────────────────────────────────────
  const setProcessing = (id: number, value: boolean) => {
    setProcessingIds((prev) => {
      const next = new Set(prev);
      value ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const processItem = async (_item: any): Promise<void> => {
    alert('Fitur otomatis dinonaktifkan. Silakan edit item secara manual.');
  };

  const regenerateItem = async (_item: any): Promise<void> => {
    alert('Fitur otomatis dinonaktifkan. Silakan edit item secara manual.');
  };

  const processChapter = async (_chapter: string) => {
    alert('Fitur otomatis dinonaktifkan. Silakan edit item secara manual.');
  };

  return {
    items: rawItems,
    groupedItems,
    currentGroup,
    activeChapter,
    setActiveChapter,
    selectedItem,
    draftContent,
    setDraftContent,
    openDialog,
    setOpenDialog,
    openDetail,
    saveDetail,
    processItem,
    regenerateItem,
    processChapter,
    generatedCount,
    processingIds,
  };
}
