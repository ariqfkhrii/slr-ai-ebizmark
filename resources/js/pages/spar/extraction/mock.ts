import { ExtractionArticle, ExtractionFormValues } from './types';

export const dummyExtractionArticles: ExtractionArticle[] = [
  {
    id: 1,
    authors: 'Seaman, Dave J.L.; Bernard, Henry; Ancrenaz, Marc',
    year: 2020,
    title:
      'Densities of Bornean orang-utans in heavily degraded forest and oil palm plantations in Sabah, Borneo',
    journal: 'American Journal of Primatology',
    aiUsage: false,
    citation: 27,
    quartile: 'Q1',
    text: 27,
    novelty: true,
    noveltyGap: 'Penelitian ini menyoroti kebutuhan evaluasi jangka panjang.',
    status: 'pending',
    pdfUrl:
      'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
  },
  {
    id: 2,
    authors: 'Johnson, Michael R.; Smith, Emily A.',
    year: 2021,
    title:
      'Machine learning approaches for biodiversity conservation: A systematic review',
    journal: 'Ecological Informatics',
    aiUsage: true,
    citation: 36,
    quartile: 'Q3',
    text: 9,
    novelty: false,
    noveltyGap: '',
    status: 'pending',
    pdfUrl:
      'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
  },
];

export const defaultExtractionForm: ExtractionFormValues = {
  abstract: '',
  introduction: '',
  result: '',
  conclusion: '',
  recommendation: '',

  receivedDate: '',
  acceptedDate: '',
  publishedDate: '',
  country: '',

  contextArea: '',
  focusOn: '',
  researchMethod: '',
  usingStimulus: '',

  dataCollection: '',
  analysisMethod: '',
  software: '',
  researchDesign: '',

  noveltyGap: '',
  limitation: '',
  futureResearch: '',

  category1: '',
  category2: '',
  category3: '',
  category4: '',
  category5: '',
  category6: '',
  theory: '',

  articleNotRelevant: '',
  articleQualitative: '',
  shareReference: '',
  noHypothesis: '',
};
