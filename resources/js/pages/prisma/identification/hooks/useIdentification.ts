import { useAppDispatch } from '@/lib/store/hooks';
import { showSuccess } from '@/lib/store/snackbarSlice';
import { useEffect, useState } from 'react';
import { FetchParams } from '../components/dialog/FetchParameterDialog';
import { getRandomArticles } from '../mock/randomArticles';
import { FetchHistory, Keyword } from '../types';

type ApiKeyword = {
  id: number;
  name: string;
  article_count: number;
};

const getCsrfToken = () =>
  document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ??
  '';

export function useIdentification(researchPlanId: number) {
  const dispatch = useAppDispatch();

  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [histories, setHistories] = useState<FetchHistory[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loadingKeywords, setLoadingKeywords] = useState(false);

  const selectedKeyword = keywords.find((k) => k.id === selectedId) || null;

  const fetchKeywords = async () => {
    if (!researchPlanId) return;

    setLoadingKeywords(true);

    try {
      const res = await fetch(`/research-plans/${researchPlanId}/keywords`, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!res.ok) throw new Error('Gagal mengambil keyword');

      const data: ApiKeyword[] = await res.json();

      setKeywords(
        data.map((item) => ({
          id: item.id,
          name: item.name,
          retrievedCount: item.article_count ?? 0,
        })),
      );
    } finally {
      setLoadingKeywords(false);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, [researchPlanId]);

  const addKeyword = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const res = await fetch(`/research-plans/${researchPlanId}/keywords`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-CSRF-TOKEN': getCsrfToken(),
      },
      body: JSON.stringify({ keyword: trimmed }),
    });

    if (!res.ok) throw new Error('Gagal menambah keyword');

    await fetchKeywords();

    dispatch(showSuccess('Keyword berhasil ditambahkan!'));
  };

  const deleteKeyword = async (id: number) => {
    const res = await fetch(
      `/research-plans/${researchPlanId}/keywords/${id}`,
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
      },
    );

    if (!res.ok) throw new Error('Gagal menghapus keyword');

    if (selectedId === id) setSelectedId(null);

    await fetchKeywords();

    dispatch(showSuccess('Keyword berhasil dihapus!'));
  };

  const updateKeyword = async (id: number, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const res = await fetch(`/research-plans/${researchPlanId}/keywords`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-CSRF-TOKEN': getCsrfToken(),
      },
      body: JSON.stringify({
        old_keyword_id: id,
        new_keyword: trimmed,
      }),
    });

    if (!res.ok) throw new Error('Gagal mengubah keyword');

    await fetchKeywords();

    dispatch(showSuccess(`Keyword diubah ke "${trimmed}"`));
  };

  const selectKeyword = (id: number) => {
    setSelectedId(id);
  };

  const fetchMetadata = async (keywordId: number, params: FetchParams) => {
    console.log('FETCH PARAMS: ', params);

    const currentKeyword = keywords.find((keyword) => keyword.id === keywordId);

    if (!currentKeyword) return;

    const isUpdate = (currentKeyword.retrievedCount ?? 0) > 0;

    await new Promise((resolve) => setTimeout(resolve, 500));

    const articles = getRandomArticles(10);

    setKeywords((prev) =>
      prev.map((keyword) =>
        keyword.id === keywordId
          ? {
              ...keyword,
              retrievedCount: articles.length,
              articles,
            }
          : keyword,
      ),
    );

    setHistories((prev) => [
      {
        id: Date.now(),
        keywordId,
        keywordName: currentKeyword.name,
        action: isUpdate ? 'update' : 'fetch',
        yearFrom: params.yearFrom,
        yearTo: params.yearTo,
        tiers: params.tiers,
        includeAbstract: params.includeAbstract,
        resultCount: articles.length,
        status: 'success',
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    dispatch(
      showSuccess(
        isUpdate ? 'Metadata berhasil diperbarui!' : 'Berhasil fetch metadata!',
      ),
    );
  };

  return {
    keywords,
    histories,
    selectedKeyword,
    loadingKeywords,
    fetchKeywords,
    addKeyword,
    deleteKeyword,
    selectKeyword,
    updateKeyword,
    fetchMetadata,
  };
}
