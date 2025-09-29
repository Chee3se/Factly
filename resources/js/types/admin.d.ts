factly / resources / js / types / admin.d.ts;
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
  friends_count: number;
  scores_count: number;
}

export interface AdminFriend {
  id: number;
  user_id: number;
  friend_id: number;
  accepted: boolean;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  friendUser?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface AdminSuggestion {
  id: number;
  title: string;
  description: string;
  status?: "pending" | "reviewing" | "approved" | "rejected" | "implemented";
  created_at: string;
  admin_notes?: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface AdminStats {
  total_users: number;
  total_admins: number;
  total_friends: number;
  pending_friend_requests: number;
  total_games: number;
  total_scores: number;
  total_suggestions: number;
  pending_suggestions: number;
  approved_suggestions: number;
  rejected_suggestions: number;
}

export interface PaginatedData<T> {
  data: T[];
  links: any[];
  current_page: number;
  last_page: number;
  total: number;
}

export interface AdminDashboardProps {
  auth: Auth;
  stats: AdminStats;
  users: PaginatedData<AdminUser>;
  friends: PaginatedData<AdminFriend>;
  suggestions: PaginatedData<AdminSuggestion>;
}
