export type RawArticle = {
  article_id: number;
  country_id: number;
  title: string;
  publish_year: number;
  tier: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  doi: string;
  issn: string;
  link: string;
};

export type Keyword = {
  id: number;
  name: string;
  retrievedCount?: number;
  articles?: RawArticle[];
};

export type IdentificationState = {
  keywords: Keyword[];
  selectedKeyword: Keyword | null;
};
