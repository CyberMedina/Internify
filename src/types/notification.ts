export type NotificationType = 'vacancy_created' | 'vacancy_status' | 'application_status' | 'test';

export interface NotificationContent {
  title: string;
  body: string;
  type: NotificationType;
  id?: string | number; // ID of the related entity
  application_id?: number;
  vacancy_id?: number;
  status?: string;
  [key: string]: any;
}

export interface Notification {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: NotificationContent;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationResponse {
  current_page: number;
  data: Notification[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}
