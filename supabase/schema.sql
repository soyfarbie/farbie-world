-- ============================================================
-- FARBIE BLOG - Schema de base de datos
-- Ejecuta esto en Supabase > SQL Editor
-- ============================================================

-- Tabla de perfiles (una por usuario)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamptz default now() not null
);

-- Tabla de posts
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text,
  media_url text,
  media_type text check (media_type in ('image', 'video', 'youtube')),
  created_at timestamptz default now() not null
);

-- Tabla de likes
create table public.likes (
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (post_id, user_id)
);

-- Tabla de comentarios
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null
);

-- ============================================================
-- SEGURIDAD (Row Level Security)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;

-- Profiles: todos pueden leer, solo tú puedes editar el tuyo
create policy "Perfiles visibles para todos" on public.profiles for select using (true);
create policy "Crear perfil propio" on public.profiles for insert with check (auth.uid() = id);
create policy "Editar perfil propio" on public.profiles for update using (auth.uid() = id);

-- Posts: todos pueden leer, solo autenticados pueden crear/editar/borrar los suyos
create policy "Posts visibles para todos" on public.posts for select using (true);
create policy "Crear post autenticado" on public.posts for insert with check (auth.uid() = user_id);
create policy "Editar post propio" on public.posts for update using (auth.uid() = user_id);
create policy "Borrar post propio" on public.posts for delete using (auth.uid() = user_id);

-- Likes: todos ven, solo autenticados pueden dar/quitar like
create policy "Likes visibles para todos" on public.likes for select using (true);
create policy "Dar like autenticado" on public.likes for insert with check (auth.uid() = user_id);
create policy "Quitar like propio" on public.likes for delete using (auth.uid() = user_id);

-- Comentarios: todos ven, solo autenticados crean, solo el autor borra
create policy "Comentarios visibles para todos" on public.comments for select using (true);
create policy "Comentar autenticado" on public.comments for insert with check (auth.uid() = user_id);
create policy "Borrar comentario propio" on public.comments for delete using (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: crear perfil automáticamente al registrarse
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- STORAGE: bucket para fotos y videos
-- ============================================================

insert into storage.buckets (id, name, public) values ('media', 'media', true);

create policy "Media visible para todos" on storage.objects for select using (bucket_id = 'media');
create policy "Subir media autenticado" on storage.objects for insert with check (bucket_id = 'media' and auth.role() = 'authenticated');
create policy "Borrar media propia" on storage.objects for delete using (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);
