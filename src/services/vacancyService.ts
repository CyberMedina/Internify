import { VacancyResponse, CategoryResponse, PaginatedResponse, Vacancy, Application } from '../types/vacancy';

const BASE_URL = 'https://overfoul-domingo-unharmable.ngrok-free.dev/api';

const getHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Accept': 'application/json',
  'Content-Type': 'application/json',
});

export const getSuggestedVacancies = async (token: string, limit: number = 5): Promise<VacancyResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/vacancies/suggested?limit=${limit}`, {
      headers: getHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch suggested vacancies');
    return await response.json();
  } catch (error) {
    console.error('Error fetching suggested vacancies:', error);
    throw error;
  }
};

export const getCategories = async (token: string): Promise<CategoryResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/vacancies/categories`, {
      headers: getHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch categories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const getVacancyDetail = async (token: string, id: number): Promise<{ data: Vacancy }> => {
  try {
    const url = `${BASE_URL}/vacancies/${id}`;
    console.log(`Fetching vacancy detail from: ${url}`);
    const response = await fetch(url, {
      headers: getHeaders(token),
    });
    if (!response.ok) {
      const text = await response.text();
      console.error(`Error fetching vacancy detail: ${response.status} ${text}`);
      throw new Error(`Failed to fetch vacancy detail: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching vacancy detail:', error);
    throw error;
  }
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
  } = {}
): Promise<PaginatedResponse<Vacancy>> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters.search) params.append('search', filters.search);
    if (filters.categoryId) params.append('category_id', filters.categoryId.toString());
    if (filters.internshipTypeId) params.append('internship_type_id', filters.internshipTypeId.toString());
    if (filters.modality) params.append('modality', filters.modality);
    if (filters.location) params.append('location', filters.location);

    const response = await fetch(`${BASE_URL}/vacancies?${params.toString()}`, {
      headers: getHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch vacancies');
    return await response.json();
  } catch (error) {
    console.error('Error fetching vacancies:', error);
    throw error;
  }
};

export const applyToVacancy = async (token: string, vacancyId: number, comments?: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/vacancies/${vacancyId}/apply`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ comments }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to apply to vacancy: ${response.status}`);
    }
  } catch (error) {
    console.error('Error applying to vacancy:', error);
    throw error;
  }
};

export const getMyApplications = async (token: string): Promise<Application[]> => {
  try {
    const response = await fetch(`${BASE_URL}/student/applications`, {
      headers: getHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch applications');
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
};

export const getApplicationDetail = async (token: string, applicationId: number): Promise<Application> => {
  try {
    const response = await fetch(`${BASE_URL}/student/applications/${applicationId}`, {
      headers: getHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch application detail');
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error('Error fetching application detail:', error);
    throw error;
  }
};


