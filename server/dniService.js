/**
 * Servicio de Consulta DNI y RUC para Perú
 * Soporta proveedores como APIS.net.pe, ApiPeru.dev y fallbacks de prueba.
 */

export async function consultarDNI(dni) {
  const cleanDni = (dni || '').trim();
  if (!/^\d{8}$/.test(cleanDni)) {
    throw new Error('El DNI debe contener exactamente 8 dígitos numéricos.');
  }

  const token = process.env.APIS_NET_PE_TOKEN || process.env.DNI_API_TOKEN;

  // 1. Si hay Token de apis.net.pe configurado
  if (token) {
    try {
      const response = await fetch(`https://api.apis.net.pe/v2/reniec/dni?numero=${cleanDni}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Referer': 'https://apis.net.pe/consulta-dni-api',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error API (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const nombreCompleto = `${data.nombres || ''} ${data.apellidoPaterno || ''} ${data.apellidoMaterno || ''}`.trim();

      return {
        success: true,
        dni: cleanDni,
        nombres: data.nombres || '',
        apellidoPaterno: data.apellidoPaterno || '',
        apellidoMaterno: data.apellidoMaterno || '',
        nombreCompleto: nombreCompleto,
        fuente: 'apis.net.pe'
      };
    } catch (err) {
      console.warn('Error en apis.net.pe, usando consulta alternativa:', err.message);
    }
  }

  // 2. Consulta gratuita / pública alternativa (Fallbacks)
  try {
    const res = await fetch(`https://dniruc.apis.net.pe/api/v1/dni/${cleanDni}`);
    if (res.ok) {
      const data = await res.json();
      if (data && (data.nombres || data.nombre)) {
        const nombres = data.nombres || data.nombre || '';
        const apePat = data.apellidoPaterno || data.paterno || '';
        const apeMat = data.apellidoMaterno || data.materno || '';
        const nombreCompleto = `${nombres} ${apePat} ${apeMat}`.trim();
        return {
          success: true,
          dni: cleanDni,
          nombres,
          apellidoPaterno: apePat,
          apellidoMaterno: apeMat,
          nombreCompleto,
          fuente: 'dniruc.apis.net.pe'
        };
      }
    }
  } catch (err) {
    console.warn('Fallback 1 falló:', err.message);
  }

  // Si no se encuentra datos o falla la consulta
  return {
    success: false,
    dni: cleanDni,
    error: 'No se encontraron datos para este DNI o la API requiere Token (configura APIS_NET_PE_TOKEN en .env).'
  };
}

export async function consultarRUC(ruc) {
  const cleanRuc = (ruc || '').trim();
  if (!/^\d{11}$/.test(cleanRuc)) {
    throw new Error('El RUC debe contener exactamente 11 dígitos numéricos.');
  }

  const token = process.env.APIS_NET_PE_TOKEN || process.env.DNI_API_TOKEN;

  if (token) {
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
        return {
          success: true,
          ruc: cleanRuc,
          razonSocial: data.razonSocial || '',
          direccion: data.direccion || '',
          distrito: data.distrito || '',
          estado: data.estado || '',
          condicion: data.condicion || '',
          fuente: 'apis.net.pe'
        };
      }
    } catch (err) {
      console.warn('Error en apis.net.pe RUC:', err.message);
    }
  }

  return {
    success: false,
    ruc: cleanRuc,
    error: 'Configura APIS_NET_PE_TOKEN en .env para consultar RUC de SUNAT.'
  };
}
