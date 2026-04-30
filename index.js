const express = require('express');
const Minio = require('minio');
require('dotenv').config();

const app = express();
app.use(express.json());

const minioClient = new Minio.Client({
  endPoint: 'storage33.e-mcy.icarosoft.com',
  port: 443, // Volvemos al 443 porque el 9000 está bloqueado
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  region: 'us-east-1',
  pathStyle: true 
});

app.post('/get-url', async (req, res) => {
  if (!req.body.input || !req.body.input.file_name) {
    return res.status(400).json({ error: "file_name is required" });
  }

  const { file_name } = req.body.input;
  const bucketName = 'evidencias';

  try {
    // IMPORTANTE: Agregamos el header de contenido en la firma
    // Esto obliga a MinIO y Nginx a esperar un archivo, no una carga de web
    const reqParams = {
      'Content-Type': 'application/octet-stream',
    };

    const uploadUrl = await minioClient.presignedPutUrl('PUT', bucketName, file_name, 600, reqParams);
    
    console.log(`URL firmada con headers para: ${file_name}`);

    res.json({
      upload_url: uploadUrl,
      file_path: `${bucketName}/${file_name}`
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Bridge Supermarket Blacklist activo`));