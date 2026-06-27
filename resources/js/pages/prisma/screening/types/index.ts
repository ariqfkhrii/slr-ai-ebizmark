import { RawArticle } from '../../identification/types';

export type ScreeningDecision = 'included' | 'excluded' | 'pending';

export type FilteredArticle = {
  filtered_article_id: number;
  included: boolean | null;
  raw_article: RawArticle;
};

export interface PaginationResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: unknown[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}
