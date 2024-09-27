const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Permite recibir datos en formato JSON
app.use(express.json());

// Inicializar Puppeteer
let browser;
(async () => {
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    console.log('Navegador Puppeteer lanzado con éxito');
  } catch (error) {
    console.error('Error al lanzar Puppeteer:', error);
  }
})();

// Función para validar URL
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

// Función para verificar si la URL parece ser una imagen
const isImageUrl = (url) => {
  return url.match(/\.(jpeg|jpg|gif|png|svg)$/) !== null;
};

// Función para descargar la imagen usando axios
const downloadImage = async (url) => {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'arraybuffer', // Recibir la imagen como datos binarios
  });
  return response.data; // Retornar los datos de la imagen
};

app.post('/process-image', async (req, res) => {
  if (!browser) {
    console.error('El navegador Puppeteer no se ha lanzado correctamente');
    return res.status(500).send('Error interno: El navegador no está disponible');
  }

  const { imageUrl } = req.body;

  // Validación del parámetro imageUrl
  if (!imageUrl) {
    return res.status(400).send('Falta el parámetro imageUrl');
  }

  // Verificar si la URL es válida
  if (!isValidUrl(imageUrl)) {
    return res.status(400).send('URL inválida');
  }

  // Verificar si la URL parece ser una imagen
  if (!isImageUrl(imageUrl)) {
    return res.status(400).send('La URL no parece ser una imagen');
  }

  try {
    console.log('Navegando a la URL:', imageUrl);
    
    // Descargar la imagen directamente desde la URL
    const imageBuffer = await downloadImage(imageUrl);

    // Enviar la imagen como respuesta en formato PNG
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'inline; filename="imagen.png"');
    res.end(imageBuffer, 'binary'); // Usar res.end para asegurarse de que se envían los datos binarios correctamente

    console.log('Imagen descargada y enviada correctamente.');
  } catch (error) {
    // Registrar detalles del error
    console.error('Error en el proceso:', error.message);
    console.error(error.stack);
    res.status(500).send(`Error al procesar la imagen: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
