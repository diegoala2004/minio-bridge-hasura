const express = require('express');
const Minio = require('minio');
require('dotenv').config();

const app = express();
app.use(express.json());

// Configuración optimizada para MinIO detrás de Nginx
const minioClient = new Minio.Client({
  endPoint: 'storage33.e-mcy.icarosoft.com',
  port: 443, 
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  region: 'us-east-1',
  // VITAL: Nginx no suele manejar bien los subdominios de buckets (bucket.dominio.com)
  pathStyle: true 
});

app.post('/get-url', async (req, res) => {
  if (!req.body.input || !req.body.input.file_name) {
    return res.status(400).json({ error: "file_name is required" });
  }

  const { file_name } = req.body.input;
  const bucketName = 'evidencias';

  try {
    // Generamos la URL firmada
    const uploadUrl = await minioClient.presignedPutObject(bucketName, file_name, 600);
    
    console.log(`URL generada para: ${file_name}`);

    // Enviamos una respuesta más completa
    res.json({
      upload_url: uploadUrl,
      file_path: `${bucketName}/${file_name}`,
      // Le avisamos al frontend/Apidog qué headers son obligatorios para que Nginx no lo rebote
    });
  } catch (error) {
    console.error('Error detallado de MinIO:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Supermarket Bridge activo en puerto ${PORT}`));