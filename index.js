const express = require('express');
const Minio = require('minio');
require('dotenv').config();

const app = express();
app.use(express.json());

const minioClient = new Minio.Client({
  endPoint: 'storage33.e-mcy.icarosoft.com',
  port: 9000,      // Puerto de la API de MinIO
  useSSL: true,    // Mantenlo en true
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});

app.post('/get-url', async (req, res) => {
  // Hasura envía los datos en req.body.input
  const { file_name } = req.body.input;
  
  try {
    // Genera URL para subida (putObject) válida por 600 segundos (10 min)
    const url = await minioClient.presignedPutObject('evidencias', file_name, 600);
    
    res.json({
      upload_url: url,
      file_path: `evidencias/${file_name}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cambia la última línea de tu index.js por esta:
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor listo en puerto ${PORT}`));