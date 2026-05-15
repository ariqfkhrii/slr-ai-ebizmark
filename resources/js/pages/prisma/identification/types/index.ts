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

export type FetchHistory = {
  id: number;
  keywordId: number;
  keywordName: string;
  action: 'fetch' | 'update';
  yearFrom: number;
  yearTo: number;
  tiers: string[];
  includeAbstract: boolean;
  resultCount: number;
  status: 'success' | 'failed';
  createdAt: string;
};
