'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Heart, MessageCircle, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Post } from '@/lib/types'
import toast from 'react-hot-toast'

interface PostCardProps {
  post: Post
  currentUserId?: string
  onDelete?: (postId: string) => void
}

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  return match ? match[1] : null
}

export default function PostCard({ post, currentUserId, onDelete }: PostCardProps) {
  const [liked, setLiked] = useState(post.user_liked ?? false)
  const [likeCount, setLikeCount] = useState(post.likes?.[0]?.count ?? 0)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: es,
  })

  const handleLike = async () => {
    if (!currentUserId) {
      toast.error('Debes iniciar sesión para dar like')
      return
    }
    setLoading(true)
    if (liked) {
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', currentUserId)
      setLiked(false)
      setLikeCount((c) => c - 1)
    } else {
      await supabase
        .from('likes')
        .insert({ post_id: post.id, user_id: currentUserId })
      setLiked(true)
      setLikeCount((c) => c + 1)
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('¿Segura que quieres borrar este post?')) return
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (error) {
      toast.error('No se pudo borrar el post')
    } else {
      toast.success('Post borrado')
      onDelete?.(post.id)
    }
  }

  return (
    <article className="card hover:border-border-hover transition-colors">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-sm font-bold text-accent uppercase flex-shrink-0">
            {post.profiles?.display_name?.[0] ?? post.profiles?.username?.[0] ?? '?'}
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary leading-none">
              {post.profiles?.display_name ?? post.profiles?.username ?? 'Anónimo'}
            </p>
            <p className="text-xs text-text-muted mt-0.5">{timeAgo}</p>
          </div>
        </div>
        {currentUserId === post.user_id && (
          <button
            onClick={handleDelete}
            className="text-text-muted hover:text-accent transition-colors p-1"
            title="Borrar post"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* Contenido de texto */}
      {post.content && (
        <div className="px-5 pb-4">
          <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>
      )}

      {/* Media */}
      {post.media_url && post.media_type === 'image' && (
        <div className="relative w-full aspect-[4/3] bg-black">
          <Image
            src={post.media_url}
            alt="Imagen del post"
            fill
            className="object-cover"
          />
        </div>
      )}

      {post.media_url && post.media_type === 'video' && (
        <div className="relative w-full aspect-video bg-black">
          <video
            src={post.media_url}
            controls
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {post.media_url && post.media_type === 'youtube' && (
        <div className="relative w-full aspect-video bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${getYouTubeId(post.media_url)}`}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )}

      {/* Footer con acciones */}
      <div className="px-5 py-3 flex items-center gap-5 border-t border-border">
        <button
          onClick={handleLike}
          disabled={loading}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            liked ? 'text-accent' : 'text-text-muted hover:text-accent'
          }`}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          <span>{likeCount}</span>
        </button>

        <Link
          href={`/post/${post.id}`}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <MessageCircle size={16} />
          <span>{post.comments?.[0]?.count ?? 0}</span>
        </Link>
      </div>
    </article>
  )
}
