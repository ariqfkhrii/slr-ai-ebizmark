import { useAppDispatch } from '@/lib/store/hooks';
import { showSuccess } from '@/lib/store/snackbarSlice';
import { useState } from 'react';
import { FetchParams } from '../components/dialog/FetchParameterDialog';
import { mockRawArticles } from '../mock/rawArticles';
import { Keyword } from '../types';

export function useIdentification() {
  const dispatch = useAppDispatch();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
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
    await new Promise((resolve) => setTimeout(resolve, 500));

    const articles = mockRawArticles;

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
  };

  return {
    keywords,
    selectedKeyword,
    addKeyword,
    deleteKeyword,
    selectKeyword,
    updateKeyword,
    fetchMetadata,
  };
}
