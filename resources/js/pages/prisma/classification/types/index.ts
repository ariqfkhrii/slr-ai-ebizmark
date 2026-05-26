export type ClassificationCategory = {
  id: number;
  name: string;
};

export type ClassificationArticle = {
  id: number;
  title: string;
  authors: string;
  country: string;
  publishYear: number | null;
  researchMethod: string;
  classifications: Record<number, string>;
};
