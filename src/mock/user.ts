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
  names: 'Jhonatan Jazmil',
  lastnames: 'Medina Aguirre',
  email: 'jhonatan.medina@est.uni.edu.ni',
  hours: 1,
  avatar: null,
  isProfileComplete: false,
  profileProgress: 80,
  // Extended mock data for onboarding
  birthDate: '15/08/2003',
  phone: '+505 85920121',
  address: 'Managua, Nicaragua',
  faculty: 'Facultad de Electrotecnia y Computación (FEC)',
  career: 'Ingeniería en Computación',
  
  // CV Data
  cvProfile: {
    summary: '',
    secondaryEducation: {
      school: '',
      title: '',
      year: '',
    },
    experience: [] as any[],
    skills: [] as string[],
    certifications: [] as any[],
    references: [
      { name: '', contact: '' },
      { name: '', contact: '' },
      { name: '', contact: '' },
    ],
  }
};
