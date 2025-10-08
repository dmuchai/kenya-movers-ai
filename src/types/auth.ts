/**
 * Authentication and Authorization Types
 */

export type UserRole = 'customer' | 'mover' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  preferred_language: string;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_table: string;
  target_id: string | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
