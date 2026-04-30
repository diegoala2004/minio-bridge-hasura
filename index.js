const express = require('express');
const Minio = require('minio');
require('dotenv').config();

const app = express();
app.use(express.json());

const minioClient = new Minio.Client({
  endPoint: 'storage33.e-mcy.icarosoft.com',
  port: 443, 
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
    // Definimos el método HTTP y los headers que queremos firmar
    const method = 'PUT';
    const expires = 600; // 10 minutos
    
    // EstereqParams fuerza a que la firma espere un binario
    const reqParams = {
      'content-type': 'application/octet-stream'
    };

    // EL MÉTODO CORRECTO ES presignedUrl
    const uploadUrl = await minioClient.presignedUrl(method, bucketName, file_name, expires, reqParams);
    
    console.log(`URL firmada con éxito para: ${file_name}`);

    res.json({
      upload_url: uploadUrl,
      file_path: `${bucketName}/${file_name}`
    });
  } catch (error) {
    console.error('Error detallado en el Bridge:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Bridge activo en puerto ${PORT}`));