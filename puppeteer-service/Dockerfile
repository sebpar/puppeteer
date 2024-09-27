# Usar la imagen buildkite/puppeteer y actualizar a Node.js v16
FROM buildkite/puppeteer:latest

# Añadir clave pública de Google Chrome y actualizar el repositorio
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E88979FB9B30ACF2

# Actualizar a la versión de Node.js v16
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

# Verificar la versión de Node.js para asegurarnos de que es la correcta
RUN node -v

# Crear directorio de trabajo
WORKDIR /app

# Copiar los archivos de la aplicación
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos de la aplicación
COPY . .

# Exponer el puerto 3000
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "index.js"]
