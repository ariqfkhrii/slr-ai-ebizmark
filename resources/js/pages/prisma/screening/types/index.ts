import { RawArticle } from '../../identification/types';

export type ScreeningDecision = 'included' | 'excluded' | 'pending';

export type FilteredArticle = {
  filtered_article_id: number;
  research_plan_id: number;
  raw_article_id: number;
  retrieved: boolean;
  included: boolean | null;
  article_status: ScreeningDecision;
  ai_usage_status: 'not_used' | 'used';
  novelty_status: 'unchecked' | 'checked';
  rawArticle: RawArticle;
};
