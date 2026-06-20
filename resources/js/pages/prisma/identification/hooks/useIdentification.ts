import { FetchParams } from '../components/dialog/FetchParameterDialog';

const getCsrfToken = () =>
  document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ??
  '';

export const getKeywords = async (researchPlanId: number) => {
  const res = await fetch(`/research-plans/${researchPlanId}/keywords`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Gagal mengambil keyword');
  }

  return await res.json();
};

export const createKeyword = async (
  researchPlanId: number,
  keyword: string,
) => {
  const res = await fetch(`/research-plans/${researchPlanId}/keywords`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-CSRF-TOKEN': getCsrfToken(),
    },
    body: JSON.stringify({
      keyword,
    }),
  });

  if (!res.ok) {
    throw new Error('Gagal menambah keyword');
  }

  return await res.json();
};

export const updateKeyword = async (
  researchPlanId: number,
  id: number,
  name: string,
) => {
  const res = await fetch(`/research-plans/${researchPlanId}/keywords`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-CSRF-TOKEN': getCsrfToken(),
    },
    body: JSON.stringify({
      old_keyword_id: id,
      new_keyword: name,
    }),
  });

  if (!res.ok) {
    throw new Error('Gagal mengubah keyword');
  }

  return await res.json();
};

export const deleteKeyword = async (
  researchPlanId: number,
  keywordId: number,
) => {
  const res = await fetch(
    `/research-plans/${researchPlanId}/keywords/${keywordId}`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'X-CSRF-TOKEN': getCsrfToken(),
      },
    },
  );

  if (!res.ok) {
    throw new Error('Gagal menghapus keyword');
  }
};

export const previewMetadata = async (
  researchPlanId: number,
  keywordId: number,
  params: FetchParams,
) => {
  const res = await fetch(
    `/research-plans/${researchPlanId}/metadata/preview`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-CSRF-TOKEN': getCsrfToken(),
      },
      body: JSON.stringify({
        keyword_id: keywordId,
        start_year: params.yearFrom,
        end_year: params.yearTo,
      }),
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message ?? 'Gagal mengambil preview metadata');
  }

  return data;
};

export const executeMetadata = async (
  researchPlanId: number,
  keywordId: number,
  params: FetchParams,
) => {
  const res = await fetch(
    `/research-plans/${researchPlanId}/metadata/execute`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-CSRF-TOKEN': getCsrfToken(),
      },
      body: JSON.stringify({
        keyword_id: keywordId,
        start_year: params.yearFrom,
        end_year: params.yearTo,
        tiers: params.tiers,
        can_execute: true,
      }),
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message ?? 'Gagal menjalankan metadata search');
  }

  return data;
};

export const getBatchProgress = async (batchId: string) => {
  const res = await fetch(`/metadata/batches/${batchId}/progress`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Gagal mengambil progress batch');
  }

  return await res.json();
};

export const getFilteredArticles = async ({
  keywordId,
  researchPlanId,
  page = 1,
  size = 10,
}: {
  keywordId?: number;
  researchPlanId: number;
  page?: number;
  size?: number;
}) => {
  const params = new URLSearchParams();

  if (keywordId) {
    params.append('keyword_id', String(keywordId));
  }
  params.append('research_plan_id', String(researchPlanId));
  params.append('page', String(page));
  params.append('size', String(size));

  const res = await fetch(`/filtered-articles?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message ?? 'Gagal mengambil filtered articles');
  }

  return data;
};
