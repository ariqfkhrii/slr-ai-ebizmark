export interface ResearchPlan {
  research_plan_id: number;
  title: string;
  source_database: string;
  scopus_quantity: number;
  pubmed_quantity: number;
  extraction_count: number | null;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
