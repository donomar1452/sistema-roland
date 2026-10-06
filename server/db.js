import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../data/sistema_roland.db');
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db;

try {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  console.log('Base de datos SQLite conectada correctamente en:', dbPath);
} catch (err) {
  console.error('Error conectando SQLite, usando almacenamiento en archivo JSON como fallback:', err.message);
  db = null;
}

// Inicialización de tablas
export function initDB() {
  if (!db) return;

  db.exec(`
    CREATE TABLE IF NOT EXISTS ordenes (
      id TEXT PRIMARY KEY,
      numero_orden TEXT,
      fecha_emision TEXT,
      hora_emision TEXT,
      fecha_entrega TEXT,
      hora_entrega TEXT,
      condicion_pago TEXT,
      
      cliente_razon_social TEXT,
      cliente_ruc TEXT,
      cliente_direccion TEXT,
      cliente_distrito TEXT,
      cliente_usuario TEXT,
      cliente_dni TEXT,
      cliente_email TEXT,
      cliente_celular TEXT,
      cliente_telefono TEXT,
      
      vehiculo_modelo TEXT,
      vehiculo_nro_motor TEXT,
      vehiculo_nro_chasis TEXT,
      vehiculo_ano_fab TEXT,
      vehiculo_color TEXT,
      vehiculo_placa TEXT,
      vehiculo_kilometraje TEXT,
      vehiculo_gasolina TEXT,
      
      tipo_servicio TEXT, -- JSON string
      trabajos_especificos TEXT, -- JSON string
      resumen_soles TEXT, -- JSON string
      requerimientos_cliente TEXT,
      inventario_vehiculo TEXT, -- JSON string
      forma_pago TEXT,
      facturacion TEXT, -- JSON string
      firmas TEXT, -- JSON string
      
      repuestos_items TEXT, -- JSON array string
      terceros_items TEXT, -- JSON array string
      mano_obra_items TEXT, -- JSON array string
      
      observaciones TEXT,
      tecnico_responsable TEXT,
      hora_inicio TEXT,
      hora_fin TEXT,
      fecha_trabajo TEXT,
      
      estado TEXT DEFAULT 'EN_PROCESO',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Métodos CRUD
export function getAllOrders() {
  if (!db) return getFallbackOrders();
  const stmt = db.prepare('SELECT * FROM ordenes ORDER BY created_at DESC');
  const rows = stmt.all();
  return rows.map(parseOrderRow);
}

export function getOrderById(id) {
  if (!db) return getFallbackOrderById(id);
  const stmt = db.prepare('SELECT * FROM ordenes WHERE id = ?');
  const row = stmt.get(id);
  return row ? parseOrderRow(row) : null;
}

export function saveOrder(orderData) {
  const id = orderData.id || `ORD-${Date.now()}`;
  
  if (!db) {
    return saveFallbackOrder({ ...orderData, id });
  }

  const stmt = db.prepare(`
    INSERT INTO ordenes (
      id, numero_orden, fecha_emision, hora_emision, fecha_entrega, hora_entrega, condicion_pago,
      cliente_razon_social, cliente_ruc, cliente_direccion, cliente_distrito, cliente_usuario,
      cliente_dni, cliente_email, cliente_celular, cliente_telefono,
      vehiculo_modelo, vehiculo_nro_motor, vehiculo_nro_chasis, vehiculo_ano_fab, vehiculo_color,
      vehiculo_placa, vehiculo_kilometraje, vehiculo_gasolina,
      tipo_servicio, trabajos_especificos, resumen_soles, requerimientos_cliente,
      inventario_vehiculo, forma_pago, facturacion, firmas,
      repuestos_items, terceros_items, mano_obra_items,
      observaciones, tecnico_responsable, hora_inicio, hora_fin, fecha_trabajo, estado, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
    )
    ON CONFLICT(id) DO UPDATE SET
      numero_orden=excluded.numero_orden,
      fecha_emision=excluded.fecha_emision,
      hora_emision=excluded.hora_emision,
      fecha_entrega=excluded.fecha_entrega,
      hora_entrega=excluded.hora_entrega,
      condicion_pago=excluded.condicion_pago,
      cliente_razon_social=excluded.cliente_razon_social,
      cliente_ruc=excluded.cliente_ruc,
      cliente_direccion=excluded.cliente_direccion,
      cliente_distrito=excluded.cliente_distrito,
      cliente_usuario=excluded.cliente_usuario,
      cliente_dni=excluded.cliente_dni,
      cliente_email=excluded.cliente_email,
      cliente_celular=excluded.cliente_celular,
      cliente_telefono=excluded.cliente_telefono,
      vehiculo_modelo=excluded.vehiculo_modelo,
      vehiculo_nro_motor=excluded.vehiculo_nro_motor,
      vehiculo_nro_chasis=excluded.vehiculo_nro_chasis,
      vehiculo_ano_fab=excluded.vehiculo_ano_fab,
      vehiculo_color=excluded.vehiculo_color,
      vehiculo_placa=excluded.vehiculo_placa,
      vehiculo_kilometraje=excluded.vehiculo_kilometraje,
      vehiculo_gasolina=excluded.vehiculo_gasolina,
      tipo_servicio=excluded.tipo_servicio,
      trabajos_especificos=excluded.trabajos_especificos,
      resumen_soles=excluded.resumen_soles,
      requerimientos_cliente=excluded.requerimientos_cliente,
      inventario_vehiculo=excluded.inventario_vehiculo,
      forma_pago=excluded.forma_pago,
      facturacion=excluded.facturacion,
      firmas=excluded.firmas,
      repuestos_items=excluded.repuestos_items,
      terceros_items=excluded.terceros_items,
      mano_obra_items=excluded.mano_obra_items,
      observaciones=excluded.observaciones,
      tecnico_responsable=excluded.tecnico_responsable,
      hora_inicio=excluded.hora_inicio,
      hora_fin=excluded.hora_fin,
      fecha_trabajo=excluded.fecha_trabajo,
      estado=excluded.estado,
      updated_at=CURRENT_TIMESTAMP
  `);

  stmt.run(
    id,
    orderData.numero_orden || '',
    orderData.fecha_emision || '',
    orderData.hora_emision || '',
    orderData.fecha_entrega || '',
    orderData.hora_entrega || '',
    orderData.condicion_pago || 'CONTADO',
    orderData.datos_cliente?.razon_social || '',
    orderData.datos_cliente?.ruc || '',
    orderData.datos_cliente?.direccion || '',
    orderData.datos_cliente?.distrito || '',
    orderData.datos_cliente?.usuario || '',
    orderData.datos_cliente?.dni || '',
    orderData.datos_cliente?.email || '',
    orderData.datos_cliente?.celular || '',
    orderData.datos_cliente?.telefono || '',
    orderData.datos_vehiculo?.modelo || '',
    orderData.datos_vehiculo?.nro_motor || '',
    orderData.datos_vehiculo?.nro_chasis || '',
    orderData.datos_vehiculo?.ano_fab || '',
    orderData.datos_vehiculo?.color || '',
    orderData.datos_vehiculo?.placa || '',
    orderData.datos_vehiculo?.kilometraje || '',
    orderData.datos_vehiculo?.gasolina || '',
    JSON.stringify(orderData.tipo_servicio || {}),
    JSON.stringify(orderData.trabajos_especificos || {}),
    JSON.stringify(orderData.resumen_soles || {}),
    orderData.requerimientos_cliente || '',
    JSON.stringify(orderData.inventario_vehiculo || {}),
    orderData.forma_pago || '',
    JSON.stringify(orderData.facturacion || {}),
    JSON.stringify(orderData.firmas || {}),
    JSON.stringify(orderData.repuestos_items || []),
    JSON.stringify(orderData.terceros_items || []),
    JSON.stringify(orderData.mano_obra_items || []),
    orderData.observaciones || '',
    orderData.tecnico_responsable || '',
    orderData.hora_inicio || '',
    orderData.hora_fin || '',
    orderData.fecha_trabajo || '',
    orderData.estado || 'EN_PROCESO'
  );

  return getOrderById(id);
}

export function deleteOrder(id) {
  if (!db) return deleteFallbackOrder(id);
  const stmt = db.prepare('DELETE FROM ordenes WHERE id = ?');
  stmt.run(id);
  return { success: true, id };
}

function parseOrderRow(row) {
  return {
    id: row.id,
    numero_orden: row.numero_orden,
    fecha_emision: row.fecha_emision,
    hora_emision: row.hora_emision,
    fecha_entrega: row.fecha_entrega,
    hora_entrega: row.hora_entrega,
    condicion_pago: row.condicion_pago,
    datos_cliente: {
      razon_social: row.cliente_razon_social,
      ruc: row.cliente_ruc,
      direccion: row.cliente_direccion,
      distrito: row.cliente_distrito,
      usuario: row.cliente_usuario,
      dni: row.cliente_dni,
      email: row.cliente_email,
      celular: row.cliente_celular,
      telefono: row.cliente_telefono
    },
    datos_vehiculo: {
      modelo: row.vehiculo_modelo,
      nro_motor: row.vehiculo_nro_motor,
      nro_chasis: row.vehiculo_nro_chasis,
      ano_fab: row.vehiculo_ano_fab,
      color: row.vehiculo_color,
      placa: row.vehiculo_placa,
      kilometraje: row.vehiculo_kilometraje,
      gasolina: row.vehiculo_gasolina
    },
    tipo_servicio: tryParseJSON(row.tipo_servicio, {}),
    trabajos_especificos: tryParseJSON(row.trabajos_especificos, {}),
    resumen_soles: tryParseJSON(row.resumen_soles, {}),
    requerimientos_cliente: row.requerimientos_cliente,
    inventario_vehiculo: tryParseJSON(row.inventario_vehiculo, {}),
    forma_pago: row.forma_pago,
    facturacion: tryParseJSON(row.facturacion, {}),
    firmas: tryParseJSON(row.firmas, {}),
    repuestos_items: tryParseJSON(row.repuestos_items, []),
    terceros_items: tryParseJSON(row.terceros_items, []),
    mano_obra_items: tryParseJSON(row.mano_obra_items, []),
    observaciones: row.observaciones,
    tecnico_responsable: row.tecnico_responsable,
    hora_inicio: row.hora_inicio,
    hora_fin: row.hora_fin,
    fecha_trabajo: row.fecha_trabajo,
    estado: row.estado,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function tryParseJSON(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
}

// Fallback JSON File DB Storage
const jsonDBPath = path.join(__dirname, '../data/orders_fallback.json');

function loadJSONDB() {
  if (!fs.existsSync(jsonDBPath)) return [];
  try {
    return JSON.parse(fs.readFileSync(jsonDBPath, 'utf-8'));
  } catch {
    return [];
  }
}

function saveJSONDB(orders) {
  fs.writeFileSync(jsonDBPath, JSON.stringify(orders, null, 2), 'utf-8');
}

function getFallbackOrders() {
  return loadJSONDB();
}

function getFallbackOrderById(id) {
  return loadJSONDB().find(o => o.id === id) || null;
}

function saveFallbackOrder(orderData) {
  const orders = loadJSONDB();
  const idx = orders.findIndex(o => o.id === orderData.id);
  const updated = {
    ...orderData,
    created_at: idx >= 0 ? orders[idx].created_at : new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  if (idx >= 0) {
    orders[idx] = updated;
  } else {
    orders.unshift(updated);
  }
  saveJSONDB(orders);
  return updated;
}

function deleteFallbackOrder(id) {
  const orders = loadJSONDB().filter(o => o.id !== id);
  saveJSONDB(orders);
  return { success: true, id };
}
