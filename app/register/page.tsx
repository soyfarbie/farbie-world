'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }
    const usernameClean = username.toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (usernameClean !== username.toLowerCase()) {
      toast.error('El nombre de usuario solo puede tener letras, números y _')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: usernameClean,
          display_name: displayName || usernameClean,
        },
      },
    })
    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('Ese email ya está registrado')
      } else {
        toast.error(error.message)
      }
    } else {
      toast.success('¡Cuenta creada! Bienvenida a Farbie World')
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold">
              <span className="text-text-primary">Farbie</span>
              <span className="text-accent"> World</span>
            </h1>
          </Link>
          <p className="text-text-muted text-sm mt-2">Crea tu cuenta</p>
        </div>

        <form onSubmit={handleRegister} className="card p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5 font-medium">
              Nombre para mostrar
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-field"
              placeholder="Tu nombre real o apodo"
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5 font-medium">
              Usuario <span className="text-text-muted">(solo letras, números y _)</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className="input-field"
              placeholder="farbie_girl"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5 font-medium">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5 font-medium">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-10"
                placeholder="Mínimo 6 caracteres"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-accent hover:text-accent-hover">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
