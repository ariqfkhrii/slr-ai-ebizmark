import { Keyword, RawArticle } from '../acquisition/types';

export function getUniqueArticlesByDoi(keywords: Keyword[]): RawArticle[] {
  const map = new Map<string, RawArticle>();

  keywords.forEach((keyword) => {
    keyword.articles?.forEach((article) => {
      if (!article.doi) return;

      const key = article.doi.toLowerCase().trim();

      if (!map.has(key)) {
        map.set(key, article);
      }
    });
  });

  return Array.from(map.values());
}
