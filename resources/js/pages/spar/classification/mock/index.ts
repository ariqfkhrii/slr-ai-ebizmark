import { ClassificationArticle } from '../types';

export const mockClassificationArticles: ClassificationArticle[] = Array.from({
  length: 20,
}).map((_, index) => ({
  id: index + 1,
  title: `Title Lorem ipsum dolor sit amet ${index + 1}`,
  authors: 'Seaman et al.',
  country: 'South America',
  publishYear: 2020,
  researchMethod: 'Historical case study',
  classifications: {},
}));
