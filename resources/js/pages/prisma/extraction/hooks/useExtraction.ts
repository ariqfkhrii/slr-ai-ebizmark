import { useMemo, useState } from 'react';
import { defaultExtractionForm, dummyExtractionArticles } from '../mock';
import { ExtractionFormValues } from '../types';

export function useExtraction() {
  const [articles, setArticles] = useState(dummyExtractionArticles);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(
    null,
  );

  const [formValues, setFormValues] = useState<ExtractionFormValues>(
    defaultExtractionForm,
  );

  const selectedArticle = useMemo(
    () => articles.find((item) => item.id === selectedArticleId) ?? null,
    [articles, selectedArticleId],
  );

  const openExtraction = (articleId: number) => {
    setSelectedArticleId(articleId);

    setFormValues({
      ...defaultExtractionForm,
      abstract: 'Abstract artikel lorem ipsum sit amet.',
      introduction: 'N/A',
      result: 'Result artikel lorem ipsum sit amet.',
      country: 'Malaysia',
      focusOn: 'Primate ecology',
      researchMethod: 'Historical case study',
      usingStimulus: 'Yes',
    });
  };

  const closeExtraction = () => {
    setSelectedArticleId(null);
  };

  const updateField = <K extends keyof ExtractionFormValues>(
    key: K,
    value: ExtractionFormValues[K],
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveExtraction = () => {
    if (!selectedArticleId) return;

    setArticles((prev) =>
      prev.map((article) =>
        article.id === selectedArticleId
          ? {
              ...article,
              status: 'extracted',
            }
          : article,
      ),
    );

    setSelectedArticleId(null);
  };

  const synchronizePdf = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
  };

  const synchronizeArticle = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
  };

  return {
    articles,
    selectedArticle,
    formValues,
    openExtraction,
    closeExtraction,
    updateField,
    saveExtraction,
    synchronizePdf,
    synchronizeArticle,
  };
}
