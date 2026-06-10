export type ClassificationCategory = {
  id: number;
  name: string;
};

export type ClassificationArticle = {
  id: number;
  title: string;
  authors: string;
  country: string;
  publishYear: number | null;
  researchMethod: string;
  classifications: Record<number, string>;
  abstract?: string;
};

export type ClassificationSetup = {
  id_setup: number;
  research_plan_id: number;
  category_1: string | null;
  category_2: string | null;
  category_3: string | null;
  category_4: string | null;
  category_5: string | null;
  category_6: string | null;
  theory: string | null;
};
