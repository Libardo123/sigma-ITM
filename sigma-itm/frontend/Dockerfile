# Dockerfile — Frontend React/Vite
# Imagen ligera con Node para desarrollo

FROM node:20-alpine

WORKDIR /app

# Instalar dependencias primero (caching de layers)
COPY package*.json ./
RUN npm ci

# Copiar el código fuente
COPY . .

# Puerto
EXPOSE 5173

# Vite necesita escuchar en 0.0.0.0 para ser accesible desde el host
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
