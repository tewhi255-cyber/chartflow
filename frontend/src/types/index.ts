export interface User {
  id: string;
  username: string;
  email: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  phone: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  is_verified: boolean;
  is_two_factor_enabled: boolean;
  role: 'user' | 'admin' | 'super_admin';
  storage_used: number;
  storage_limit: number;
  last_login_at: string;
  created_at: string;
  team_count?: number;
  project_count?: number;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  avatar_url: string;
  owner_id: string;
  is_private: boolean;
  max_members: number;
  member_count: number;
  project_count: number;
  created_at: string;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  email: string;
  status: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  joined_at: string;
}

export interface Project {
  id: string;
  team_id: string;
  name: string;
  description: string;
  cover_image: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date: string;
  end_date: string;
  owner_id: string;
  is_private: boolean;
  task_count: number;
  completed_tasks: number;
  member_count: number;
  created_at: string;
  members?: ProjectMember[];
}

export interface ProjectMember {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  role: string;
}

export interface Task {
  id: string;
  project_id: string;
  parent_task_id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id: string;
  reporter_id: string;
  due_date: string;
  estimated_hours: number;
  actual_hours: number;
  sort_order: number;
  labels: string[];
  assignee_name: string;
  assignee_avatar: string;
  reporter_name: string;
  subtask_count: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'team';
  name: string;
  avatar_url: string;
  team_id: string;
  is_archived: boolean;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'system' | 'voice';
  reply_to_id: string;
  is_pinned: boolean;
  is_edited: boolean;
  metadata: any;
  username: string;
  display_name: string;
  avatar_url: string;
  reactions: any;
  created_at: string;
}

export interface FileItem {
  id: string;
  original_name: string;
  stored_name: string;
  mime_type: string;
  size: number;
  extension: string;
  category_id: string;
  storage_type: 'local' | 's3';
  uploader_id: string;
  team_id: string;
  project_id: string;
  message_id: string;
  description: string;
  download_count: number;
  version: number;
  uploader_name: string;
  uploader_display_name: string;
  tags: { name: string; color: string }[];
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: any;
  is_read: boolean;
  read_at: string;
  created_at: string;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  files?: T[];
  users?: T[];
  total: number;
  page: number;
  limit: number;
}
