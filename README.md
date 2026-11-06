# VentaBot

Envío masivo de mensajes de WhatsApp con plantillas aprobadas, usando la **WhatsApp Business Cloud API** de Meta.

Flujo: registrar usuario → guardar credenciales de WhatsApp → crear un grupo → importar contactos desde Excel → elegir plantilla y grupo → enviar.

- **Backend:** Node 22 + Express + MongoDB (Mongoose), JWT en cookie.
- **Frontend:** React + Vite + Tailwind (carpeta `client/`).
- **Despliegue:** Vercel (frontend estático + API como función serverless en `api/index.js`).

## Requisitos

- Node.js 22 y pnpm 9 (`npm i -g pnpm@9`).
- Una base de datos MongoDB (por ejemplo MongoDB Atlas, plan gratuito).
- Una app de Meta con WhatsApp configurado: **WABA ID**, **Phone number ID** y un **Access Token**
  (para producción usa un token permanente de usuario del sistema; el temporal caduca en 24 h).

## Desarrollo local

```bash
cp .env.example .env          # completar MONGODB_URL y TOKEN_SECRET
pnpm install
pnpm --dir client install

pnpm dev                      # API en http://localhost:3030
pnpm --dir client dev         # Frontend en http://localhost:5173 (el proxy de Vite redirige /api)
```

Pruebas (no necesitan MongoDB ni Meta): `pnpm test`

## Formato del Excel de contactos

La primera fila son los encabezados. Se usa la primera hoja.

| Nombre | Número        | Puntos | Ciudad |
|--------|---------------|--------|--------|
| Ana    | 51987654321   | 300    | Lima   |

- **Número** (también se acepta TELÉFONO, CELULAR, WHATSAPP): obligatorio, con código de país.
  Se eliminan automáticamente espacios, `+` y guiones.
- **Nombre** (opcional).
- Cualquier otra columna se guarda como variable del contacto y se puede asignar a los `{{1}}`, `{{2}}`…
  de la plantilla. El nombre del contacto también está disponible como variable.
- Los números repetidos dentro del grupo se omiten.

## Desplegar en Vercel

1. Importar el repositorio en Vercel (la configuración está en `vercel.json`, no hace falta cambiar nada).
2. En **Settings → Environment Variables** agregar `MONGODB_URL` y `TOKEN_SECRET`.
3. En MongoDB Atlas, **Network Access** debe permitir `0.0.0.0/0` (Vercel no tiene IPs fijas).
4. Deploy.

El frontend y la API quedan en el mismo dominio (`/api/*`), así que no hace falta configurar CORS.

## Límites a tener en cuenta

- Los envíos se hacen en lotes de 50 contactos por petición (5 en paralelo). Para listas de miles
  de contactos conviene mantener la pestaña abierta hasta que termine.
- Meta limita cuántos destinatarios distintos puedes contactar por día según el nivel de tu número
  (empieza en 250/día en cuentas nuevas sin verificar). Los errores de Meta aparecen en el resumen del envío.
- Mientras la app de Meta esté en modo desarrollo, solo se puede enviar a números agregados como
  destinatarios de prueba.
- El tamaño máximo del Excel es 4 MB.
