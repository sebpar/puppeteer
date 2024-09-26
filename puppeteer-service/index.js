const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3002;

// Permite recibir datos en formato JSON
app.use(express.json());

app.post('/process-image', async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).send('Falta el parámetro imageUrl');
  }

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.goto(imageUrl, { waitUntil: 'networkidle2' });

    // Tomar una captura de pantalla de la página
    const buffer = await page.screenshot();

    await browser.close();

    // Enviar la imagen como respuesta
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al procesar la imagen');
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
