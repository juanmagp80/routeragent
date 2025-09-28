# 🚀 Desplegar Backend en Render.com (5 minutos)

## 1. Preparar el repositorio
```bash
git add .
git commit -m "✅ Backend listo para Render"
git push origin clean-deploy
```

## 2. Crear servicio en Render.com
1. Ve a https://render.com
2. Crea cuenta gratuita
3. Conecta tu repositorio GitHub `routeragent`
4. Selecciona "Web Service"

## 3. Configuración del servicio
- **Name**: `routerai-backend`
- **Branch**: `clean-deploy`
- **Root Directory**: `agentrouter-backend`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

## 4. Variables de entorno
Añade estas variables en la sección Environment:
```
NODE_ENV=production
PORT=10000
SUPABASE_URL=tu_supabase_url
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key
STRIPE_SECRET_KEY=tu_stripe_secret_key_real
STRIPE_WEBHOOK_SECRET=whsec_generado_en_stripe
JWT_SECRET=tu_jwt_secret
```

## 5. URL final
Una vez desplegado obtendrás:
`https://routerai-backend.onrender.com`

## 6. Configurar webhook en Stripe
1. Ve a https://dashboard.stripe.com/webhooks
2. Añade endpoint: `https://routerai-backend.onrender.com/webhook/stripe`
3. Eventos: `checkout.session.completed`, `invoice.payment_succeeded`
4. Copia el webhook secret a la variable `STRIPE_WEBHOOK_SECRET`

¡Listo! 🎉