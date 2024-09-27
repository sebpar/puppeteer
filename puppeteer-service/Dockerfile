# Usar una imagen base de Node.js v16
FROM node:16-buster-slim

# Instalar las dependencias necesarias para Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libnss3 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    fonts-liberation \
    libappindicator3-1 \
    libsecret-1-0 \
    && rm -rf /var/lib/apt/lists/*

# Limpiar la caché de npm y eliminar cualquier archivo previo
RUN npm cache clean --force && rm -rf node_modules package-lock.json

# Instalar Puppeteer con flags adicionales para evitar conflictos
RUN npm install puppeteer --unsafe-perm=true --allow-root --no-audit --legacy-peer-deps

# Crear directorio de trabajo
WORKDIR /app

# Copiar los archivos de la aplicación
COPY package*.json ./

# Instalar las dependencias de la aplicación
RUN npm install --no-audit --legacy-peer-deps

# Copiar el resto de los archivos de la aplicación
COPY . .

# Exponer el puerto 3000
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "index.js"]
