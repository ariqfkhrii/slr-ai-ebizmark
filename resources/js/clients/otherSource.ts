const getCsrfToken = () =>
  document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ??
  '';

export interface StoreOtherSourcePayload {
  pdf: File;
  doi: string;
  title: string;
  authors: string;
  tier: string | null;
  articleKeyword: string;
  abstract: string;
  citationCount: number | null;
  publishYear: number | null;
  researchPlanKeywordId: number;
}

export const storeOtherSource = async (
  researchPlanId: number,
  payload: StoreOtherSourcePayload,
) => {
  const formData = new FormData();

  formData.append('pdf', payload.pdf);

  formData.append('doi', payload.doi);
  formData.append('title', payload.title);
  formData.append('authors', payload.authors);
  formData.append('article_keyword', payload.articleKeyword);
  formData.append(
    'research_plan_keyword_id',
    String(payload.researchPlanKeywordId),
  );

  formData.append('abstract', payload.abstract);
  formData.append('tier', String(payload.tier ?? null));
  formData.append('citation_count', String(payload.citationCount ?? ''));
  formData.append('publish_year', String(payload.publishYear ?? ''));
  const res = await fetch(`/research-plans/${researchPlanId}/other-source`, {
    method: 'POST',

    headers: {
      Accept: 'application/json',
      'X-CSRF-TOKEN': getCsrfToken(),
    },

    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message ?? 'Gagal mengunggah sumber lain.');
  }

  return data;
};

export const getResearchPlanKeywords = async (researchPlanId: number) => {
  const res = await fetch(
    `/research-plans/${researchPlanId}/available-keywords`,
    {
      headers: {
        Accept: 'application/json',
        'X-CSRF-TOKEN': getCsrfToken(),
      },
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message ?? 'Gagal mengambil keyword.');
  }

  return data;
};
