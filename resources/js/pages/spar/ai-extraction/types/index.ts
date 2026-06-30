export type ExtractionArticle = {
  id: number;
  title: string;
  authors: string;
  publishYear: number | null;
  abstract: string;
  introduction: string;
  result: string;
  conclusion: string;
  recommendation: string;
  noveltyGap: string;
  limitation: string;
  futureResearch: string;
};
