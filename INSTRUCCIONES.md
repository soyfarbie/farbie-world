# Como poner tu blog en marcha — Farbie World

Sigue estos pasos exactamente. No necesitas saber nada de código.

---

## PASO 1 — Instalar Node.js (solo la primera vez)

1. Ve a **https://nodejs.org**
2. Haz clic en el botón verde grande que dice **"LTS"**
3. Descarga e instala el archivo (.msi para Windows)
4. Cuando termine, **cierra y vuelve a abrir** cualquier terminal

---

## PASO 2 — Crear cuenta en Supabase (tu base de datos gratis)

1. Ve a **https://supabase.com** → "Start your project" → Regístrate con Google
2. Crea un nuevo proyecto:
   - **Name:** farbie-world (o cualquier nombre)
   - **Password:** anótala en algún lugar
   - **Region:** South America (São Paulo)
3. Espera que termine de configurarse (~2 minutos)

---

## PASO 3 — Configurar la base de datos

1. En el panel de Supabase, haz clic en **"SQL Editor"** (menú izquierdo)
2. Haz clic en **"New query"**
3. Abre el archivo `supabase/schema.sql` de esta carpeta con el Bloc de notas
4. Copia **todo** el contenido y pégalo en el editor de Supabase
5. Haz clic en **"Run"** (botón verde)
6. Si ves "Success" al final, ¡perfecto!

---

## PASO 4 — Obtener tus claves de Supabase

1. En Supabase, haz clic en el ícono de engranaje ⚙️ → **"Project Settings"**
2. Haz clic en **"API"**
3. Anota estos dos valores:
   - **Project URL** (empieza con https://...)
   - **anon / public** key (empieza con eyJ...)

---

## PASO 5 — Configurar las claves en el proyecto

1. En la carpeta `farbie-blog`, busca el archivo `.env.local.example`
2. **Cópialo** y renombra la copia como `.env.local` (sin el "example")
3. Ábrelo con el Bloc de notas
4. Reemplaza los valores:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   ```
   → pega tu **Project URL**

   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```
   → pega tu **anon key**
5. Guarda el archivo

---

## PASO 6 — Instalar dependencias y arrancar

1. Abre la carpeta `farbie-blog` en el explorador de archivos
2. Haz clic en la barra de direcciones (donde pone la ruta), escribe `cmd` y presiona Enter
3. En la ventana negra que aparece, escribe:
   ```
   npm install
   ```
   Espera que termine (~2 minutos)
4. Luego escribe:
   ```
   npm run dev
   ```
5. Abre tu navegador y ve a **http://localhost:3000**

¡Tu blog está funcionando! 🎉

---

## PASO 7 — Publicar online con Vercel (gratis)

1. Ve a **https://vercel.com** → Sign Up con GitHub
   - Si no tienes GitHub: **https://github.com** → Sign Up → crea cuenta gratis
2. En Vercel, haz clic en **"Add New Project"** → **"Import Git Repository"**
3. Sube tu carpeta `farbie-blog` a GitHub primero:
   - Instala GitHub Desktop: **https://desktop.github.com**
   - Abre GitHub Desktop → File → Add Local Repository → selecciona `farbie-blog`
   - Haz clic en "Publish repository"
4. De vuelta en Vercel, importa ese repositorio
5. En **"Environment Variables"**, agrega las dos claves de Supabase
   (las mismas del archivo `.env.local`)
6. Haz clic en **"Deploy"**
7. En ~2 minutos tendrás una URL pública tipo `farbie-world.vercel.app`

---

## Supabase — configurar la URL de tu sitio

Una vez que tengas la URL de Vercel:
1. En Supabase → Authentication → URL Configuration
2. En **"Site URL"** pon tu URL de Vercel
3. En **"Redirect URLs"** agrega: `https://TU-SITIO.vercel.app/auth/callback`

---

## ¿Algo salió mal?

Mándame el mensaje de error y te ayudo.
