const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3000;

// Permite recibir datos en formato JSON
app.use(express.json());

// Reutilizamos una instancia de Puppeteer para mejorar el rendimiento
let browser;
(async () => {
  browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'  // Ocultar Puppeteer como bot
    ],
    headless: true,  // Cambia a false si quieres ver el proceso en una ventana del navegador
  });
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

    // Intentar cargar la URL, con espera del challenge de Cloudflare
    await page.goto(imageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Esperar que Cloudflare resuelva el challenge (si lo hay)
    await page.waitForTimeout(5000);  // Pausa para dar tiempo al proceso de resolución (ajusta el tiempo si es necesario)

    // Esperar a que la navegación esté completamente inactiva
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // Tomar una captura de pantalla de la página
    const buffer = await page.screenshot();

    await page.close(); // Cierra la página para liberar recursos

    // Enviar la imagen como respuesta en formato PNG
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al procesar la imagen o pasar el bloqueo de Cloudflare');
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
