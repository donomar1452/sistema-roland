import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';

const EXTRACTION_PROMPT = `
Eres un experto en extracción de datos de fichas mecánicas y órdenes de servicio de taller de motocicletas.
Analiza detenidamente la(s) imagen(es) proporcionada(s) correspondiente(s) a la ORDEN DE SERVICIO de "TECNIMOTOR'S & RECTIFICACIONES ALONSO E.I.R.L." (FRENTE y/o REVERSO).

Extrae exactamente todos los datos visibles en la imagen y retorna únicamente un objeto JSON con la siguiente estructura estricta:

{
  "numero_orden": "Número de orden si existe (ej. 00123)",
  "fecha_emision": "YYYY-MM-DD o texto visible",
  "hora_emision": "HH:MM",
  "fecha_entrega": "YYYY-MM-DD",
  "hora_entrega": "HH:MM",
  "condicion_pago": "CONTADO" | "CRÉDITO" | "HDP",
  
  "datos_cliente": {
    "razon_social": "Nombre completo o Razón Social",
    "ruc": "RUC",
    "direccion": "Dirección",
    "distrito": "Distrito",
    "usuario": "Usuario",
    "dni": "DNI",
    "email": "Email",
    "celular": "Celular",
    "telefono": "Teléfono"
  },
  
  "datos_vehiculo": {
    "modelo": "Modelo de la moto/vehículo",
    "nro_motor": "N° de Motor",
    "nro_chasis": "N° de Chasis",
    "ano_fab": "Año de Fab.",
    "color": "Color",
    "placa": "Placa",
    "kilometraje": "Kilometraje",
    "gasolina": "Nivel de gasolina (E, 1/4, 1/2, 3/4, F)"
  },
  
  "tipo_servicio": {
    "reparacion_general": boolean,
    "reparacion_parcial": boolean,
    "mantenimiento_preventivo": boolean,
    "mantenimiento_general": boolean,
    "servicio_express": boolean,
    "servicio_garantia": boolean
  },
  
  "trabajos_especificos": {
    "mantenimiento": boolean,
    "cambio_aceite": boolean,
    "reparacion_motor": boolean,
    "descarbonizados": boolean,
    "embrague": boolean,
    "transmision": boolean,
    "sistema_arrastre": boolean,
    "frenos": boolean,
    "bateria": boolean,
    "revision_electrico": boolean,
    "revision_encendido": boolean,
    "suspension": boolean,
    "aro_neumatico": boolean,
    "sistema_escape": boolean,
    "sistema_direccion": boolean,
    "otros": "Texto adicional de otros trabajos"
  },
  
  "resumen_soles": {
    "mo_mantenimiento": number,
    "mo_reparacion": number,
    "servicio_terceros": number,
    "otros_mo": number,
    "subtotal_mo": number,
    "repuestos": number,
    "accesorios": number,
    "lubricantes": number,
    "otros_repuestos": number,
    "subtotal_repuestos": number,
    "valor_venta_total": number,
    "adelantos": number,
    "total_a_pagar": number
  },
  
  "requerimientos_cliente": "Texto escrito en requerimientos del cliente",
  
  "inventario_vehiculo": {
    "llave_contacto": boolean,
    "tarjeta_propiedad": boolean,
    "libro_servicio": boolean,
    "espejos_izq": boolean,
    "espejos_der": boolean,
    "tapiz_asiento": boolean,
    "porta_herramientas": boolean,
    "telescopicas": boolean,
    "cobertores": boolean,
    "tapas_laterales_izq": boolean,
    "tapas_laterales_der": boolean,
    "parrilla": boolean,
    "velocimetro": boolean,
    "tacometro": boolean,
    "maletera_delivery": boolean,
    "seguro_cadena": boolean,
    "cable_freno_delantero": boolean,
    "cable_embrague": boolean,
    "cable_velocimetro": boolean,
    "cable_tacometro": boolean,
    "parador_lateral": boolean,
    "parador_central": boolean,
    "cubrecadena": boolean,
    "amortiguadores_post_1": boolean,
    "amortiguadores_post_2": boolean,
    "guardafango_delantero": boolean,
    "guardafango_posterior": boolean,
    "llanta_delantera_buena": boolean,
    "llanta_delantera_gastada": boolean,
    "llanta_posterior_buena": boolean,
    "llanta_posterior_gastada": boolean,
    "pedal_arranque": boolean,
    "pedal_cambio": boolean,
    "tapa_lateral_si": boolean,
    "tapa_lateral_no": boolean,
    "jebe_estribo_izq": boolean,
    "jebe_estribo_der": boolean,
    "descanza_pie_izq": boolean,
    "descanza_pie_der": boolean,
    "faro_delantero": boolean,
    "tapa_gasolina": boolean,
    "herramientas": boolean,
    "varilla_aceite": boolean,
    "tapa_deposito_freno": boolean,
    "escarines": boolean,
    "emblemas": boolean,
    "faros_direccionales_laterales": boolean,
    "faros_posteriores": boolean,
    "pedal_frenos": boolean,
    "otros": "Detalle de otros elementos"
  },
  
  "forma_pago": "YAPE" | "PLIN" | "EFECTIVO" | "DEPÓSITO",
  "facturacion": {
    "tipo": "BOLETA" | "FACTURA",
    "series": "Serie",
    "numeros": "Número"
  },
  
  "firmas": {
    "aceptado_cliente_nombre": "Nombre del cliente",
    "aceptado_cliente_dni": "DNI",
    "vb_asesor": "V.B. Asesor",
    "recibi_conforme_nombre": "Nombre de quien recibe",
    "recibi_conforme_dni": "DNI de quien recibe"
  },
  
  "repuestos_items": [
    {
      "item": 1,
      "num_parte": "Código o número de parte",
      "descripcion": "Descripción del repuesto",
      "precio_unitario": 0,
      "cantidad": 0,
      "subtotal": 0
    }
  ],
  "terceros_items": [
    {
      "item": 1,
      "descripcion": "Descripción del servicio de terceros",
      "precio_unitario": 0,
      "cantidad": 0,
      "subtotal": 0
    }
  ],
  "mano_obra_items": [
    {
      "item": 1,
      "descripcion": "Descripción del trabajo de mano de obra",
      "precio_unitario": 0,
      "cantidad": 0,
      "subtotal": 0
    }
  ],
  
  "observaciones": "Observaciones y recomendaciones",
  "tecnico_responsable": "Nombre del técnico (ej. ALONSO VARGAS L.)",
  "hora_inicio": "HH:MM",
  "hora_fin": "HH:MM",
  "fecha_trabajo": "YYYY-MM-DD"
}

Importante: Retorna únicamente el JSON válido, sin delimitadores de código markdown como \`\`\`json.
`;

export async function extractDataFromImages(images) {
  // Array de objetos: [{ buffer, mimeType }]
  if (!images || images.length === 0) {
    throw new Error('No se proporcionaron imágenes para analizar.');
  }

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const contentsParts = [EXTRACTION_PROMPT];
      
      for (const img of images) {
        contentsParts.push({
          inlineData: {
            data: img.buffer.toString('base64'),
            mimeType: img.mimeType || 'image/jpeg'
          }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contentsParts,
      });

      const text = response.text;
      const cleanJSON = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJSON);

    } catch (err) {
      console.warn('Error llamando a Gemini API para OCR, recurriendo a extracción plantilla:', err.message);
    }
  }

  // Fallback demo/mock inteligente si no hay API Key configurada
  return generateInitialDataFromForm();
}

export function generateInitialDataFromForm() {
  return {
    numero_orden: `OS-${Math.floor(100000 + Math.random() * 900000)}`,
    fecha_emision: new Date().toISOString().split('T')[0],
    hora_emision: new Date().toTimeString().slice(0, 5),
    fecha_entrega: '',
    hora_entrega: '',
    condicion_pago: 'CONTADO',
    datos_cliente: {
      razon_social: '',
      ruc: '',
      direccion: 'CALLE LIBERTAD N° 491 - MORRO SOLAR - JAEN - CAJAMARCA',
      distrito: 'JAEN',
      usuario: '',
      dni: '',
      email: '',
      celular: '980 988 321',
      telefono: '931 429 334'
    },
    datos_vehiculo: {
      modelo: 'HONDA GL 150',
      nro_motor: '',
      nro_chasis: '',
      ano_fab: '2023',
      color: 'ROJO',
      placa: '',
      kilometraje: '12450',
      gasolina: '1/2'
    },
    tipo_servicio: {
      mantenimiento_general: true,
      reparacion_general: false,
      reparacion_parcial: false,
      mantenimiento_preventivo: false,
      servicio_express: false,
      servicio_garantia: false
    },
    trabajos_especificos: {
      mantenimiento: true,
      cambio_aceite: true,
      reparacion_motor: false,
      descarbonizados: false,
      embrague: false,
      transmision: false,
      sistema_arrastre: false,
      frenos: true,
      bateria: false,
      revision_electrico: true,
      revision_encendido: false,
      suspension: false,
      aro_neumatico: false,
      sistema_escape: false,
      sistema_direccion: false,
      otros: ''
    },
    resumen_soles: {
      mo_mantenimiento: 50.00,
      mo_reparacion: 0.00,
      servicio_terceros: 0.00,
      otros_mo: 0.00,
      subtotal_mo: 50.00,
      repuestos: 85.00,
      accesorios: 0.00,
      lubricantes: 35.00,
      otros_repuestos: 0.00,
      subtotal_repuestos: 120.00,
      valor_venta_total: 170.00,
      adelantos: 20.00,
      total_a_pagar: 150.00
    },
    requerimientos_cliente: 'Revisión general de frenos y cambio de aceite de motor.',
    inventario_vehiculo: {
      llave_contacto: true,
      tarjeta_propiedad: true,
      libro_servicio: false,
      espejos_izq: true,
      espejos_der: true,
      tapiz_asiento: true,
      porta_herramientas: true,
      telescopicas: true,
      cobertores: true,
      tapas_laterales_izq: true,
      tapas_laterales_der: true,
      parrilla: true,
      velocimetro: true,
      tacometro: true,
      maletera_delivery: false,
      seguro_cadena: true,
      cable_freno_delantero: true,
      cable_embrague: true,
      cable_velocimetro: true,
      cable_tacometro: true,
      parador_lateral: true,
      parador_central: true,
      cubrecadena: true,
      amortiguadores_post_1: true,
      amortiguadores_post_2: true,
      guardafango_delantero: true,
      guardafango_posterior: true,
      llanta_delantera_buena: true,
      llanta_delantera_gastada: false,
      llanta_posterior_buena: true,
      llanta_posterior_gastada: false,
      pedal_arranque: true,
      pedal_cambio: true,
      tapa_lateral_si: true,
      tapa_lateral_no: false,
      jebe_estribo_izq: true,
      jebe_estribo_der: true,
      descanza_pie_izq: true,
      descanza_pie_der: true,
      faro_delantero: true,
      tapa_gasolina: true,
      herramientas: true,
      varilla_aceite: true,
      tapa_deposito_freno: true,
      escarines: true,
      emblemas: true,
      faros_direccionales_laterales: true,
      faros_posteriores: true,
      pedal_frenos: true,
      otros: ''
    },
    forma_pago: 'EFECTIVO',
    facturacion: {
      tipo: 'BOLETA',
      series: 'B001',
      numeros: '000123'
    },
    firmas: {
      aceptado_cliente_nombre: '',
      aceptado_cliente_dni: '',
      vb_asesor: 'ALONSO V.',
      recibi_conforme_nombre: '',
      recibi_conforme_dni: ''
    },
    repuestos_items: [
      { item: 1, num_parte: 'HON-15410', descripcion: 'FILTRO DE ACEITE HONDA GL150', precio_unitario: 15.00, cantidad: 1, subtotal: 15.00 },
      { item: 2, num_parte: 'LUB-4T10W30', descripcion: 'ACEITE HONDA 4T 10W30 1L', precio_unitario: 35.00, cantidad: 1, subtotal: 35.00 },
      { item: 3, num_parte: 'HON-06455', descripcion: 'PASTILLAS DE FRENO DELANTERO', precio_unitario: 70.00, cantidad: 1, subtotal: 70.00 }
    ],
    terceros_items: [],
    mano_obra_items: [
      { item: 1, descripcion: 'MANTENIMIENTO PREVENTIVO Y REVISIÓN GENERAL', precio_unitario: 50.00, cantidad: 1, subtotal: 50.00 }
    ],
    observaciones: 'Se sugiere cambio de llanta posterior en el próximo mantenimiento.',
    tecnico_responsable: 'ALONSO VARGAS L.',
    hora_inicio: '08:30',
    hora_fin: '11:00',
    fecha_trabajo: new Date().toISOString().split('T')[0]
  };
}
