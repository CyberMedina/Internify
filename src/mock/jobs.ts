import { Job } from '../components/JobCardLarge';

export const suggestedJobs: Job[] = [
  {
    id: '1',
    title: 'Pasante en Análisis de Datos',
    company: 'Sinsa',
    location: 'Managua',
    tags: ['Pasantía', 'Tiempo completo'],
    applicants: 8,
    salary: 'C$3,000 - C$5,000 /mes',
    avatars: [
      'https://i.pravatar.cc/100?img=1',
      'https://i.pravatar.cc/100?img=2',
      'https://i.pravatar.cc/100?img=3',
    ],
  },
  {
    id: '2',
    title: 'Pasante en Diseño UX/UI',
    company: 'PixelWorks Studio',
    location: 'Remoto',
    tags: ['Pasantía', 'Remoto', 'Medio tiempo'],
    applicants: 15,
    salary: 'C$2,500 - C$4,000 /mes',
    avatars: [
      'https://i.pravatar.cc/100?img=4',
      'https://i.pravatar.cc/100?img=5',
    ],
  },
];

export const recentJobs: Job[] = [
  {
    id: '3',
    title: 'Pasante en Desarrollo Frontend (React)',
    company: 'TechNova',
    location: 'Remoto',
    tags: ['Pasantía', 'Remoto'],
    applicants: 27,
    salary: 'C$3,000 - C$5,000 /mes',
    avatars: [
      'https://i.pravatar.cc/100?img=7',
      'https://i.pravatar.cc/100?img=8',
    ],
  },
  {
    id: '4',
    title: 'Pasante en Desarrollo Backend',
    company: 'CloudNine Software',
    location: 'Managua',
    tags: ['Pasantía', 'Híbrido'],
    applicants: 19,
    salary: 'C$3,500 - C$6,000 /mes',
    avatars: [
      'https://i.pravatar.cc/100?img=9',
      'https://i.pravatar.cc/100?img=10',
    ],
  },
  {
    id: '5',
    title: 'Pasante en Ingeniería Industrial',
    company: 'Grupo LALA',
    location: 'Tipitapa',
    tags: ['Pasantía', 'Presencial'],
    applicants: 12,
    salary: 'C$4,000 /mes',
    avatars: [
      'https://i.pravatar.cc/100?img=11',
      'https://i.pravatar.cc/100?img=12',
    ],
  },
];

export const categories = ['Todos', 'Sistemas', 'Industrial', 'Civil', 'Administración', 'Diseño'];
