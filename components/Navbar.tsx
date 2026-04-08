'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PenSquare, LogOut, User, Menu, X } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-accent font-bold text-xl tracking-tight">
            Farbie
          </span>
          <span className="text-text-muted font-light text-sm hidden sm:block">world</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/create"
                className="flex items-center gap-2 btn-primary"
              >
                <PenSquare size={16} />
                <span>Nuevo post</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 btn-ghost"
                title="Cerrar sesión"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Entrar
              </Link>
              <Link href="/register" className="btn-primary">
                Unirse
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="sm:hidden text-text-secondary"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-border bg-surface px-4 py-4 flex flex-col gap-3">
          {user ? (
            <>
              <Link
                href="/create"
                className="btn-primary text-center"
                onClick={() => setMenuOpen(false)}
              >
                Nuevo post
              </Link>
              <button onClick={handleLogout} className="btn-ghost text-center">
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="btn-ghost text-center"
                onClick={() => setMenuOpen(false)}
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="btn-primary text-center"
                onClick={() => setMenuOpen(false)}
              >
                Unirse
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
