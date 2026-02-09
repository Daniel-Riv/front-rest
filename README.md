# Sazón Restobar - Mobile (React Native + Expo)

Proyecto base para el **front mobile** (React Native) con **mejores prácticas**:
- Expo + TypeScript
- Expo Router (ruteo por archivos)
- Axios (cliente HTTP) + `services/endpoints.ts`
- React Hook Form + Zod (validación de formularios)
- Zustand (estado global de auth) + persistencia segura (SecureStore)
- Manejo de env con `EXPO_PUBLIC_API_URL`

## Requisitos
- Node 18+ (recomendado)
- Expo CLI (opcional): `npm i -g expo`

## Instalación
```bash
npm install
```

## Variables de entorno
Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

> En Expo, las variables con prefijo `EXPO_PUBLIC_` se exponen al cliente.

## Ejecutar
```bash
npm run start
# o
npm run android
npm run ios
```

## Estructura
- `app/` rutas (Expo Router)
- `src/services/` API, endpoints, manejo de token
- `src/store/` estado global (auth)
- `src/components/` UI reutilizable
- `src/schemas/` validaciones (Zod)

## Backend endpoints
Edita `src/services/endpoints.ts` para alinear con el back.
Por defecto se incluye:
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET  /users/me`
