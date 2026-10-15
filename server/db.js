import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../data/sistema_roland.db');
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

    CREATE TABLE IF NOT EXISTS inventario_repuestos (
      id TEXT PRIMARY KEY,
      codigo TEXT,
      descripcion TEXT,
      categoria TEXT,
      precio REAL,
      stock INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS configuracion_taller (
      id TEXT PRIMARY KEY,
      nombre_taller TEXT,
      razon_social TEXT,
      ruc TEXT,
      direccion TEXT,
      distrito TEXT,
      departamento TEXT,
      telefono TEXT,
      whatsapp TEXT,
      tecnico_principal TEXT,
      terminos_garantia TEXT,
      pie_pagina TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Sembrado de Configuración de Taller si está vacía
  const configStmt = db.prepare('SELECT COUNT(*) as count FROM configuracion_taller');
  const { count: configCount } = configStmt.get();
  if (configCount === 0) {
    const insertConfig = db.prepare(`
      INSERT INTO configuracion_taller (
        id, nombre_taller, razon_social, ruc, direccion, distrito, departamento,
        telefono, whatsapp, tecnico_principal, terminos_garantia, pie_pagina
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertConfig.run(
      'config_principal',
      "ROLAND / ALONSO",
      "TECNIMOTOR'S & RECTIFICACIONES ALONSO E.I.R.L.",
      "20600240677",
      "CALLE LIBERTAD N° 491 - MORRO SOLAR",
      "JAÉN",
      "CAJAMARCA",
      "980 988 321 - 931 429 334",
      "998843989",
      "ALONSO VARGAS L.",
      "Garantía de servicio técnico: 30 días en mano de obra. Todo repuesto sustituido queda a disposición del cliente. Vehículos no retirados pasados 15 días incurren en costo de cochera.",
      "Servicio especializado de inyección electrónica, rectificaciones y venta de repuestos originales."
    );
  }

  // Sembrado inicial de repuestos si la tabla está vacía
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM inventario_repuestos');
  const { count } = countStmt.get();
  if (count === 0) {
    const insertPart = db.prepare(`
      INSERT INTO inventario_repuestos (id, codigo, descripcion, categoria, precio, stock)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const seedParts = [
      ['p1', 'HON-10W30', 'Aceite Honda 4T 10W30 Mineral (1L)', 'Lubricantes', 35.00, 24],
      ['p2', 'MOT-5100', 'Aceite Motul 5100 15W50 Semi-sintético (1L)', 'Lubricantes', 42.00, 18],
      ['p3', 'MOB-20W50', 'Aceite Mobil Super 4T 20W50 (1L)', 'Lubricantes', 28.00, 15],
      ['p4', 'HON-FILT01', 'Filtro de Aceite Honda GL 150 / CB 125', 'Filtros', 15.00, 14],
      ['p5', 'PUL-FILT02', 'Filtro de Aceite Pulsar 200 NS / 150', 'Filtros', 18.00, 10],
      ['p6', 'PAST-DEL-01', 'Pastillas de Freno Delantero Originales', 'Frenos', 45.00, 16],
      ['p7', 'ZAP-POST-01', 'Zapatas de Freno Posterior Reforzadas', 'Frenos', 35.00, 12],
      ['p8', 'NGK-CPR8', 'Bujía de Encendido NGK CPR8EA-9', 'Motor', 18.00, 32],
      ['p9', 'NGK-D8EA', 'Bujía Estándar NGK D8EA', 'Motor', 15.00, 25],
      ['p10', 'KIT-ARR-428', 'Kit de Arrastre Completo 428H (Corona+Piñón+Cadena)', 'Transmisión', 140.00, 8],
      ['p11', 'CAD-428H', 'Cadena de Transmisión Reforzada 428H-128L', 'Transmisión', 55.00, 11],
      ['p12', 'CAM-18', 'Cámara de Llanta Posterior 2.75/3.00-18', 'Neumáticos', 25.00, 20],
      ['p13', 'CAM-17', 'Cámara de Llanta Delantera 110/90-17', 'Neumáticos', 28.00, 15],
      ['p14', 'BAT-12V7A', 'Batería Seca Libre de Mantenimiento 12V 7Ah', 'Eléctrico', 120.00, 6],
      ['p15', 'LED-H4', 'Foco Faro Delantero LED H4 Alta/Baja', 'Eléctrico', 35.00, 14],
      ['p16', 'LIQ-DOT4', 'Líquido de Frenos DOT 4 Bosch / Varga (250ml)', 'Fluidos', 16.00, 18],
      ['p17', 'CAB-EMB', 'Cable de Embrague Reforzado Universal', 'Mandos', 20.00, 12],
      ['p18', 'CAB-ACE', 'Cable de Acelerador con Funda', 'Mandos', 18.00, 10]
    ];
    for (const p of seedParts) {
      insertPart.run(...p);
    }
  }
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

  // Obtener orden previa para calcular ajuste de stock
  const previousOrder = getOrderById(id);

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

  // AUTO-GESTIÓN DE STOCK: Deducir automáticamente del inventario
  if (orderData.estado !== 'CANCELADO') {
    adjustInventoryStockOnOrderSave(previousOrder, orderData);
  }

  return getOrderById(id);
}

export function deleteOrder(id) {
  if (!db) return deleteFallbackOrder(id);

  // Restaurar stock de repuestos si la orden se elimina
  const existing = getOrderById(id);
  if (existing && existing.estado !== 'CANCELADO' && Array.isArray(existing.repuestos_items)) {
    restoreOrderPartsStock(existing.repuestos_items);
  }

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

// --- CRUD DE INVENTARIO DE REPUESTOS ---
export function getAllInventoryParts() {
  if (!db) return [];
  const stmt = db.prepare('SELECT * FROM inventario_repuestos ORDER BY categoria ASC, descripcion ASC');
  return stmt.all();
}

export function saveInventoryPart(part) {
  const id = part.id || `p_${Date.now()}`;
  if (!db) return { ...part, id };

  const stmt = db.prepare(`
    INSERT INTO inventario_repuestos (id, codigo, descripcion, categoria, precio, stock, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      codigo=excluded.codigo,
      descripcion=excluded.descripcion,
      categoria=excluded.categoria,
      precio=excluded.precio,
      stock=excluded.stock,
      updated_at=CURRENT_TIMESTAMP
  `);

  stmt.run(
    id,
    part.codigo || '',
    part.descripcion || '',
    part.categoria || 'Varios',
    Number(part.precio) || 0,
    Number(part.stock) || 0
  );

  const getStmt = db.prepare('SELECT * FROM inventario_repuestos WHERE id = ?');
  return getStmt.get(id);
}

export function deleteInventoryPart(id) {
  if (!db) return { success: true, id };
  const stmt = db.prepare('DELETE FROM inventario_repuestos WHERE id = ?');
  stmt.run(id);
  return { success: true, id };
}

// --- ACTUALIZACIÓN RÁPIDA DE ESTADO DE LA ORDEN ---
export function updateOrderStatus(id, newStatus) {
  if (!db) return null;
  const prev = getOrderById(id);
  if (!prev) return null;

  // Si pasa a CANCELADO, devolvemos repuestos al stock del taller
  if (newStatus === 'CANCELADO' && prev.estado !== 'CANCELADO') {
    restoreOrderPartsStock(prev.repuestos_items || []);
  } else if (prev.estado === 'CANCELADO' && newStatus !== 'CANCELADO') {
    deductOrderPartsStock(prev.repuestos_items || []);
  }

  const stmt = db.prepare('UPDATE ordenes SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(newStatus, id);
  return getOrderById(id);
}

// --- GESTIÓN AUTOMÁTICA DE STOCK (ALTA/BAJA POR ÓRDENES) ---
function adjustInventoryStockOnOrderSave(previousOrder, newOrder) {
  if (!db) return;

  const newItems = Array.isArray(newOrder.repuestos_items) ? newOrder.repuestos_items : [];
  const oldItems = (previousOrder && Array.isArray(previousOrder.repuestos_items)) ? previousOrder.repuestos_items : [];

  // Mapear cantidades antiguas por clave (código o descripción)
  const oldMap = new Map();
  for (const item of oldItems) {
    const key = ((item.num_parte || '') + '||' + (item.descripcion || '')).trim().toLowerCase();
    oldMap.set(key, (oldMap.get(key) || 0) + (Number(item.cantidad) || 0));
  }

  // Mapear cantidades nuevas
  const newMap = new Map();
  for (const item of newItems) {
    const key = ((item.num_parte || '') + '||' + (item.descripcion || '')).trim().toLowerCase();
    newMap.set(key, (newMap.get(key) || 0) + (Number(item.cantidad) || 0));
  }

  // Procesar diferencias de stock
  const allKeys = new Set([...oldMap.keys(), ...newMap.keys()]);

  for (const key of allKeys) {
    const oldQty = oldMap.get(key) || 0;
    const newQty = newMap.get(key) || 0;
    const delta = newQty - oldQty; // Positivo: se gastaron más; Negativo: se liberaron

    if (delta !== 0) {
      const [code, desc] = key.split('||');
      if (code) {
        db.prepare(`
          UPDATE inventario_repuestos 
          SET stock = MAX(0, stock - ?), updated_at = CURRENT_TIMESTAMP 
          WHERE LOWER(TRIM(codigo)) = ?
        `).run(delta, code);
      } else if (desc) {
        db.prepare(`
          UPDATE inventario_repuestos 
          SET stock = MAX(0, stock - ?), updated_at = CURRENT_TIMESTAMP 
          WHERE LOWER(TRIM(descripcion)) = ?
        `).run(delta, desc);
      }
    }
  }
}

function deductOrderPartsStock(items) {
  if (!db || !Array.isArray(items)) return;
  for (const item of items) {
    const qty = Number(item.cantidad) || 0;
    if (qty <= 0) continue;
    const code = (item.num_parte || '').trim().toLowerCase();
    const desc = (item.descripcion || '').trim().toLowerCase();

    if (code) {
      db.prepare(`UPDATE inventario_repuestos SET stock = MAX(0, stock - ?), updated_at = CURRENT_TIMESTAMP WHERE LOWER(TRIM(codigo)) = ?`).run(qty, code);
    } else if (desc) {
      db.prepare(`UPDATE inventario_repuestos SET stock = MAX(0, stock - ?), updated_at = CURRENT_TIMESTAMP WHERE LOWER(TRIM(descripcion)) = ?`).run(qty, desc);
    }
  }
}

function restoreOrderPartsStock(items) {
  if (!db || !Array.isArray(items)) return;
  for (const item of items) {
    const qty = Number(item.cantidad) || 0;
    if (qty <= 0) continue;
    const code = (item.num_parte || '').trim().toLowerCase();
    const desc = (item.descripcion || '').trim().toLowerCase();

    if (code) {
      db.prepare(`UPDATE inventario_repuestos SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE LOWER(TRIM(codigo)) = ?`).run(qty, code);
    } else if (desc) {
      db.prepare(`UPDATE inventario_repuestos SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE LOWER(TRIM(descripcion)) = ?`).run(qty, desc);
    }
  }
}

// --- CONFIGURACIÓN REAL DEL TALLER ---
export function getWorkshopSettings() {
  const defaultSettings = {
    id: 'config_principal',
    nombre_taller: "ROLAND / ALONSO",
    razon_social: "TECNIMOTOR'S & RECTIFICACIONES ALONSO E.I.R.L.",
    ruc: "20600240677",
    direccion: "CALLE LIBERTAD N° 491 - MORRO SOLAR",
    distrito: "JAÉN",
    departamento: "CAJAMARCA",
    telefono: "980 988 321 - 931 429 334",
    whatsapp: "998843989",
    tecnico_principal: "ALONSO VARGAS L.",
    terminos_garantia: "Garantía de servicio técnico: 30 días en mano de obra. Todo repuesto sustituido queda a disposición del cliente. Vehículos no retirados pasados 15 días incurren en costo de cochera.",
    pie_pagina: "Servicio especializado de inyección electrónica, rectificaciones y venta de repuestos originales."
  };

  if (!db) return defaultSettings;

  try {
    const stmt = db.prepare('SELECT * FROM configuracion_taller WHERE id = ?');
    const config = stmt.get('config_principal');
    return config || defaultSettings;
  } catch (err) {
    console.warn('Error obteniendo configuración del taller:', err.message);
    return defaultSettings;
  }
}

export function saveWorkshopSettings(config) {
  if (!db) return config;

  const stmt = db.prepare(`
    INSERT INTO configuracion_taller (
      id, nombre_taller, razon_social, ruc, direccion, distrito, departamento,
      telefono, whatsapp, tecnico_principal, terminos_garantia, pie_pagina, updated_at
    ) VALUES (
      'config_principal', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
    )
    ON CONFLICT(id) DO UPDATE SET
      nombre_taller=excluded.nombre_taller,
      razon_social=excluded.razon_social,
      ruc=excluded.ruc,
      direccion=excluded.direccion,
      distrito=excluded.distrito,
      departamento=excluded.departamento,
      telefono=excluded.telefono,
      whatsapp=excluded.whatsapp,
      tecnico_principal=excluded.tecnico_principal,
      terminos_garantia=excluded.terminos_garantia,
      pie_pagina=excluded.pie_pagina,
      updated_at=CURRENT_TIMESTAMP
  `);

  stmt.run(
    config.nombre_taller || "ROLAND / ALONSO",
    config.razon_social || "TECNIMOTOR'S & RECTIFICACIONES ALONSO E.I.R.L.",
    config.ruc || "20600240677",
    config.direccion || "CALLE LIBERTAD N° 491 - MORRO SOLAR",
    config.distrito || "JAÉN",
    config.departamento || "CAJAMARCA",
    config.telefono || "980 988 321 - 931 429 334",
    config.whatsapp || "998843989",
    config.tecnico_principal || "ALONSO VARGAS L.",
    config.terminos_garantia || "Garantía de servicio técnico: 30 días en mano de obra.",
    config.pie_pagina || "Servicio especializado de taller de motocicletas."
  );

  return getWorkshopSettings();
}

// --- EXPORTACIÓN E IMPORTACIÓN COMPLETA DE BASE DE DATOS ---
export function exportDatabaseData() {
  const orders = getAllOrders();
  const inventory = getAllInventoryParts();
  const settings = getWorkshopSettings();

  return {
    version: '1.0',
    system: 'Sistema Roland / Alonso',
    exported_at: new Date().toISOString(),
    total_orders: orders.length,
    total_inventory: inventory.length,
    settings,
    inventory,
    orders
  };
}

export function importDatabaseData(payload) {
  if (!payload || !Array.isArray(payload.orders)) {
    throw new Error('Archivo de respaldo inválido o estructura incorrecta.');
  }

  if (payload.settings) {
    saveWorkshopSettings(payload.settings);
  }

  if (Array.isArray(payload.inventory)) {
    for (const part of payload.inventory) {
      saveInventoryPart(part);
    }
  }

  for (const order of payload.orders) {
    saveOrder(order);
  }

  return {
    success: true,
    ordersImported: payload.orders.length,
    inventoryImported: Array.isArray(payload.inventory) ? payload.inventory.length : 0
  };
}

export function checkpointDB() {
  if (db) {
    try {
      db.pragma('wal_checkpoint(TRUNCATE)');
    } catch (err) {
      console.warn('Advertencia en checkpoint WAL:', err.message);
    }
  }
}

export function closeDB() {
  if (db) {
    try {
      db.pragma('wal_checkpoint(TRUNCATE)');
      db.close();
      console.log('✅ Base de datos SQLite guardada y cerrada de manera segura.');
    } catch (err) {
      console.error('Error cerrando base de datos SQLite:', err.message);
    }
  }
}
