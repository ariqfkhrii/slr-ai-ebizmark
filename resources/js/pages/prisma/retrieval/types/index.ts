import type { ReactNode } from 'react';

export type ArticleItem = {
  id: number;
  title: string;
  doi: string;
  source: string;
  year: number | null;
  retrieved: boolean;
  note: string;
};

export type ResearchPlanSummary = {
  research_plan_id: number;
  title: string;
};

export type RawArticleSummary = {
  article_id: number;
  doi: string;
  title: string;
  authors: string | null;
  issn: string | null;
  publish_year: number | null;
  tier: string | null;
};

export type FilteredArticleSummary = {
  filtered_article_id: number;
  raw_article_id: number;
  research_plan_id: number;
  novelty_status: string | null;
  article_status: string;
  included: boolean;
  retrieved: boolean | number;
  raw_article: RawArticleSummary | null;
  review?: ReviewSummary | null;
};

export type ArticleClassificationSummary = {
  classification_id: number;
  review_id: number;
  research_method: string | null;
  category_1: string | null;
  category_2: string | null;
  category_3: string | null;
  category_4: string | null;
  category_5: string | null;
  category_6: string | null;
  grand_theory: string | null;
};

export type ReviewSummary = {
  review_id: number;
  article_id: number;
  article_classification?: ArticleClassificationSummary | null;
  extraction_result?: ExtractionResultSummary | null;
};

export type ExtractionResultSummary = {
  extraction_id: number;
  review_id: number;
  abstract: string | null;
  introduction: string | null;
  result: string | null;
  conclusion: string | null;
  recommendation: string | null;
  novelty_gap: string | null;
  limitation: string | null;
  future_research: string | null;
};

export type PrismaPageProps = {
  researchPlan: ResearchPlanSummary;
  filteredArticles: FilteredArticleSummary[];
};

export type MetricCardProps = {
  title: string;
  value: number;
  tone: 'green' | 'red' | 'indigo';
  icon: ReactNode;
};

export type ArticlePanelProps = {
  title: string;
  count: number;
  articles: ArticleItem[];
  accent: string;
  emptyText: string;
  preLink: string;
  postLink: string;
  onToggleRetrieved?: (articleId: number, nextRetrieved: boolean) => void;
};