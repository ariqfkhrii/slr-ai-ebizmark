import { useAppDispatch } from '@/lib/store/hooks';
import { showSuccess } from '@/lib/store/snackbarSlice';
import { useState } from 'react';
import { FetchParams } from '../components/dialog/FetchParameterDialog';
import { getRandomArticles } from '../mock/randomArticles';
import { FetchHistory, Keyword } from '../types';

export function useIdentification() {
  const dispatch = useAppDispatch();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [histories, setHistories] = useState<FetchHistory[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selectedKeyword = keywords.find((k) => k.id === selectedId) || null;

  const addKeyword = (name: string) => {
    if (!name.trim()) return;

    const newKeyword: Keyword = {
      id: Date.now(),
      name,
      retrievedCount: 0,
    };

    setKeywords((prev) => [...prev, newKeyword]);
  };

  const deleteKeyword = (id: number) => {
    setKeywords((prev) => prev.filter((k) => k.id !== id));
    dispatch(showSuccess('Keyword berhasil dihapus!'));
    if (selectedId === id) setSelectedId(null);
  };

  const updateKeyword = (id: number, name: string) => {
    setKeywords((prev) =>
      prev.map((keyword) =>
        keyword.id === id ? { ...keyword, name } : keyword,
      ),
    );
    dispatch(showSuccess(`Keyword diubah ke "${name}"`));
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
    addKeyword,
    deleteKeyword,
    selectKeyword,
    updateKeyword,
    fetchMetadata,
  };
}
