const express = require('express');
const puppeteer = require('puppeteer');

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
    const page = await browser.newPage();

    // Simular un agente de usuario real (para evitar ser detectado como bot)
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Configurar la vista del navegador como un usuario real
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

    // Intentar cargar la URL y registrar el código de estado HTTP
    console.log('Navegando a la URL:', imageUrl);
    const response = await page.goto(imageUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    const status = response.status();
    console.log(`Código de estado HTTP: ${status}`);

    // Si el código de estado no es 200 (OK), registrar el error
    if (status !== 200) {
      throw new Error(`Error: HTTP ${status} recibido al intentar acceder a la URL`);
    }

    // Esperar que Cloudflare resuelva el challenge (si lo hay)
    console.log('Esperando a que se resuelva el desafío (si existe)...');
    await new Promise(resolve => setTimeout(resolve, 5000));  // Pausa para dar tiempo al proceso de resolución

    // Tomar una captura de pantalla de la página
    console.log('Tomando captura de pantalla...');
    const buffer = await page.screenshot();

    await page.close(); // Cierra la página para liberar recursos

    // Enviar la imagen como respuesta en formato PNG y asegurar que sea binaria
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'inline; filename="captura.png"');
    res.end(buffer, 'binary'); // Usar res.end para asegurarse de que se envían los datos binarios correctamente

    console.log('Imagen procesada y enviada correctamente.');
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
