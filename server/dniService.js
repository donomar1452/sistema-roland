import dotenv from 'dotenv';
dotenv.config();

/**
 * Servicio de Consulta DNI (Reniec) y RUC (Sunat) para Perú
 * Token oficial de apis.net.pe con fallback preconfigurado para producción
 */

const DEFAULT_TOKEN = 'sk_12673.wvjOp4ZRg6p5tUWFoFIlrQLLO1blIAix';

export async function consultarDNI(dni) {
  const cleanDni = String(dni || '').replace(/\D/g, '').trim();

  if (cleanDni.length !== 8) {
    throw new Error('El DNI debe contener exactamente 8 dígitos numéricos.');
  }

  const token = (process.env.APIS_NET_PE_TOKEN || process.env.DNI_API_TOKEN || DEFAULT_TOKEN).trim();

  try {
    const response = await fetch(`https://api.apis.net.pe/v2/reniec/dni?numero=${cleanDni}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Referer': 'https://apis.net.pe/consulta-dni-api',
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const nombreCompleto = (data.nombreCompleto || `${data.nombres || ''} ${data.apellidoPaterno || ''} ${data.apellidoMaterno || ''}`).trim();

      if (nombreCompleto) {
        return {
          success: true,
          dni: cleanDni,
          nombres: data.nombres || '',
          apellidoPaterno: data.apellidoPaterno || '',
          apellidoMaterno: data.apellidoMaterno || '',
          nombreCompleto,
          fuente: 'apis.net.pe'
        };
      }
    }

    if (response.status === 404 || response.status === 422) {
      return {
        success: false,
        dni: cleanDni,
        error: 'El DNI ingresado no existe en el padrón de RENIEC.'
      };
    }

    const errBody = await response.text();
    console.warn(`Aviso API DNI (Status ${response.status}):`, errBody);
  } catch (err) {
    console.warn('Error conectando a apis.net.pe para DNI:', err.message);
  }

  // Fallback secundario de respaldo público
  try {
    const res = await fetch(`https://api.peruapi.com/api/dni/${cleanDni}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.data && data.data.nombre_completo) {
        return {
          success: true,
          dni: cleanDni,
          nombreCompleto: data.data.nombre_completo.trim(),
          fuente: 'peruapi'
        };
      }
    }
  } catch (e) {
    // Silently continue
  }

  return {
    success: false,
    dni: cleanDni,
    error: 'No se encontraron datos para este DNI en RENIEC. Verifique el número ingresado.'
  };
}

export async function consultarRUC(ruc) {
  const cleanRuc = String(ruc || '').replace(/\D/g, '').trim();

  if (cleanRuc.length !== 11) {
    throw new Error('El RUC debe contener exactamente 11 dígitos numéricos.');
  }

  const token = (process.env.APIS_NET_PE_TOKEN || process.env.DNI_API_TOKEN || DEFAULT_TOKEN).trim();

  try {
    const response = await fetch(`https://api.apis.net.pe/v2/sunat/ruc?numero=${cleanRuc}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Referer': 'https://apis.net.pe/consulta-ruc-api',
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.razonSocial) {
        return {
          success: true,
          ruc: cleanRuc,
          razonSocial: data.razonSocial || '',
          direccion: data.direccion || '',
          distrito: data.distrito || '',
          provincia: data.provincia || '',
          departamento: data.departamento || '',
          estado: data.estado || '',
          condicion: data.condicion || '',
          fuente: 'apis.net.pe'
        };
      }
    }

    if (response.status === 404 || response.status === 422) {
      return {
        success: false,
        ruc: cleanRuc,
        error: 'El RUC ingresado no existe en los registros de SUNAT.'
      };
    }

    const errBody = await response.text();
    console.warn(`Aviso API RUC (Status ${response.status}):`, errBody);
  } catch (err) {
    console.warn('Error conectando a apis.net.pe para RUC:', err.message);
  }

  return {
    success: false,
    ruc: cleanRuc,
    error: 'No se encontraron datos para este RUC en SUNAT. Verifique el número ingresado.'
  };
}
