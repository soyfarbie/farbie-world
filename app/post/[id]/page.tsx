import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import PostCard from '@/components/PostCard'
import CommentSection from '@/components/CommentSection'
import { notFound } from 'next/navigation'
import type { Post } from '@/lib/types'

export const revalidate = 0

interface Props {
  params: { id: string }
}

export default async function PostPage({ params }: Props) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: post } = await supabase
    .from('posts')
    .select(`
      *,
      profiles (id, username, display_name, avatar_url),
      likes (count),
      comments (count)
    `)
    .eq('id', params.id)
    .single()

  if (!post) notFound()

  let userLiked = false
  if (user) {
    const { data: like } = await supabase
      .from('likes')
      .select('post_id')
      .eq('post_id', params.id)
      .eq('user_id', user.id)
      .maybeSingle()
    userLiked = !!like
  }

  const { data: comments } = await supabase
    .from('comments')
    .select('*, profiles (id, username, display_name)')
    .eq('post_id', params.id)
    .order('created_at', { ascending: true })

  const postWithLike = { ...post, user_liked: userLiked } as Post

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-20">
        <PostCard post={postWithLike} currentUserId={user?.id} />
        <CommentSection
          postId={params.id}
          comments={comments ?? []}
          currentUserId={user?.id}
        />
      </main>
    </div>
  )
}
