export type ExtractionArticle = {
  id: number;
  authors: string;
  year: number;
  title: string;
  journal: string;
  aiUsage: boolean;
  citation: number;
  quartile: string;
  text: number;
  novelty: boolean;
  status: 'pending' | 'extracted';
  pdfUrl?: string;
};

export type ExtractionFormValues = {
  abstract: string;
  introduction: string;
  result: string;
  conclusion: string;
  recommendation: string;

  receivedDate: string;
  acceptedDate: string;
  publishedDate: string;
  country: string;

  contextArea: string;
  focusOn: string;
  researchMethod: string;
  usingStimulus: string;

  dataCollection: string;
  analysisMethod: string;
  software: string;
  researchDesign: string;

  noveltyGap: string;
  limitation: string;
  futureResearch: string;

  category1: string;
  category2: string;
  category3: string;
  category4: string;
  category5: string;
  category6: string;
  theory: string;

  articleNotRelevant: string;
  articleQualitative: string;
  shareReference: string;
  noHypothesis: string;
};
