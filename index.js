const express = require('express');
const Minio = require('minio');
require('dotenv').config();

const app = express();
app.use(express.json());

const minioClient = new Minio.Client({
  endPoint: 'storage33.e-mcy.icarosoft.com',
  // Si el puerto 9000 falla en la nube, el 443 es la alternativa universal
  port: 443, 
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});

app.post('/get-url', async (req, res) => {
  const { file_name } = req.body.input;
  const bucketName = 'evidencias';

  try {
    // Generamos la URL para subir el archivo (válida por 10 minutos)
    const uploadUrl = await minioClient.presignedPutUrl(bucketName, file_name, 10 * 60);
    
    // Devolvemos la respuesta que Hasura espera
    res.json({
      upload_url: uploadUrl,
      file_path: `${bucketName}/${file_name}`
    });
  } catch (error) {
    console.error('Error de MinIO:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Bridge activo en puerto ${PORT}`));