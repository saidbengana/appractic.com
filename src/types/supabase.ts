export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  media_url?: string;
  scheduled_for?: string;
  published_at?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  platforms: string[];
  created_at: string;
  updated_at: string;
}

export interface SocialAccount {
  id: string;
  user_id: string;
  platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram';
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
  platform_user_id: string;
  platform_username: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface PostTag {
  post_id: string;
  tag_id: string;
  created_at: string;
}

export type Tables = {
  users: User;
  posts: Post;
  social_accounts: SocialAccount;
  tags: Tag;
  post_tags: PostTag;
};
