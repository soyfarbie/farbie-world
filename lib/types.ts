export interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  content: string | null
  media_url: string | null
  media_type: 'image' | 'video' | 'youtube' | null
  created_at: string
  profiles?: Profile
  likes?: { count: number }[]
  comments?: { count: number }[]
  user_liked?: boolean
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  profiles?: Profile
}
