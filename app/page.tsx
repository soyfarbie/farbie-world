import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import PostCard from '@/components/PostCard'
import Link from 'next/link'
import type { Post } from '@/lib/types'

export const revalidate = 0

const hasSupabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export default async function HomePage() {
  let user = null
  let postsWithLiked: Post[] = []

  if (hasSupabase) {
    try {
      const supabase = createClient()

      const { data: userData } = await supabase.auth.getUser()
      user = userData.user

      const { data: posts } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (id, username, display_name, avatar_url),
          likes (count),
          comments (count)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      let likedPostIds = new Set<string>()
      if (user) {
        const { data: likes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id)
        likedPostIds = new Set(likes?.map((l) => l.post_id) ?? [])
      }

      postsWithLiked = (posts ?? []).map((p) => ({
        ...p,
        user_liked: likedPostIds.has(p.id),
      })) as Post[]
    } catch {
      // Sin credenciales, mostrar página vacía
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <header className="pt-24 pb-10 px-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          <span className="text-text-primary">Farbie</span>
          <span className="text-accent"> World</span>
        </h1>
        <p className="mt-3 text-text-secondary text-sm max-w-xs mx-auto">
          Reflexiones, fotos y videos de mi vida. Bienvenida a mi mundo.
        </p>
        {!user && (
          <div className="mt-6 flex gap-3 justify-center">
            <Link href="/register" className="btn-primary">
              Únete
            </Link>
            <Link href="/login" className="btn-ghost">
              Ya tengo cuenta
            </Link>
          </div>
        )}
        {user && (
          <div className="mt-6">
            <Link href="/create" className="btn-primary">
              + Nuevo post
            </Link>
          </div>
        )}
      </header>

      {/* Aviso si falta configuración */}
      {!hasSupabase && (
        <div className="max-w-2xl mx-auto px-4 mb-8">
          <div className="border border-accent/30 bg-accent/10 rounded-xl p-4 text-center">
            <p className="text-accent text-sm font-semibold mb-1">¡Casi lista!</p>
            <p className="text-text-secondary text-xs">
              Falta conectar la base de datos. Sigue las instrucciones del archivo{' '}
              <span className="text-text-primary font-mono">INSTRUCCIONES.md</span> para configurar Supabase.
            </p>
          </div>
        </div>
      )}

      {/* Feed */}
      <main className="max-w-2xl mx-auto px-4 pb-20">
        {postsWithLiked.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted text-sm">Todavía no hay posts.</p>
            {user && (
              <Link href="/create" className="btn-primary inline-block mt-4">
                Crear el primero
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {postsWithLiked.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
