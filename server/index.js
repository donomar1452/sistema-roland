import express from 'express';
import cors from 'cors';
import multer from 'multer';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDB, getAllOrders, getOrderById, saveOrder, deleteOrder } from './db.js';
import { extractDataFromImages, generateInitialDataFromForm } from './ocrService.js';
import { verifyPIN } from './auth.js';
import { createDatabaseBackup } from './backupService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Helmet HTTP Security Headers
app.use(helmet({
  contentSecurityPolicy: false, // Permitir fuentes externas y estilos dinámicos
  crossOriginEmbedderPolicy: false
}));

// 2. Rate Limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // 300 peticiones por ventana por IP
  message: { success: false, error: 'Demasiadas peticiones desde esta IP. Intente de nuevo en 15 minutos.' }
});

const ocrLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 15, // Máximo 15 análisis de foto por minuto
  message: { success: false, error: 'Límite de peticiones de análisis por IA alcanzado. Por favor espere un minuto.' }
});

app.use(globalLimiter);

// 3. Middlewares
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// 4. Secure Multer Uploads (Validación estricta Mime-Type y límite 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG o WEBP.'));
    }
  }
});

// Inicializar Base de Datos y realizar backup inicial de arranque
initDB();
createDatabaseBackup();

// --- ENDPOINTS DE LA API ---

// POST /api/verify-pin (Validar PIN de taller)
app.post('/api/verify-pin', (req, res) => {
  const { pin } = req.body;
  const isValid = verifyPIN(pin);
  if (isValid) {
    res.json({ success: true, message: 'PIN Correcto' });
  } else {
    res.status(401).json({ success: false, error: 'PIN de taller incorrecto.' });
  }
});

// GET /api/orders
app.get('/api/orders', (req, res) => {
  try {
    const orders = getAllOrders();
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    console.error('Error obteniendo órdenes:', err);
    res.status(500).json({ success: false, error: 'Error interno obteniendo órdenes.' });
  }
});

// GET /api/orders/:id
app.get('/api/orders/:id', (req, res) => {
  try {
    const order = getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Orden no encontrada' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error obteniendo orden.' });
  }
});

// POST /api/orders (Crear o Actualizar)
app.post('/api/orders', (req, res) => {
  try {
    const saved = saveOrder(req.body);
    createDatabaseBackup(); // Backup preventivo tras cada guardado
    res.json({ success: true, data: saved });
  } catch (err) {
    console.error('Error guardando orden:', err);
    res.status(500).json({ success: false, error: 'Error guardando orden de servicio.' });
  }
});

// DELETE /api/orders/:id
app.delete('/api/orders/:id', (req, res) => {
  try {
    const result = deleteOrder(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error eliminando la orden.' });
  }
});

// POST /api/extract (OCR / Visión por IA con Rate Limiting)
app.post('/api/extract', ocrLimiter, upload.array('images', 5), async (req, res) => {
  try {
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => ({
        buffer: file.buffer,
        mimeType: file.mimetype
      }));
    } else if (req.body.base64Images && Array.isArray(req.body.base64Images)) {
      images = req.body.base64Images.map(b64 => {
        const parts = b64.split(';base64,');
        const mimeType = parts[0].replace('data:', '');
        const buffer = Buffer.from(parts[1], 'base64');
        return { buffer, mimeType };
      });
    }

    if (images.length === 0) {
      const demoData = generateInitialDataFromForm();
      return res.json({ success: true, data: demoData, isDemo: true });
    }

    console.log(`🔒 [Seguridad] Procesando ${images.length} imagen(es) con módulo OCR/IA...`);
    const extractedData = await extractDataFromImages(images);

    res.json({
      success: true,
      data: extractedData,
      isDemo: !process.env.GEMINI_API_KEY
    });
  } catch (err) {
    console.error('Error en extracción por IA:', err.message);
    res.status(400).json({
      success: false,
      error: err.message || 'Error procesando la imagen.',
      fallbackData: generateInitialDataFromForm()
    });
  }
});

// Servir estáticos en producción
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback SPA de React para cualquier ruta del navegador
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Middleware de manejo global de errores seguro
app.use((err, req, res, next) => {
  console.error('Error de servidor no manejado:', err.message);
  res.status(500).json({
    success: false,
    error: err.message || 'Error interno del servidor.'
  });
});

app.listen(PORT, () => {
  console.log(`================================================`);
  console.log(`🔒 Servidor SEGURO escuchando en http://localhost:${PORT}`);
  console.log(`================================================`);
});
