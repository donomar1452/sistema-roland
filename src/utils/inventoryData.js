export const INVENTORY_STORAGE_KEY = 'roland_workshop_parts_v1';

export function getStoredParts() {
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_PARTS_INVENTORY;
}

export function saveStoredParts(parts) {
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(parts));
  } catch (e) {
    console.error(e);
  }
}

export const DEFAULT_PARTS_INVENTORY = [
  { id: 'p1', codigo: 'HON-10W30', descripcion: 'Aceite Honda 4T 10W30 Mineral (1L)', categoria: 'Lubricantes', precio: 35.00, stock: 24 },
  { id: 'p2', codigo: 'MOT-5100', descripcion: 'Aceite Motul 5100 15W50 Semi-sintético (1L)', categoria: 'Lubricantes', precio: 42.00, stock: 18 },
  { id: 'p3', codigo: 'MOB-20W50', descripcion: 'Aceite Mobil Super 4T 20W50 (1L)', categoria: 'Lubricantes', precio: 28.00, stock: 15 },
  { id: 'p4', codigo: 'HON-FILT01', descripcion: 'Filtro de Aceite Honda GL 150 / CB 125', categoria: 'Filtros', precio: 15.00, stock: 14 },
  { id: 'p5', codigo: 'PUL-FILT02', descripcion: 'Filtro de Aceite Pulsar 200 NS / 150', categoria: 'Filtros', precio: 18.00, stock: 10 },
  { id: 'p6', codigo: 'PAST-DEL-01', descripcion: 'Pastillas de Freno Delantero Originales', categoria: 'Frenos', precio: 45.00, stock: 16 },
  { id: 'p7', codigo: 'ZAP-POST-01', descripcion: 'Zapatas de Freno Posterior Reforzadas', categoria: 'Frenos', precio: 35.00, stock: 12 },
  { id: 'p8', codigo: 'NGK-CPR8', descripcion: 'Bujía de Encendido NGK CPR8EA-9', categoria: 'Motor', precio: 18.00, stock: 32 },
  { id: 'p9', codigo: 'NGK-D8EA', descripcion: 'Bujía Estándar NGK D8EA', categoria: 'Motor', precio: 15.00, stock: 25 },
  { id: 'p10', codigo: 'KIT-ARR-428', descripcion: 'Kit de Arrastre Completo 428H (Corona+Piñón+Cadena)', categoria: 'Transmisión', precio: 140.00, stock: 8 },
  { id: 'p11', codigo: 'CAD-428H', descripcion: 'Cadena de Transmisión Reforzada 428H-128L', categoria: 'Transmisión', precio: 55.00, stock: 11 },
  { id: 'p12', codigo: 'CAM-18', descripcion: 'Cámara de Llanta Posterior 2.75/3.00-18', categoria: 'Neumáticos', precio: 25.00, stock: 20 },
  { id: 'p13', codigo: 'CAM-17', descripcion: 'Cámara de Llanta Delantera 110/90-17', categoria: 'Neumáticos', precio: 28.00, stock: 15 },
  { id: 'p14', codigo: 'BAT-12V7A', descripcion: 'Batería Seca Libre de Mantenimiento 12V 7Ah', categoria: 'Eléctrico', precio: 120.00, stock: 6 },
  { id: 'p15', codigo: 'LED-H4', descripcion: 'Foco Faro Delantero LED H4 Alta/Baja', categoria: 'Eléctrico', precio: 35.00, stock: 14 },
  { id: 'p16', codigo: 'LIQ-DOT4', descripcion: 'Líquido de Frenos DOT 4 Bosch / Varga (250ml)', categoria: 'Fluidos', precio: 16.00, stock: 18 },
  { id: 'p17', codigo: 'CAB-EMB', descripcion: 'Cable de Embrague Reforzado Universal', categoria: 'Mandos', precio: 20.00, stock: 12 },
  { id: 'p18', codigo: 'CAB-ACE', descripcion: 'Cable de Acelerador con Funda', categoria: 'Mandos', precio: 18.00, stock: 10 }
];

export const POPULAR_MODELS = [
  'HONDA GL 150', 'HONDA WAVE 110', 'HONDA XR 190L', 'HONDA CB 125F',
  'PULSAR NS 200', 'PULSAR 150', 'YAMAHA FZ 2.0', 'YAMAHA YBR 125',
  'TVS APACHE 160', 'RONCO DEMON 150', 'WANXIN 150', 'ZONGSHEN 125'
];

const CUSTOM_MODELS_KEY = 'roland_custom_models_v1';

export function getCustomModels() {
  try {
    const raw = localStorage.getItem(CUSTOM_MODELS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveCustomModel(model) {
  const trimmed = model.trim().toUpperCase();
  if (!trimmed) return false;
  const existing = getCustomModels();
  if ([...POPULAR_MODELS, ...existing].includes(trimmed)) return false;
  localStorage.setItem(CUSTOM_MODELS_KEY, JSON.stringify([...existing, trimmed]));
  return true;
}

export function deleteCustomModel(model) {
  const existing = getCustomModels();
  localStorage.setItem(CUSTOM_MODELS_KEY, JSON.stringify(existing.filter(m => m !== model)));
}

export const POPULAR_COLORS = ['ROJO', 'NEGRO', 'AZUL', 'BLANCO', 'GRIS/PLOMO', 'VERDE'];

export const LABOR_PRESETS = [
  { descripcion: 'Mantenimiento Preventivo General', precio: 50.00 },
  { descripcion: 'Cambio de Aceite y Filtro', precio: 10.00 },
  { descripcion: 'Limpieza y Calibración de Carburador', precio: 30.00 },
  { descripcion: 'Bajada y Reparación de Motor Completo', precio: 180.00 },
  { descripcion: 'Reglaje y Calibración de Válvulas', precio: 25.00 },
  { descripcion: 'Revisión y Reparación de Sistema Eléctrico', precio: 40.00 },
  { descripcion: 'Mantenimiento y Regulación de Frenos', precio: 30.00 },
  { descripcion: 'Instalación y Tensión de Kit de Arrastre', precio: 25.00 }
];

// Agrupación visual categorizada de las 45 partes del inventario de la moto
export const INVENTORY_CATEGORIES = [
  {
    title: '📄 Documentos & Llaves',
    keys: ['llave_contacto', 'tarjeta_propiedad', 'libro_servicio', 'herramientas']
  },
  {
    title: '🛡️ Carrocería & Espejos',
    keys: ['espejos_izq', 'espejos_der', 'tapiz_asiento', 'tapas_laterales_izq', 'tapas_laterales_der', 'tapa_lateral_si', 'tapa_lateral_no', 'parrilla', 'cobertores', 'porta_herramientas', 'maletera_delivery', 'guardafango_delantero', 'guardafango_posterior', 'emblemas']
  },
  {
    title: '💡 Mandos, Cables & Luces',
    keys: ['faro_delantero', 'faros_posteriores', 'faros_direccionales_laterales', 'velocimetro', 'tacometro', 'cable_freno_delantero', 'cable_embrague', 'cable_velocimetro', 'cable_tacometro']
  },
  {
    title: '⚙️ Mecánica, Frenos & Rodamiento',
    keys: ['llanta_delantera_buena', 'llanta_delantera_gastada', 'llanta_posterior_buena', 'llanta_posterior_gastada', 'telescopicas', 'amortiguadores_post_1', 'amortiguadores_post_2', 'seguro_cadena', 'cubrecadena', 'parador_lateral', 'parador_central', 'pedal_arranque', 'pedal_cambio', 'pedal_frenos', 'jebe_estribo_izq', 'jebe_estribo_der', 'descanza_pie_izq', 'descanza_pie_der', 'tapa_gasolina', 'varilla_aceite', 'tapa_deposito_freno', 'escarines']
  }
];
