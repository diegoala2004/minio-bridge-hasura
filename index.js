const express = require('express');
const Minio = require('minio');
require('dotenv').config();

const app = express();
app.use(express.json());

// Configuramos el cliente apuntando estrictamente al puerto 9000
const minioClient = new Minio.Client({
  endPoint: 'storage33.e-mcy.icarosoft.com',
  port: 9000, 
  useSSL: true, // storage33 usa SSL incluso en el 9000
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});

app.post('/get-url', async (req, res) => {
  if (!req.body.input || !req.body.input.file_name) {
    return res.status(400).json({ error: "file_name is required" });
  }

  const { file_name } = req.body.input;
  const bucketName = 'evidencias';

  try {
    // Usamos el nombre correcto de la función
    const uploadUrl = await minioClient.presignedPutObject(bucketName, file_name, 600);
    
    console.log('URL generada con éxito');
    res.json({
      upload_url: uploadUrl,
      file_path: `${bucketName}/${file_name}`
    });
  } catch (error) {
    console.error('Error detallado de MinIO:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Bridge activo en puerto ${PORT}`));