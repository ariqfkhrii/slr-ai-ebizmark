import { RawArticle } from '../../identification/types';
import { FilteredArticle } from '../types';

export function createFilteredArticles(
  articles: RawArticle[],
  researchPlanId: number,
): FilteredArticle[] {
  return articles.map((article, index) => ({
    filtered_article_id: Date.now() + index,
    research_plan_id: researchPlanId,
    raw_article_id: article.article_id,
    retrieved: false,
    included: null,
    article_status: 'pending',
    ai_usage_status: 'not_used',
    novelty_status: 'unchecked',
    rawArticle: article,
  }));
}
