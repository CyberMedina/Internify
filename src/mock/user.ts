export interface InternshipLevel {
  id: string;
  name: string;
  minHours: number;
  maxHours: number;
  color: string;
  badge: string;
}

export const internshipLevels: InternshipLevel[] = [
  {
    id: 'familiarizacion',
    name: 'Familiarización',
    minHours: 0,
    maxHours: 90,
    color: '#67E8F9', // Cyan brillante
    badge: 'I',
  },
  {
    id: 'especializacion',
    name: 'Especialización',
    minHours: 90,
    maxHours: 225,
    color: '#D8B4FE', // Violeta claro
    badge: 'II',
  },
  {
    id: 'profesionalizacion',
    name: 'Profesionalización',
    minHours: 225,
    maxHours: 450,
    color: '#FCD34D', // Dorado brillante
    badge: 'III',
  },
];

export const currentUser = {
  id: 'u1',
  name: 'Jhonatan Medina',
  email: 'jhonatan@example.com',
  hours: 350,
  avatar: null,
};
