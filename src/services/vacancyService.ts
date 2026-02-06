import { api } from './api';
import { VacancyResponse, CategoryResponse, PaginatedResponse, Vacancy, Application } from '../types/vacancy';

export const getSuggestedVacancies = async (token: string, limit: number = 5): Promise<VacancyResponse> => {
  return api.get<VacancyResponse>(`/vacancies/suggested?limit=${limit}`, { token });
};

export const getCategories = async (token: string): Promise<CategoryResponse> => {
  return api.get<CategoryResponse>('/vacancies/categories', { token });
};

export const getVacancyDetail = async (token: string, id: number): Promise<{ data: Vacancy }> => {
  return api.get<{ data: Vacancy }>(`/vacancies/${id}`, { token });
};

export const getVacancies = async (
  token: string,
  page: number = 1,
  limit: number = 10,
  filters: {
    search?: string;
    categoryId?: number;
    internshipTypeId?: number;
    modality?: string;
    location?: string;
    minSalary?: number;
    maxSalary?: number;
    datePosted?: string;
  } = {}
): Promise<PaginatedResponse<Vacancy>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters.search) params.append('search', filters.search);
  if (filters.categoryId) params.append('category_id', filters.categoryId.toString());
  if (filters.internshipTypeId) params.append('internship_type_id', filters.internshipTypeId.toString());
  if (filters.modality) params.append('modality', filters.modality);
  if (filters.location) params.append('location', filters.location);
  if (filters.minSalary) params.append('min_salary', filters.minSalary.toString());
  if (filters.maxSalary) params.append('max_salary', filters.maxSalary.toString());
  if (filters.datePosted) params.append('date_posted', filters.datePosted);

  return api.get<PaginatedResponse<Vacancy>>(`/vacancies?${params.toString()}`, { token });
};

export const applyToVacancy = async (token: string, vacancyId: number, comments?: string): Promise<void> => {
  return api.post<void>(`/vacancies/${vacancyId}/apply`, { comments }, { token });
};

export const getMyApplications = async (token: string, page: number = 1): Promise<PaginatedResponse<Application>> => {
  return api.get<PaginatedResponse<Application>>(`/student/applications?page=${page}`, { token });
};

export const getApplicationDetail = async (token: string, applicationId: number): Promise<Application> => {
  const response = await api.get<{ data: Application }>(`/student/applications/${applicationId}`, { token });
  return response.data;
};

export const getSavedVacancies = async (token: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Vacancy>> => {
  return api.get<PaginatedResponse<Vacancy>>(`/student/saved-vacancies?page=${page}&limit=${limit}`, { token });
};

export const saveVacancy = async (token: string, vacancyId: number): Promise<void> => {
  return api.post<void>('/student/saved-vacancies', { vacancy_id: vacancyId }, { token });
};

export const deleteSavedVacancy = async (token: string, vacancyId: number): Promise<void> => {
  return api.delete<void>(`/student/saved-vacancies/${vacancyId}`, { token });
};

// Deprecated: verify usages and replace with saveVacancy/deleteSavedVacancy
export const toggleSavedVacancy = async (token: string, vacancyId: number): Promise<void> => {
  return saveVacancy(token, vacancyId);
};


