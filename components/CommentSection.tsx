'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import type { Comment } from '@/lib/types'
import toast from 'react-hot-toast'
import { Send, Trash2 } from 'lucide-react'

interface Props {
  postId: string
  comments: Comment[]
  currentUserId?: string
}

export default function CommentSection({ postId, comments: initialComments, currentUserId }: Props) {
  const [comments, setComments] = useState(initialComments)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUserId) {
      toast.error('Debes iniciar sesión para comentar')
      return
    }
    if (!text.trim()) return
    setLoading(true)

    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: currentUserId, content: text.trim() })
      .select('*, profiles (id, username, display_name)')
      .single()

    if (error) {
      toast.error('No se pudo publicar el comentario')
    } else {
      setComments((prev) => [...prev, data as Comment])
      setText('')
    }
    setLoading(false)
  }

  const handleDelete = async (commentId: string) => {
    await supabase.from('comments').delete().eq('id', commentId)
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  return (
    <div className="mt-4">
      <h2 className="text-sm font-semibold text-text-secondary mb-3">
        Comentarios ({comments.length})
      </h2>

      {/* Lista de comentarios */}
      <div className="flex flex-col gap-3 mb-4">
        {comments.length === 0 && (
          <p className="text-text-muted text-sm text-center py-4">
            Sin comentarios todavía. ¡Sé el primero!
          </p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="card px-4 py-3 flex gap-3">
            <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-xs font-bold text-accent uppercase flex-shrink-0">
              {comment.profiles?.display_name?.[0] ?? comment.profiles?.username?.[0] ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-semibold text-text-primary">
                  {comment.profiles?.display_name ?? comment.profiles?.username}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-text-muted">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: es })}
                  </span>
                  {currentUserId === comment.user_id && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-text-muted hover:text-accent transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-text-primary mt-0.5 leading-relaxed">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Formulario de comentario */}
      {currentUserId ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="input-field flex-1"
            placeholder="Escribe un comentario..."
            maxLength={500}
          />
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="btn-primary px-4 py-2 flex items-center gap-1.5"
          >
            <Send size={15} />
          </button>
        </form>
      ) : (
        <p className="text-center text-sm text-text-muted">
          <a href="/login" className="text-accent hover:text-accent-hover">Inicia sesión</a> para comentar
        </p>
      )}
    </div>
  )
}
