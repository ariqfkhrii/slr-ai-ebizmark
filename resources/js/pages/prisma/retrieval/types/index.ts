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
  retrieved: 'Retrieved' | 'Not Retrieved';
  raw_article: RawArticleSummary | null;
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