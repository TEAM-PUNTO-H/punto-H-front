# --------------------------
# Etapa 1: Build de Angular
# --------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Copiamos dependencias
COPY package*.json ./
RUN npm install

# Copiamos el resto del código
COPY . .

# Build de producción
RUN npm run build --prod

# --------------------------
# Etapa 2: Servir con Nginx
# --------------------------
FROM nginx:alpine

# Copiamos el build generado dentro del contenedor nginx
COPY --from=build /app/dist/punto-h-front/browser /usr/share/nginx/html

# Config SPA para que Angular maneje las rutas
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
