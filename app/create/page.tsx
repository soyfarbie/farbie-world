'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import toast from 'react-hot-toast'
import { ImagePlus, Video, Youtube, FileText, X } from 'lucide-react'

type PostType = 'text' | 'image' | 'video' | 'youtube'

export default function CreatePage() {
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState<PostType>('text')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        toast.error('Debes iniciar sesión')
        router.push('/login')
      } else {
        setUserId(data.user.id)
      }
    })
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const clearMedia = () => {
    setFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    if (!content.trim() && !file && !youtubeUrl.trim()) {
      toast.error('Escribe algo o sube un archivo')
      return
    }

    setLoading(true)
    let mediaUrl: string | null = null
    let mediaType: string | null = null

    // Subir archivo si existe
    if (file && (postType === 'image' || postType === 'video')) {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        toast.error('Error al subir el archivo')
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
      mediaUrl = urlData.publicUrl
      mediaType = postType
    }

    // URL de YouTube
    if (postType === 'youtube' && youtubeUrl.trim()) {
      mediaUrl = youtubeUrl.trim()
      mediaType = 'youtube'
    }

    const { error } = await supabase.from('posts').insert({
      user_id: userId,
      content: content.trim() || null,
      media_url: mediaUrl,
      media_type: mediaType,
    })

    if (error) {
      toast.error('No se pudo publicar el post')
    } else {
      toast.success('Post publicado!')
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  const typeButtons: { type: PostType; icon: React.ReactNode; label: string }[] = [
    { type: 'text', icon: <FileText size={16} />, label: 'Texto' },
    { type: 'image', icon: <ImagePlus size={16} />, label: 'Foto' },
    { type: 'video', icon: <Video size={16} />, label: 'Video' },
    { type: 'youtube', icon: <Youtube size={16} />, label: 'YouTube' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-20">
        <h1 className="text-xl font-bold text-text-primary mb-6">Nuevo post</h1>

        {/* Selector de tipo */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {typeButtons.map(({ type, icon, label }) => (
            <button
              key={type}
              onClick={() => { setPostType(type); clearMedia() }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                postType === type
                  ? 'bg-accent border-accent text-white'
                  : 'bg-surface border-border text-text-secondary hover:border-border-hover'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="card p-5 flex flex-col gap-4">
          {/* Texto/reflexión */}
          <div>
            <label className="block text-xs text-text-secondary mb-1.5 font-medium">
              {postType === 'text' ? 'Tu reflexión o pensamiento' : 'Descripción (opcional)'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input-field resize-none h-32"
              placeholder={
                postType === 'text'
                  ? '¿Qué tienes en mente hoy?'
                  : 'Agrega una descripción...'
              }
            />
          </div>

          {/* Upload de imagen */}
          {postType === 'image' && (
            <div>
              <label className="block text-xs text-text-secondary mb-1.5 font-medium">
                Foto
              </label>
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Vista previa" className="w-full rounded-lg max-h-80 object-cover" />
                  <button
                    type="button"
                    onClick={clearMedia}
                    className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-border hover:border-accent cursor-pointer rounded-lg transition-colors">
                  <ImagePlus size={28} className="text-text-muted mb-2" />
                  <span className="text-sm text-text-muted">Haz clic para subir una foto</span>
                  <span className="text-xs text-text-muted mt-1">JPG, PNG, GIF, WebP</span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          {/* Upload de video */}
          {postType === 'video' && (
            <div>
              <label className="block text-xs text-text-secondary mb-1.5 font-medium">
                Video <span className="text-text-muted">(máx 50MB)</span>
              </label>
              {preview ? (
                <div className="relative">
                  <video src={preview} controls className="w-full rounded-lg max-h-80" />
                  <button
                    type="button"
                    onClick={clearMedia}
                    className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-border hover:border-accent cursor-pointer rounded-lg transition-colors">
                  <Video size={28} className="text-text-muted mb-2" />
                  <span className="text-sm text-text-muted">Haz clic para subir un video</span>
                  <span className="text-xs text-text-muted mt-1">MP4, MOV, WebM</span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          {/* YouTube URL */}
          {postType === 'youtube' && (
            <div>
              <label className="block text-xs text-text-secondary mb-1.5 font-medium">
                Link de YouTube
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="input-field"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-ghost flex-1"
            >
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
