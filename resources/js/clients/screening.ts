import {
  FilteredArticle,
  PaginationResponse,
} from '@/pages/prisma/screening/types';

const getCsrfToken = () =>
  document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ??
  '';
export const getPurificationArticles = async ({
  researchPlanId,
  page = 1,
  size = 10,
}: {
  researchPlanId: number;
  page?: number;
  size?: number;
}): Promise<PaginationResponse<FilteredArticle>> => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  const res = await fetch(
    `/research-plans/${researchPlanId}/purification?${params.toString()}`,
    {
      headers: {
        Accept: 'application/json',
      },
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message ?? 'Gagal mengambil data purification');
  }

  return data;
};

export const getAllPurificationArticles = async ({
  researchPlanId,
}: {
  researchPlanId: number;
}): Promise<FilteredArticle[]> => {
  const res = await fetch(
    `/research-plans/${researchPlanId}/purification/all`,
    {
      headers: {
        Accept: 'application/json',
      },
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message ?? 'Gagal mengambil seluruh artikel');
  }

  return data;
};

export const updatePurificationStatus = async ({
  filteredArticleId,
  included,
}: {
  filteredArticleId: number;
  included: boolean;
}) => {
  const res = await fetch('/purification/update-status', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-CSRF-TOKEN': getCsrfToken(),
    },
    body: JSON.stringify({
      filtered_article_id: filteredArticleId,
      included,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message ?? 'Gagal mengubah status');
  }

  return data;
};

export const updateAllPurificationStatus = async ({
  researchPlanId,
  included,
}: {
  researchPlanId: number;
  included: boolean;
}) => {
  const res = await fetch('/purification/update-all-status', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-CSRF-TOKEN': getCsrfToken(),
    },
    body: JSON.stringify({
      research_plan_id: researchPlanId,
      included,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message ?? 'Gagal mengubah status');
  }

  return data;
};
