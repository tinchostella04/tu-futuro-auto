# Tu Futuro Auto — Instrucciones de Setup

## 1. SQL para Supabase

Ejecutá esto en el **SQL Editor** de tu proyecto Supabase:

```sql
-- Tabla principal de publicaciones
CREATE TABLE kv_store_5cf66d9e (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas por prefijo de key
CREATE INDEX idx_kv_key_prefix ON kv_store_5cf66d9e (key text_pattern_ops);

-- Storage bucket (ejecutar en SQL o desde el dashboard)
-- Ir a Storage > New Bucket > Nombre: make-5cf66d9e-photos > Private (NO público)
```

### Storage Policy (para que Edge Functions puedan acceder)

```sql
-- Política para que el service role pueda leer/escribir
CREATE POLICY "Service role full access" ON storage.objects
  FOR ALL
  USING (bucket_id = 'make-5cf66d9e-photos')
  WITH CHECK (bucket_id = 'make-5cf66d9e-photos');
```

---

## 2. Variables de Entorno

### Frontend (.env.local para desarrollo, en Vercel para producción)

```env
VITE_SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### Backend (Supabase Secrets)

```bash
supabase secrets set SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=tu_mp_access_token
supabase secrets set FRONTEND_URL=https://tu-dominio.vercel.app
```

---

## 3. Deploy paso a paso

### Paso 1: Supabase
1. Crear cuenta en [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Ir a SQL Editor → ejecutar el SQL de arriba
4. Ir a Storage → crear bucket `make-5cf66d9e-photos` (privado)
5. Copiar **Project URL** y **anon key** de Settings > API

### Paso 2: Repositorio GitHub
```bash
git init
git add .
git commit -m "feat: initial Tu Futuro Auto project"
git remote add origin https://github.com/TU_USUARIO/tu-futuro-auto.git
git push -u origin main
```

### Paso 3: Deploy Frontend en Vercel
1. Ir a [vercel.com](https://vercel.com) → Import Project → elegir el repo
2. En Settings > Environment Variables agregar:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Click en Deploy

### Paso 4: Deploy Backend (Edge Functions)
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Linkear al proyecto
supabase link --project-ref TU_PROJECT_ID

# Deploy la función
supabase functions deploy server --no-verify-jwt

# Configurar secrets
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
supabase secrets set FRONTEND_URL=https://tu-dominio.vercel.app
```

---

## 4. Desarrollo local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
# → http://localhost:3000

# Build de producción
npm run build
```

---

## 5. Estructura de rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page con planes |
| `/vehiculos` | Catálogo público |
| `/publicar` | Formulario de publicación |
| `/admin` | Panel de administración |
| `/admin/crear-vehiculo` | Crear vehículo manual |
| `/pago-exitoso` | Confirmación de pago OK |
| `/pago-fallido` | Error de pago |
| `/pago-pendiente` | Pago pendiente |

---

## 6. Troubleshooting

**"Cannot connect to Supabase"** → Verificar variables de entorno en Vercel

**"Failed to upload photo"** → Verificar que el bucket `make-5cf66d9e-photos` existe y es privado

**"Payment link failed"** → Verificar `MERCADOPAGO_ACCESS_TOKEN` en Supabase Secrets

**Vehículos no aparecen en catálogo** → El status debe ser `"published"`. Ir a `/admin` y publicarlos.

**CORS error** → El Edge Function maneja CORS automáticamente. Si persiste, verificar que la función esté deployada correctamente.

---

## 7. Contacto del proyecto

- Email: info@tufuturoauto.com
- Teléfono: +54 9 341 321 5119
- Instagram: @tufuturoauto
- Facebook: /tufuturoauto
