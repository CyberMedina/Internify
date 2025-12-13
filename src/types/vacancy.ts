export interface Company {
  id: number;
  name: string;
  email?: string;
  photo?: string;
  logo?: string;
  description?: string;
}

export interface Vacancy {
  id: number;
  title: string;
  description: string;
  requirements: string[];
  modality: {
    code: string;
    label: string;
  } | string;
  location: string;
  salary_range: string;
  dates?: {
    start: string;
    end: string;
    posted?: string;
    posted_at?: string;
    posted_human?: string;
  };
  start_date?: string;
  end_date?: string;
  category?: {
    id: number;
    name: string;
  };
  categories?: string[];
  type?: {
    id: number;
    name: string;
  };
  internship_type_id?: number;
  academic_programs?: string[];
  areas: string[];
  status: string;
  company: Company;
  application?: {
    id?: number;
    has_applied: boolean;
    status: string;
  };
  tags?: string[];
  applicants_count?: number;
  // Legacy fields support if needed, or remove if fully migrating
  company_photo?: string; 
  modality_label?: string;
  category_name?: string;
  has_applied?: boolean;
  application_status?: string | null;
  category_id?: number;
  area?: string[];
}

export interface Category {
  id: number;
  name: string;
  pseudonym?: string;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  next_page_url: string | null;
  last_page: number;
  total: number;
}

export interface VacancyResponse {
  data: Vacancy[];
}

export interface CategoryResponse {
  data: Category[];
}

export type ApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected';

export interface TimelineEvent {
  status: ApplicationStatus;
  date: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface Application {
  id: number;
  vacancy_id: number;
  student_id: number;
  cv_id: number;
  status: ApplicationStatus;
  comments: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  vacancy: Vacancy;
  timeline?: TimelineEvent[];
}
