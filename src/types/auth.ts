export interface LoginUserData {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  person?: {
    id: number;
    user_id: number;
    social_rz: string;
    person_tp: string;
    created_at: string;
    updated_at: string;
    detail?: any;
  };
  student?: {
    id: number;
    user_id: number;
    carnet: string;
    career: string;
    department: string;
    academic_level: string;
    created_at: string;
    updated_at: string;
    cv?: any;
  };
  user_detail?: {
    id: number;
    user_id: number;
    role_id: number;
    pf_photo: string;
    password_old: string;
    created_at: string;
    updated_at: string;
  };
}

export interface StudentProfile {
  id: number;
  email: string;
  name: string;
  role: string;
  profile: {
    first_name: string;
    last_name: string;
    identification: string;
    phone: string;
    birth_date: string;
    gender: string;
    photo: string;
  };
  academic_info: {
    carnet: string;
    career: string;
    department: string;
    academic_level: string;
  };
  has_cv: boolean;
}

export interface User extends LoginUserData {
  // Unified user interface if needed, or we can just use LoginUserData as the base User type
  // and keep StudentProfile separate for the detailed view.
  // For now, AuthContext will likely hold LoginUserData initially.
}
