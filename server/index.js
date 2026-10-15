import express from 'express';
import cors from 'cors';
import multer from 'multer';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

import { 
  initDB, closeDB, getAllOrders, getOrderById, saveOrder, deleteOrder, 
  getAllInventoryParts, saveInventoryPart, deleteInventoryPart,
  updateOrderStatus, getWorkshopSettings, saveWorkshopSettings,
  exportDatabaseData, importDatabaseData 
} from './db.js';

import { extractDataFromImages, generateInitialDataFromForm } from './ocrService.js';
import { verifyPIN } from './auth.js';
import { createDatabaseBackup } from './backupService.js';
import { consultarDNI, consultarRUC } from './dniService.js';

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

// GET /api/health (Health check para Render y monitorización de uptime)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Sistema Roland / Alonso',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

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

// GET /api/consulta-dni/:dni (Consulta de DNI Reniec)
app.get('/api/consulta-dni/:dni', async (req, res) => {
  try {
    const result = await consultarDNI(req.params.dni);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/consulta-ruc/:ruc (Consulta de RUC Sunat)
app.get('/api/consulta-ruc/:ruc', async (req, res) => {
  try {
    const result = await consultarRUC(req.params.ruc);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
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

// PATCH /api/orders/:id/status (Cambio de estado rápido para mostrador de taller)
app.patch('/api/orders/:id/status', (req, res) => {
  try {
    const { estado } = req.body;
    if (!estado) {
      return res.status(400).json({ success: false, error: 'El estado es requerido.' });
    }
    const updated = updateOrderStatus(req.params.id, estado);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Orden no encontrada.' });
    }
    createDatabaseBackup();
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error actualizando estado:', err);
    res.status(500).json({ success: false, error: err.message || 'Error actualizando estado.' });
  }
});

// GET /api/export/csv (Exportar órdenes a Excel / CSV para contabilidad)
app.get('/api/export/csv', (req, res) => {
  try {
    const orders = getAllOrders();
    // BOM UTF-8 para apertura directa y limpia en Microsoft Excel
    let csv = '\uFEFFN° Orden;Fecha;Cliente;DNI/RUC;Celular;Vehículo;Placa;Total (S/);Adelanto (S/);Saldo (S/);Estado\n';

    for (const o of orders) {
      const num = o.numero_orden || '';
      const fecha = o.fecha_emision || '';
      const cliente = (o.datos_cliente?.razon_social || '').replace(/;/g, ' ');
      const doc = o.datos_cliente?.dni || o.datos_cliente?.ruc || '';
      const cel = o.datos_cliente?.celular || o.datos_cliente?.telefono || '';
      const moto = (o.datos_vehiculo?.modelo || '').replace(/;/g, ' ');
      const placa = o.datos_vehiculo?.placa || '';
      const total = (o.resumen_soles?.valor_venta_total || o.resumen_soles?.total_a_pagar || 0).toFixed(2);
      const adelanto = (o.resumen_soles?.adelantos || 0).toFixed(2);
      const saldo = (o.resumen_soles?.total_a_pagar || 0).toFixed(2);
      const estado = o.estado || 'EN_PROCESO';

      csv += `"${num}";"${fecha}";"${cliente}";"${doc}";"${cel}";"${moto}";"${placa}";${total};${adelanto};${saldo};"${estado}"\n`;
    }

    const filename = `reporte_taller_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.send(csv);
  } catch (err) {
    console.error('Error generando CSV:', err);
    res.status(500).json({ success: false, error: 'Error generando reporte CSV.' });
  }
});

// GET /api/backup/export (Descarga de respaldo completo JSON)
app.get('/api/backup/export', (req, res) => {
  try {
    const data = exportDatabaseData();
    const filename = `backup_completo_roland_${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error generando respaldo JSON:', err);
    res.status(500).json({ success: false, error: 'Error generando archivo de respaldo.' });
  }
});

// POST /api/backup/restore (Restaurar respaldo desde archivo JSON)
app.post('/api/backup/restore', (req, res) => {
  try {
    const payload = req.body;
    const result = importDatabaseData(payload);
    createDatabaseBackup();
    res.json({ success: true, message: 'Respaldo restaurado exitosamente', data: result });
  } catch (err) {
    console.error('Error restaurando respaldo:', err);
    res.status(400).json({ success: false, error: err.message || 'Error restaurando respaldo.' });
  }
});

// GET /api/settings (Obtener configuración del taller)
app.get('/api/settings', (req, res) => {
  try {
    const settings = getWorkshopSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error obteniendo configuración.' });
  }
});

// POST /api/settings (Guardar configuración del taller)
app.post('/api/settings', (req, res) => {
  try {
    const saved = saveWorkshopSettings(req.body);
    res.json({ success: true, data: saved });
  } catch (err) {
    console.error('Error guardando configuración:', err);
    res.status(500).json({ success: false, error: 'Error guardando configuración del taller.' });
  }
});

// --- API INVENTARIO DE REPUESTOS Y STOCK ---
// GET /api/inventory
app.get('/api/inventory', (req, res) => {
  try {
    const parts = getAllInventoryParts();
    res.json({ success: true, count: parts.length, data: parts });
  } catch (err) {
    console.error('Error obteniendo inventario:', err);
    res.status(500).json({ success: false, error: 'Error obteniendo inventario de repuestos.' });
  }
});

// POST /api/inventory (Crear o Actualizar Repuesto)
app.post('/api/inventory', (req, res) => {
  try {
    const saved = saveInventoryPart(req.body);
    res.json({ success: true, data: saved });
  } catch (err) {
    console.error('Error guardando repuesto:', err);
    res.status(500).json({ success: false, error: 'Error guardando repuesto en el inventario.' });
  }
});

// DELETE /api/inventory/:id (Eliminar Repuesto)
app.delete('/api/inventory/:id', (req, res) => {
  try {
    const result = deleteInventoryPart(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error eliminando repuesto del inventario.' });
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

// Servir estáticos de React en producción
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // Fallback para React Router / SPA (Compatible con Express 5 y path-to-regexp v8)
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
} else {
  console.warn('⚠️ [AVISO] Carpeta "dist" no encontrada. Ejecute "npm run build" para compilar el cliente.');
}

// Middleware de manejo global de errores seguro
app.use((err, req, res, next) => {
  console.error('Error de servidor no manejado:', err.message);
  res.status(500).json({
    success: false,
    error: err.message || 'Error interno del servidor.'
  });
});

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const server = app.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIpAddress();
  console.log(`========================================================`);
  console.log(`🚀 SISTEMA ROLAND / ALONSO - ENTORNO REAL ACTIVO`);
  console.log(`========================================================`);
  console.log(`💻 Acceso Local (esta PC):        http://localhost:${PORT}`);
  console.log(`📱 Acceso Red WiFi Taller:       http://${localIp}:${PORT}`);
  console.log(`🔒 Modo Producción & Seguridad:   ACTIVO`);
  console.log(`========================================================`);
});

// Cierre seguro (Graceful Shutdown)
function handleShutdown(signal) {
  console.log(`\nRecibida señal ${signal}. Cerrando servidor de manera segura...`);
  server.close(() => {
    closeDB();
    console.log('Servidor HTTP y base de datos cerrados limpiamente.');
    process.exit(0);
  });
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

