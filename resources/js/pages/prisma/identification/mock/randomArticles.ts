import { RawArticle } from '../types';
import { mockRawArticles } from './rawArticles';

export function getRandomArticles(count: number = 10): RawArticle[] {
  const shuffled = [...mockRawArticles].sort(() => Math.random() - 0.5);

  return shuffled.slice(0, count);
}
