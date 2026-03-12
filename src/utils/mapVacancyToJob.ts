import { Vacancy } from '../types/vacancy';
import { Job } from '../components/JobCardLarge';

export const mapVacancyToJob = (v: Vacancy): Job => ({
  id: v.id.toString(),
  title: v.title,
  company: v.company.name,
  location: v.location || 'N/A',
  tags: v.tags && v.tags.length > 0 ? v.tags : (v.requirements && v.requirements.length > 0 ? v.requirements : (v.academic_programs || [])),
  applicants: v.applicants_count ?? 0,
  salary: v.salary_range ? `C$${v.salary_range}` : 'Anónimo',
  avatars: [],
  companyLogo: v.company.logo || v.company.photo,
  postedTime: v.dates?.posted_human,
  isApplied: v.is_applied,
  isSaved: v.is_saved,
  match: v.match_percentage,
});
