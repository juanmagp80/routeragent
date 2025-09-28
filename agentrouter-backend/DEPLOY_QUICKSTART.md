# 🚀 Desplegar Backend en Render.com (5 minutos)

## 1. Preparar el repositorio
```bash
git add .
git commit -m "✅ Backend listo para Render"
git push origin main
```

## 2. Crear servicio en Render.com
1. Ve a https://render.com
2. Crea cuenta gratuita
3. Conecta tu repositorio GitHub `routeragent`
4. Selecciona "Web Service"

## 3. Configuración del servicio
- **Name**: `routerai-backend`
- **Branch**: `main`
- **Root Directory**: `agentrouter-backend`
- **Runtime**: `Node`
- **Build Command**: `./build.sh`
- **Start Command**: `npm start`

## 4. Variables de entorno
En la sección Environment Variables de Render, añade las siguientes variables usando los valores de tu archivo `.env` local:

| Variable | Descripción | Fuente |
|----------|-------------|---------|
| `NODE_ENV` | `production` | Render predefinido |
| `PORT` | `10000` | Render predefinido |
| `SUPABASE_URL` | Tu URL de Supabase | Del archivo .env |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Del archivo .env |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe | Del archivo .env |
| `JWT_SECRET` | JWT secret | Del archivo .env |
| `STRIPE_WEBHOOK_SECRET` | Secret del webhook | Se genera después |

⚠️ **Importante**: Copia los valores exactos de tu archivo `agentrouter-backend/.env`

## 5. URL final
Una vez desplegado obtendrás:
`https://routerai-backend.onrender.com`

## 6. Configurar webhook en Stripe
1. Ve a https://dashboard.stripe.com/webhooks
2. Añade endpoint: `https://routerai-backend.onrender.com/webhook/stripe`
3. Eventos: `checkout.session.completed`, `invoice.payment_succeeded`
4. Copia el webhook secret a la variable `STRIPE_WEBHOOK_SECRET`

¡Listo! 🎉