export type RawArticle = {
  // article_id: number;
  // country_id: number;
  doi: string;
  title: string;
  // issn: string;
  publish_year: number;
  tier: 'q1' | 'q2' | 'q3' | 'q4';
  // link: string;
  // abstract?: string;
  // citation_count?: number;
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
  resultCount: number;
  status: 'success' | 'failed';
  createdAt: string;
};
