import React, { useState, useEffect } from 'react';
import { Save, Printer, ArrowLeft, Trash2, CheckSquare, Wrench, User, Bike, Send, CheckCircle2, XCircle, Sparkles, PhoneCall, Package, Search } from 'lucide-react';
import { POPULAR_MODELS, POPULAR_COLORS, LABOR_PRESETS, INVENTORY_CATEGORIES, getStoredParts, getCustomModels, saveCustomModel, deleteCustomModel } from '../utils/inventoryData';

export default function OrderEditor({ initialOrder, onSave, onCancel, onPrint, existingOrders = [], initialTab = 'DATOS' }) {
  const [order, setOrder] = useState(() => {
    return initialOrder || {
      numero_orden: `OS-${Math.floor(100000 + Math.random() * 900000)}`,
      fecha_emision: new Date().toISOString().split('T')[0],
      hora_emision: new Date().toTimeString().slice(0, 5),
      fecha_entrega: '',
      hora_entrega: '',
      condicion_pago: 'CONTADO',
      datos_cliente: {
        razon_social: '', ruc: '', direccion: '', distrito: '', usuario: '', dni: '', email: '', celular: '', telefono: ''
      },
      datos_vehiculo: {
        modelo: 'HONDA GL 150', nro_motor: '', nro_chasis: '', ano_fab: '', color: 'NEGRO', placa: '', kilometraje: '', gasolina: '1/2'
      },
      tipo_servicio: {
        reparacion_general: false, reparacion_parcial: false, mantenimiento_preventivo: true, mantenimiento_general: true, servicio_express: false, servicio_garantia: false
      },
      trabajos_especificos: {
        mantenimiento: true, cambio_aceite: true, reparacion_motor: false, descarbonizados: false, embrague: false, transmision: false, sistema_arrastre: false, frenos: true, bateria: false, revision_electrico: false, revision_encendido: false, suspension: false, aro_neumatico: false, sistema_escape: false, sistema_direccion: false, otros: ''
      },
      resumen_soles: {
        mo_mantenimiento: 50, mo_reparacion: 0, servicio_terceros: 0, otros_mo: 0, subtotal_mo: 50,
        repuestos: 35, accesorios: 0, lubricantes: 35, otros_repuestos: 0, subtotal_repuestos: 35,
        valor_venta_total: 85, adelantos: 0, total_a_pagar: 85
      },
      requerimientos_cliente: '',
      inventario_vehiculo: {
        llave_contacto: true, tarjeta_propiedad: true, libro_servicio: false, espejos_izq: true, espejos_der: true,
        tapiz_asiento: true, porta_herramientas: true, telescopicas: true, cobertores: true, tapas_laterales_izq: true,
        tapas_laterales_der: true, parrilla: true, velocimetro: true, tacometro: true, maletera_delivery: false,
        seguro_cadena: true, cable_freno_delantero: true, cable_embrague: true, cable_velocimetro: true,
        cable_tacometro: true, parador_lateral: true, parador_central: true, cubrecadena: true,
        amortiguadores_post_1: true, amortiguadores_post_2: true, guardafango_delantero: true,
        guardafango_posterior: true, llanta_delantera_buena: true, llanta_delantera_gastada: false,
        llanta_posterior_buena: true, llanta_posterior_gastada: false, pedal_arranque: true,
        pedal_cambio: true, tapa_lateral_si: true, tapa_lateral_no: false, jebe_estribo_izq: true,
        jebe_estribo_der: true, descanza_pie_izq: true, descanza_pie_der: true, faro_delantero: true,
        tapa_gasolina: true, herramientas: true, varilla_aceite: true, tapa_deposito_freno: true,
        escarines: true, emblemas: true, faros_direccionales_laterales: true, faros_posteriores: true,
        pedal_frenos: true, otros: ''
      },
      forma_pago: 'EFECTIVO',
      facturacion: { tipo: 'BOLETA', series: 'B001', numeros: '' },
      firmas: { aceptado_cliente_nombre: '', aceptado_cliente_dni: '', vb_asesor: 'ALONSO V.', recibi_conforme_nombre: '', recibi_conforme_dni: '' },
      repuestos_items: [
        { item: 1, num_parte: 'HON-10W30', descripcion: 'ACEITE HONDA 4T 10W30 (1L)', precio_unitario: 35.00, cantidad: 1, subtotal: 35.00 }
      ],
      terceros_items: [],
      mano_obra_items: [
        { item: 1, descripcion: 'MANTENIMIENTO PREVENTIVO Y CAMBIO DE ACEITE', precio_unitario: 50.00, cantidad: 1, subtotal: 50.00 }
      ],
      observaciones: '',
      tecnico_responsable: 'ALONSO VARGAS L.',
      hora_inicio: '', hora_fin: '', fecha_trabajo: new Date().toISOString().split('T')[0],
      estado: 'EN_PROCESO'
    };
  });

  // ONLY 2 MAIN TABS AS REQUESTED: 'DATOS' (Nueva Orden) and 'INVENTARIO' (Inventario de Moto y Repuestos)
  const [activeTab, setActiveTab] = useState(initialTab || 'DATOS'); // DATOS, INVENTARIO, PREVIEW
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [isSearchingDni, setIsSearchingDni] = useState(false);
  const [workshopParts, setWorkshopParts] = useState(getStoredParts);

  // Mobile collapsible sections (Paso 2 y Paso 3)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [step2Open, setStep2Open] = useState(false);
  const [step3Open, setStep3Open] = useState(false);
  const [showModelList, setShowModelList] = useState(false);
  const [customModels, setCustomModels] = useState(getCustomModels);
  const [newModelInput, setNewModelInput] = useState('');
  const [showAddModel, setShowAddModel] = useState(false);
  const [showServiciosList, setShowServiciosList] = useState(false);
  const [showLaborList, setShowLaborList] = useState(false);
  const [showPartsList, setShowPartsList] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Custom accessories for bike inventory
  const [showAddAccessory, setShowAddAccessory] = useState(false);
  const [newAccessoryName, setNewAccessoryName] = useState('');

  // Fetch updated workshop parts from API
  useEffect(() => {
    fetch('/api/inventory')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setWorkshopParts(json.data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Auto-calculate Totals when items change
  useEffect(() => {
    const subtotalRepuestos = (order.repuestos_items || []).reduce((acc, i) => acc + (Number(i.subtotal) || 0), 0);
    const subtotalTerceros = (order.terceros_items || []).reduce((acc, i) => acc + (Number(i.subtotal) || 0), 0);
    const subtotalMO = (order.mano_obra_items || []).reduce((acc, i) => acc + (Number(i.subtotal) || 0), 0);

    const totalVenta = subtotalRepuestos + subtotalTerceros + subtotalMO;
    const adelantos = Number(order.resumen_soles?.adelantos) || 0;
    const totalPagar = Math.max(0, totalVenta - adelantos);

    setOrder(prev => ({
      ...prev,
      resumen_soles: {
        ...prev.resumen_soles,
        subtotal_repuestos: subtotalRepuestos,
        servicio_terceros: subtotalTerceros,
        subtotal_mo: subtotalMO,
        valor_venta_total: totalVenta,
        total_a_pagar: totalPagar
      }
    }));
  }, [JSON.stringify(order.repuestos_items), JSON.stringify(order.terceros_items), JSON.stringify(order.mano_obra_items), order.resumen_soles?.adelantos]);

  // Nested Field Updater
  const updateNestedField = (section, field, value) => {
    setOrder(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Client Autocomplete Logic
  const handleClientNameChange = (val) => {
    updateNestedField('datos_cliente', 'razon_social', val);

    if (val.trim().length > 1 && existingOrders.length > 0) {
      const query = val.toLowerCase();
      const matches = existingOrders
        .filter(o => o.datos_cliente?.razon_social?.toLowerCase().includes(query))
        .map(o => o.datos_cliente)
        .filter((c, idx, self) => c.razon_social && self.findIndex(x => x.razon_social === c.razon_social) === idx)
        .slice(0, 4);

      setClientSuggestions(matches);
    } else {
      setClientSuggestions([]);
    }
  };

  const selectSuggestedClient = (client) => {
    setOrder(prev => ({
      ...prev,
      datos_cliente: {
        ...prev.datos_cliente,
        razon_social: client.razon_social || '',
        dni: client.dni || client.ruc || '',
        celular: client.celular || client.telefono || '',
        direccion: client.direccion || ''
      }
    }));
    setClientSuggestions([]);
  };

  const handleSearchDniRuc = async () => {
    const queryDoc = (order.datos_cliente?.dni || order.datos_cliente?.ruc || '').trim();
    if (!queryDoc) {
      alert('Por favor ingrese un número de DNI (8 dígitos) o RUC (11 dígitos).');
      return;
    }

    setIsSearchingDni(true);
    try {
      if (queryDoc.length === 8) {
        const res = await fetch(`/api/consulta-dni/${queryDoc}`);
        const json = await res.json();
        if (json.success && json.nombreCompleto) {
          updateNestedField('datos_cliente', 'razon_social', json.nombreCompleto);
          alert(`✅ DNI Encontrado: ${json.nombreCompleto}`);
        } else {
          alert(json.error || 'No se encontró información para el DNI ingresado.');
        }
      } else if (queryDoc.length === 11) {
        const res = await fetch(`/api/consulta-ruc/${queryDoc}`);
        const json = await res.json();
        if (json.success && json.razonSocial) {
          updateNestedField('datos_cliente', 'razon_social', json.razonSocial);
          if (json.direccion) updateNestedField('datos_cliente', 'direccion', json.direccion);
          alert(`✅ RUC Encontrado: ${json.razonSocial}`);
        } else {
          alert(json.error || 'No se encontró información para el RUC ingresado.');
        }
      } else {
        alert('El documento debe ser un DNI de 8 dígitos o un RUC de 11 dígitos.');
      }
    } catch (err) {
      alert('Error consultando el documento.');
    } finally {
      setIsSearchingDni(false);
    }
  };

  // Bulk Inventory Checkers (Ultra fast 1-click feature)
  const toggleAllInventory = (status) => {
    const newInv = { ...order.inventario_vehiculo };
    Object.keys(newInv).forEach(key => {
      if (key !== 'otros' && key !== 'custom_items' && typeof newInv[key] === 'boolean') {
        newInv[key] = status;
      }
    });
    if (newInv.custom_items) {
      newInv.custom_items = newInv.custom_items.map(c => ({ ...c, estado: status }));
    }
    setOrder(prev => ({ ...prev, inventario_vehiculo: newInv }));
  };

  // Custom accessories for the current order
  const handleAddCustomAccessory = (e) => {
    e.preventDefault();
    if (!newAccessoryName.trim()) return;

    const currentCustom = order.inventario_vehiculo?.custom_items || [];
    const updatedCustom = [
      ...currentCustom,
      { id: 'c_' + Date.now(), nombre: newAccessoryName.trim(), estado: true }
    ];

    setOrder(prev => ({
      ...prev,
      inventario_vehiculo: {
        ...prev.inventario_vehiculo,
        custom_items: updatedCustom
      }
    }));
    setNewAccessoryName('');
    setShowAddAccessory(false);
  };

  const handleToggleCustomAccessory = (id) => {
    const currentCustom = order.inventario_vehiculo?.custom_items || [];
    const updatedCustom = currentCustom.map(c => c.id === id ? { ...c, estado: !c.estado } : c);
    setOrder(prev => ({
      ...prev,
      inventario_vehiculo: {
        ...prev.inventario_vehiculo,
        custom_items: updatedCustom
      }
    }));
  };

  const handleDeleteCustomAccessory = (id) => {
    const currentCustom = order.inventario_vehiculo?.custom_items || [];
    const updatedCustom = currentCustom.filter(c => c.id !== id);
    setOrder(prev => ({
      ...prev,
      inventario_vehiculo: {
        ...prev.inventario_vehiculo,
        custom_items: updatedCustom
      }
    }));
  };

  // Item Table Handlers
  const handleItemChange = (listName, index, field, value) => {
    const list = [...(order[listName] || [])];
    if (!list[index]) list[index] = {};

    list[index][field] = value;

    if (field === 'precio_unitario' || field === 'cantidad') {
      const price = Number(field === 'precio_unitario' ? value : list[index].precio_unitario) || 0;
      const qty = Number(field === 'cantidad' ? value : list[index].cantidad) || 0;
      list[index].subtotal = price * qty;
    }

    setOrder(prev => ({ ...prev, [listName]: list }));
  };

  const addItemRow = (listName) => {
    const list = [...(order[listName] || [])];
    list.push({ item: list.length + 1, num_parte: '', descripcion: '', precio_unitario: 0, cantidad: 1, subtotal: 0 });
    setOrder(prev => ({ ...prev, [listName]: list }));
  };

  const addLaborPreset = (preset) => {
    const list = [...(order.mano_obra_items || [])];
    list.push({
      item: list.length + 1,
      descripcion: preset.descripcion,
      precio_unitario: preset.precio,
      cantidad: 1,
      subtotal: preset.precio
    });
    setOrder(prev => ({ ...prev, mano_obra_items: list }));
  };

  const addRepuestoPreset = (part) => {
    const list = [...(order.repuestos_items || [])];
    list.push({
      item: list.length + 1,
      num_parte: part.codigo || part.num_parte,
      descripcion: part.descripcion,
      precio_unitario: part.precio || part.precio_unitario,
      cantidad: 1,
      subtotal: part.precio || part.precio_unitario
    });
    setOrder(prev => ({ ...prev, repuestos_items: list }));
  };

  const removeItemRow = (listName, index) => {
    const list = (order[listName] || []).filter((_, i) => i !== index);
    setOrder(prev => ({ ...prev, [listName]: list }));
  };

  // WhatsApp Message Generator
  const sendWhatsAppNotification = () => {
    const phone = (order.datos_cliente?.celular || order.datos_cliente?.telefono || '').replace(/\D/g, '');
    const clientName = order.datos_cliente?.razon_social || 'Cliente';
    const bikeModel = order.datos_vehiculo?.modelo || 'Motocicleta';
    const plate = order.datos_vehiculo?.placa ? `(Placa: ${order.datos_vehiculo.placa})` : '';
    const total = (order.resumen_soles?.total_a_pagar || 0).toFixed(2);
    const orderNum = order.numero_orden || 'N/A';
    const estado = order.estado === 'COMPLETADO' ? '¡LISTO PARA RETIRAR! 🏍️' : 'EN ATENCIÓN / TALLER 🛠️';

    const msg = `Hola *${clientName}*, le saludamos del *Taller ROLAND / ALONSO*.
Su orden *${orderNum}* (${bikeModel} ${plate}) se encuentra: *${estado}*.
💰 Total a pagar: *S/ ${total}*.
📌 Dirección: Calle Libertad 491, Jaén.
¡Muchas gracias!`;

    const fullPhone = phone ? (phone.startsWith('51') ? phone : `51${phone}`) : '';
    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ paddingBottom: '3.5rem' }}>
      {/* Top Header Bar with Sticky Navigation */}
      <div className="card editor-sticky-header" style={{
        padding: '0.85rem 1.15rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.85rem',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: '10px',
        zIndex: 100,
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" style={{ minHeight: '38px', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }} onClick={onCancel} title="Regresar al Historial">
            <ArrowLeft size={16} /> Volver
          </button>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff', lineHeight: 1.2 }}>
              Orden: <span style={{ color: 'var(--primary)' }}>{order.numero_orden}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              {order.datos_cliente?.razon_social || 'Cliente Nuevo'} &nbsp;|&nbsp; Moto: <strong style={{ color: 'var(--accent)' }}>{order.datos_vehiculo?.modelo || 'S/M'}</strong> ({order.datos_vehiculo?.placa || 'S/P'})
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="nav-tabs editor-nav-tabs">
          <button
            type="button"
            className={`nav-tab ${activeTab === 'DATOS' ? 'active' : ''}`}
            onClick={() => setActiveTab('DATOS')}
          >
            <User size={16} /> Ficha de Trabajo
          </button>
          <button
            type="button"
            className={`nav-tab ${activeTab === 'INVENTARIO' ? 'active' : ''}`}
            onClick={() => setActiveTab('INVENTARIO')}
          >
            <CheckSquare size={16} /> Checklist Recepción
          </button>
        </div>

        {/* Quick Actions */}
        <div className="editor-quick-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn btn-outline" style={{ minHeight: '38px', padding: '0.45rem 0.85rem', fontSize: '0.85rem', background: 'rgba(37, 211, 102, 0.15)', color: '#25D366', borderColor: 'rgba(37, 211, 102, 0.35)' }} title="Enviar Estado por WhatsApp" onClick={sendWhatsAppNotification}>
            <Send size={15} /> WhatsApp
          </button>
          <button className="btn btn-secondary" style={{ minHeight: '38px', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }} title="Imprimir Ficha" onClick={() => onPrint(order)}>
            <Printer size={15} /> Imprimir
          </button>
          <button className="btn btn-primary" style={{ minHeight: '38px', padding: '0.45rem 1.15rem', fontSize: '0.875rem' }} onClick={() => onSave(order)}>
            <Save size={16} /> Guardar
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VISTA 1: NUEVA ORDEN (DATOS CLIENTE, DATOS MOTO, TRABAJOS)     */}
      {/* ============================================================== */}
      {activeTab === 'DATOS' && (
        <>
          {/* ============================================ */}
          {/* PASO 1: DATOS DEL CLIENTE                   */}
          {/* ============================================ */}
          <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
            <div className="card-header">
              <div>
                <div className="card-title" style={{ fontSize: '1.08rem' }}>
                  <span style={{ background: 'var(--accent)', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.825rem', fontWeight: '700' }}>
                    1
                  </span>
                  Paso 1: Datos del Cliente
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Ingrese el DNI para consultar automáticamente en RENIEC o escriba el nombre.
                </div>
              </div>
              <span className="badge badge-process" style={{ fontSize: '0.775rem' }}>
                Paso 1 de 4
              </span>
            </div>

            {/* Búsqueda rápida por DNI */}
            <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.28)', padding: '0.85rem 1.1rem', borderRadius: '8px', marginBottom: '1.15rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#e2e8f0', display: 'block', marginBottom: '0.45rem' }}>
                Consulta por DNI (8 dígitos) o RUC (11 dígitos):
              </label>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ flex: '1 1 190px', minWidth: '160px', letterSpacing: '0.5px', fontSize: '1rem' }}
                  placeholder="Número de DNI / RUC..."
                  value={order.datos_cliente?.dni || order.datos_cliente?.ruc || ''}
                  onChange={e => updateNestedField('datos_cliente', 'dni', e.target.value)}
                />
                <button
                  type="button"
                  className="btn"
                  style={{ background: 'var(--accent)', color: '#fff', fontSize: '0.875rem', minHeight: '44px', padding: '0.55rem 1.25rem' }}
                  onClick={handleSearchDniRuc}
                  disabled={isSearchingDni}
                >
                  <Search size={16} />
                  {isSearchingDni ? 'Consultando...' : 'Buscar en RENIEC'}
                </button>
              </div>
            </div>

            {/* Formulario Cliente */}
            <div className="form-grid" style={{ position: 'relative', marginBottom: '1.15rem' }}>
              <div className="form-group" style={{ position: 'relative' }}>
                <label>Nombre Completo o Razón Social *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Juan Pérez / Empresa..."
                  value={order.datos_cliente?.razon_social || ''}
                  onChange={e => handleClientNameChange(e.target.value)}
                />

                {/* Suggestions popup */}
                {clientSuggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: '#111827', border: '1px solid var(--accent)', borderRadius: '8px', boxShadow: 'var(--shadow-lg)', marginTop: '4px' }}>
                    <div style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem', color: 'var(--accent)', fontWeight: '600', borderBottom: '1px solid var(--border-color)' }}>
                      Clientes Frecuentes Encontrados:
                    </div>
                    {clientSuggestions.map((c, i) => (
                      <div
                        key={`sugg-${i}`}
                        style={{ padding: '0.65rem 0.85rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.875rem' }}
                        onClick={() => selectSuggestedClient(c)}
                        onMouseEnter={e => e.currentTarget.style.background = '#1f2937'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <strong>{c.razon_social}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DNI: {c.dni || c.ruc || 'S/N'} | Cel: {c.celular || 'S/N'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Celular / WhatsApp</label>
                <div style={{ display: 'flex', gap: '0.45rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej: 980988321"
                    value={order.datos_cliente?.celular || ''}
                    onChange={e => updateNestedField('datos_cliente', 'celular', e.target.value)}
                  />
                  {order.datos_cliente?.celular && (
                    <button
                      type="button"
                      className="btn"
                      style={{ background: '#25D366', color: '#fff', minHeight: '44px', padding: '0.45rem 0.85rem', flexShrink: 0 }}
                      onClick={sendWhatsAppNotification}
                      title="Abrir WhatsApp"
                    >
                      <PhoneCall size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Dirección o Ciudad</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Calle Libertad 491, Jaén"
                  value={order.datos_cliente?.direccion || ''}
                  onChange={e => updateNestedField('datos_cliente', 'direccion', e.target.value)}
                />
              </div>
            </div>

            {/* Ficha General N° Orden y Pago */}
            <div className="form-grid" style={{ background: 'rgba(11, 15, 25, 0.5)', padding: '0.85rem', borderRadius: '8px' }}>
              <div className="form-group">
                <label>N° de Orden</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ fontWeight: '700', color: 'var(--primary)' }}
                  value={order.numero_orden}
                  onChange={e => setOrder({ ...order, numero_orden: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Fecha de Ingreso</label>
                <input
                  type="date"
                  className="form-control"
                  value={order.fecha_emision}
                  onChange={e => setOrder({ ...order, fecha_emision: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Forma de Pago</label>
                <select
                  className="form-control"
                  value={order.condicion_pago}
                  onChange={e => setOrder({ ...order, condicion_pago: e.target.value })}
                >
                  <option value="CONTADO">CONTADO (Efectivo)</option>
                  <option value="YAPE / PLIN">YAPE / PLIN</option>
                  <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                  <option value="CRÉDITO">CRÉDITO</option>
                </select>
              </div>
              <div className="form-group">
                <label>Estado en Taller</label>
                <select
                  className="form-control"
                  style={{ fontWeight: '600', color: order.estado === 'COMPLETADO' ? 'var(--success)' : 'var(--warning)' }}
                  value={order.estado}
                  onChange={e => setOrder({ ...order, estado: e.target.value })}
                >
                  <option value="EN_PROCESO">🛠️ EN TRABAJO</option>
                  <option value="COMPLETADO">✅ LISTO PARA RETIRAR</option>
                  <option value="ENTREGADO">📦 YA ENTREGADO</option>
                </select>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* PASO 2: DATOS DE LA MOTO                    */}
          {/* ============================================ */}
          <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <div
              className="card-header"
              onClick={() => isMobile && setStep2Open(o => !o)}
              style={{ cursor: isMobile ? 'pointer' : 'default', userSelect: 'none' }}
            >
              <div>
                <div className="card-title" style={{ fontSize: '1.08rem' }}>
                  <span style={{ background: 'var(--primary)', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.825rem', fontWeight: '700' }}>
                    2
                  </span>
                  Paso 2: Datos de la Moto
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Seleccione el modelo con 1 clic o escriba los datos del vehículo.
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-process" style={{ fontSize: '0.775rem' }}>
                  Paso 2 de 4
                </span>
                {isMobile && (
                  <span style={{ color: 'var(--primary)', fontSize: '1.2rem', lineHeight: 1 }}>
                    {step2Open ? '▲' : '▼'}
                  </span>
                )}
              </div>
            </div>

            {(!isMobile || step2Open) && (
              <>
                {/* Quick Model Presets — Dropdown desplegable */}
                <div style={{ marginBottom: '1.15rem', position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setShowModelList(v => !v)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(11, 15, 25, 0.5)',
                      border: showModelList ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      borderRadius: showModelList ? '8px 8px 0 0' : '8px',
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      color: '#e2e8f0',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      🏍️ Modelos Frecuentes
                      {order.datos_vehiculo?.modelo && POPULAR_MODELS.includes(order.datos_vehiculo.modelo) && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--primary)', background: 'rgba(59,130,246,0.15)', padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                          ✓ {order.datos_vehiculo.modelo}
                        </span>
                      )}
                    </span>
                    <span style={{ color: 'var(--primary)', fontSize: '1rem' }}>{showModelList ? '▲' : '▼'}</span>
                  </button>

                  {showModelList && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 20,
                      background: '#0f1729',
                      border: '1px solid var(--primary)',
                      borderTop: 'none',
                      borderRadius: '0 0 10px 10px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      overflow: 'hidden',
                      maxHeight: '320px',
                      overflowY: 'auto'
                    }}>
                      {/* Modelos base */}
                      {POPULAR_MODELS.map((m, i) => {
                        const isSelected = order.datos_vehiculo?.modelo === m;
                        const allModels = [...POPULAR_MODELS, ...customModels];
                        return (
                          <div
                            key={m}
                            onClick={() => {
                              updateNestedField('datos_vehiculo', 'modelo', m);
                              setShowModelList(false);
                            }}
                            style={{
                              padding: '0.75rem 1rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.9rem',
                              fontWeight: isSelected ? '700' : '400',
                              color: isSelected ? '#fff' : '#cbd5e1',
                              background: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                              borderBottom: '1px solid rgba(255,255,255,0.05)',
                              transition: 'background 0.1s ease'
                            }}
                            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? 'rgba(59,130,246,0.2)' : 'transparent'; }}
                          >
                            <span>{m}</span>
                            {isSelected && <span style={{ color: 'var(--primary)', fontSize: '1rem' }}>✓</span>}
                          </div>
                        );
                      })}

                      {/* Modelos personalizados */}
                      {customModels.length > 0 && (
                        <>
                          <div style={{ padding: '0.4rem 1rem', fontSize: '0.72rem', color: 'var(--accent)', fontWeight: '700', letterSpacing: '0.5px', background: 'rgba(59,130,246,0.06)', borderTop: '1px solid rgba(59,130,246,0.2)' }}>
                            ⭐ MIS MODELOS
                          </div>
                          {customModels.map(m => {
                            const isSelected = order.datos_vehiculo?.modelo === m;
                            return (
                              <div
                                key={m}
                                style={{
                                  padding: '0.65rem 1rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  fontSize: '0.9rem',
                                  fontWeight: isSelected ? '700' : '400',
                                  color: isSelected ? '#fff' : '#cbd5e1',
                                  background: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                                  transition: 'background 0.1s ease'
                                }}
                                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? 'rgba(59,130,246,0.2)' : 'transparent'; }}
                              >
                                <span
                                  style={{ flex: 1, cursor: 'pointer' }}
                                  onClick={() => {
                                    updateNestedField('datos_vehiculo', 'modelo', m);
                                    setShowModelList(false);
                                  }}
                                >
                                  {m}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  {isSelected && <span style={{ color: 'var(--primary)', fontSize: '1rem' }}>✓</span>}
                                  <button
                                    type="button"
                                    title="Eliminar modelo"
                                    onClick={e => {
                                      e.stopPropagation();
                                      deleteCustomModel(m);
                                      const updated = getCustomModels();
                                      setCustomModels(updated);
                                    }}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#f87171',
                                      cursor: 'pointer',
                                      fontSize: '0.85rem',
                                      padding: '0.1rem 0.3rem',
                                      borderRadius: '4px',
                                      lineHeight: 1
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      )}

                      {/* Formulario agregar nuevo modelo */}
                      {showAddModel ? (
                        <div style={{ padding: '0.65rem 1rem', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(16,185,129,0.06)' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                              autoFocus
                              type="text"
                              className="form-control"
                              style={{ flex: 1, fontSize: '0.875rem', textTransform: 'uppercase' }}
                              placeholder="Ej: KTM DUKE 200..."
                              value={newModelInput}
                              onChange={e => setNewModelInput(e.target.value.toUpperCase())}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const ok = saveCustomModel(newModelInput);
                                  if (ok) {
                                    const updated = getCustomModels();
                                    setCustomModels(updated);
                                    updateNestedField('datos_vehiculo', 'modelo', newModelInput.trim().toUpperCase());
                                    setNewModelInput('');
                                    setShowAddModel(false);
                                    setShowModelList(false);
                                  }
                                }
                                if (e.key === 'Escape') { setShowAddModel(false); setNewModelInput(''); }
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ fontSize: '0.8rem', minHeight: '38px', padding: '0.35rem 0.75rem', flexShrink: 0 }}
                              onClick={() => {
                                const ok = saveCustomModel(newModelInput);
                                if (ok) {
                                  const updated = getCustomModels();
                                  setCustomModels(updated);
                                  updateNestedField('datos_vehiculo', 'modelo', newModelInput.trim().toUpperCase());
                                  setNewModelInput('');
                                  setShowAddModel(false);
                                  setShowModelList(false);
                                }
                              }}
                            >
                              Guardar
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{ fontSize: '0.8rem', minHeight: '38px', padding: '0.35rem 0.65rem', flexShrink: 0 }}
                              onClick={() => { setShowAddModel(false); setNewModelInput(''); }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            padding: '0.7rem 1rem',
                            borderTop: '1px solid rgba(255,255,255,0.08)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            color: 'var(--success)',
                            fontWeight: '600',
                            background: 'rgba(16,185,129,0.06)',
                            transition: 'background 0.1s ease'
                          }}
                          onClick={() => setShowAddModel(true)}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.12)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.06)'}
                        >
                          <span style={{ fontSize: '1.1rem' }}>＋</span> Agregar nuevo modelo
                        </div>
                      )}
                    </div>
                  )}
                </div>


                <div className="form-grid">
                  <div className="form-group">
                    <label>Modelo *</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontWeight: '600' }}
                      value={order.datos_vehiculo?.modelo || ''}
                      onChange={e => updateNestedField('datos_vehiculo', 'modelo', e.target.value)}
                      placeholder="Ej: HONDA GL 150"
                    />
                  </div>

                  <div className="form-group">
                    <label>Placa *</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px', color: 'var(--primary)', fontSize: '1.05rem' }}
                      value={order.datos_vehiculo?.placa || ''}
                      onChange={e => updateNestedField('datos_vehiculo', 'placa', e.target.value.toUpperCase())}
                      placeholder="Ej: 1234-5B o S/P"
                    />
                  </div>

                  <div className="form-group">
                    <label>Color</label>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {POPULAR_COLORS.map(c => {
                        const isSelected = order.datos_vehiculo?.color === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            className="btn btn-outline"
                            style={{
                              padding: '0.4rem 0.75rem',
                              fontSize: '0.825rem',
                              fontWeight: '600',
                              minHeight: '36px',
                              borderRadius: '6px',
                              background: isSelected ? 'var(--primary)' : 'transparent',
                              borderColor: isSelected ? 'rgba(255,255,255,0.35)' : 'var(--border-color)',
                              color: '#fff'
                            }}
                            onClick={() => updateNestedField('datos_vehiculo', 'color', c)}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Nivel de Gasolina</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.25rem' }}>
                      {[
                        { label: '🔴 E', value: 'E', title: 'Vacío' },
                        { label: '🟡 1/4', value: '1/4', title: 'Un Cuarto' },
                        { label: '🟢 1/2', value: '1/2', title: 'Medio' },
                        { label: '🟢 3/4', value: '3/4', title: 'Tres Cuartos' },
                        { label: '🟢 F', value: 'F', title: 'Lleno' }
                      ].map(lvl => (
                        <button
                          key={lvl.value}
                          type="button"
                          className="btn"
                          title={lvl.title}
                          style={{
                            padding: '0.4rem 0.15rem',
                            fontSize: '0.8rem',
                            minHeight: '38px',
                            minWidth: 0,
                            background: order.datos_vehiculo?.gasolina === lvl.value ? 'var(--accent)' : '#090d16',
                            border: order.datos_vehiculo?.gasolina === lvl.value ? '1.5px solid #fff' : '1px solid var(--border-color)',
                            color: '#fff',
                            fontWeight: '600'
                          }}
                          onClick={() => updateNestedField('datos_vehiculo', 'gasolina', lvl.value)}
                        >
                          {lvl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Kilometraje</label>
                    <input
                      type="text"
                      className="form-control"
                      value={order.datos_vehiculo?.kilometraje || ''}
                      onChange={e => updateNestedField('datos_vehiculo', 'kilometraje', e.target.value)}
                      placeholder="Ej: 15400 km"
                    />
                  </div>

                  <div className="form-group">
                    <label>N° Motor / Chasis (Opcional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="N° Motor o Chasis..."
                      value={order.datos_vehiculo?.nro_motor || ''}
                      onChange={e => updateNestedField('datos_vehiculo', 'nro_motor', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ============================================ */}
          {/* PASO 3: TRABAJOS A REALIZAR Y DIAGNÓSTICO   */}
          {/* ============================================ */}
          <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
            <div
              className="card-header"
              onClick={() => isMobile && setStep3Open(o => !o)}
              style={{ cursor: isMobile ? 'pointer' : 'default', userSelect: 'none' }}
            >
              <div>
                <div className="card-title" style={{ fontSize: '1.08rem' }}>
                  <span style={{ background: 'var(--warning)', color: '#000', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.825rem', fontWeight: '700' }}>
                    3
                  </span>
                  Paso 3: Trabajos Solicitados y Diagnóstico
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Marque los trabajos solicitados y agregue mano de obra y repuestos.
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-process" style={{ fontSize: '0.775rem' }}>
                  Paso 3 de 4
                </span>
                {isMobile && (
                  <span style={{ color: 'var(--warning)', fontSize: '1.2rem', lineHeight: 1 }}>
                    {step3Open ? '▲' : '▼'}
                  </span>
                )}
              </div>
            </div>

            {(!isMobile || step3Open) && (
              <>
                {/* Servicios Requeridos — Panel desplegable */}
                <div style={{ marginBottom: '1.15rem', position: 'relative' }}>
                  {/* Botón toggle */}
                  <button
                    type="button"
                    onClick={() => setShowServiciosList(v => !v)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(11, 15, 25, 0.5)',
                      border: showServiciosList ? '1px solid var(--warning)' : '1px solid var(--border-color)',
                      borderRadius: showServiciosList ? '8px 8px 0 0' : '8px',
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      color: '#e2e8f0',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      transition: 'all 0.15s ease',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
                      🔧 Servicios Requeridos
                      {/* Chips de servicios activos */}
                      {Object.keys(order.trabajos_especificos || {})
                        .filter(k => k !== 'otros' && order.trabajos_especificos[k])
                        .slice(0, 3)
                        .map(k => (
                          <span key={k} style={{
                            fontSize: '0.7rem', fontWeight: '700',
                            background: 'rgba(245,158,11,0.2)', color: 'var(--warning)',
                            border: '1px solid rgba(245,158,11,0.4)',
                            padding: '0.1rem 0.45rem', borderRadius: '10px'
                          }}>
                            {k.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        ))
                      }
                      {/* +N más */}
                      {Object.keys(order.trabajos_especificos || {})
                        .filter(k => k !== 'otros' && order.trabajos_especificos[k]).length > 3 && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--warning)', fontWeight: '700' }}>
                          +{Object.keys(order.trabajos_especificos || {}).filter(k => k !== 'otros' && order.trabajos_especificos[k]).length - 3} más
                        </span>
                      )}
                      {/* Ninguno seleccionado */}
                      {Object.keys(order.trabajos_especificos || {})
                        .filter(k => k !== 'otros' && order.trabajos_especificos[k]).length === 0 && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '400' }}>
                          Ninguno seleccionado
                        </span>
                      )}
                    </span>
                    <span style={{ color: 'var(--warning)', fontSize: '1rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                      {showServiciosList ? '▲' : '▼'}
                    </span>
                  </button>

                  {/* Panel con checkboxes */}
                  {showServiciosList && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 20,
                      background: '#0f1729',
                      border: '1px solid var(--warning)',
                      borderTop: 'none',
                      borderRadius: '0 0 10px 10px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      maxHeight: '320px',
                      overflowY: 'auto'
                    }}>
                      {/* Acciones rápidas */}
                      <div style={{ display: 'flex', gap: '0.5rem', padding: '0.6rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(245,158,11,0.06)' }}>
                        <button
                          type="button"
                          className="btn"
                          style={{ fontSize: '0.75rem', minHeight: '30px', padding: '0.2rem 0.65rem', background: 'rgba(245,158,11,0.15)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.3)' }}
                          onClick={() => {
                            Object.keys(order.trabajos_especificos || {}).filter(k => k !== 'otros').forEach(k =>
                              updateNestedField('trabajos_especificos', k, true)
                            );
                          }}
                        >
                          ✓ Todos
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ fontSize: '0.75rem', minHeight: '30px', padding: '0.2rem 0.65rem' }}
                          onClick={() => {
                            Object.keys(order.trabajos_especificos || {}).filter(k => k !== 'otros').forEach(k =>
                              updateNestedField('trabajos_especificos', k, false)
                            );
                          }}
                        >
                          ✗ Ninguno
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ fontSize: '0.75rem', minHeight: '30px', padding: '0.2rem 0.65rem', marginLeft: 'auto' }}
                          onClick={() => setShowServiciosList(false)}
                        >
                          Cerrar ▲
                        </button>
                      </div>

                      {/* Lista de servicios */}
                      {Object.keys(order.trabajos_especificos || {}).filter(k => k !== 'otros').map((jobKey, i, arr) => {
                        const isChecked = !!order.trabajos_especificos[jobKey];
                        return (
                          <label
                            key={jobKey}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              padding: '0.7rem 1rem',
                              cursor: 'pointer',
                              background: isChecked ? 'rgba(245,158,11,0.12)' : 'transparent',
                              borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                              transition: 'background 0.1s ease',
                              userSelect: 'none'
                            }}
                            onMouseEnter={e => { if (!isChecked) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = isChecked ? 'rgba(245,158,11,0.12)' : 'transparent'; }}
                          >
                            {/* Checkbox custom */}
                            <span style={{
                              width: '20px', height: '20px', flexShrink: 0,
                              borderRadius: '5px',
                              border: isChecked ? '2px solid var(--warning)' : '2px solid #334155',
                              background: isChecked ? 'var(--warning)' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.8rem', color: '#000', fontWeight: '900',
                              transition: 'all 0.1s ease'
                            }}>
                              {isChecked ? '✓' : ''}
                            </span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => updateNestedField('trabajos_especificos', jobKey, e.target.checked)}
                              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                            />
                            <span style={{
                              fontSize: '0.9rem',
                              fontWeight: isChecked ? '600' : '400',
                              color: isChecked ? '#fff' : '#94a3b8'
                            }}>
                              {jobKey.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Fallas reportadas */}
                <div className="form-group" style={{ marginBottom: '1.15rem' }}>
                  <label>Síntomas / Requerimientos del Cliente:</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    style={{ fontSize: '0.95rem' }}
                    value={order.requerimientos_cliente || ''}
                    onChange={e => setOrder({ ...order, requerimientos_cliente: e.target.value })}
                    placeholder="Fallas reportadas por el cliente (ej: ruido en motor, frenos largos, fuga de aceite)..."
                  />
                </div>

                {/* Mano de Obra Frecuente — Panel desplegable */}
                <div style={{ background: 'rgba(11, 15, 25, 0.5)', padding: '0.95rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1.15rem' }}>

                  {/* Botón toggle dropdown */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowLaborList(v => !v)}
                      style={{
                        flex: '1 1 220px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: showLaborList ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                        border: showLaborList ? '1px solid var(--accent)' : '1px solid rgba(59,130,246,0.35)',
                        borderRadius: '8px',
                        padding: '0.6rem 0.9rem',
                        cursor: 'pointer',
                        color: '#fff',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                        Mano de Obra Frecuente
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '400' }}>
                          ({LABOR_PRESETS.length} presets)
                        </span>
                      </span>
                      <span style={{ color: 'var(--accent)', fontSize: '1rem' }}>{showLaborList ? '▲' : '▼'}</span>
                    </button>

                    {/* Botón fila manual siempre visible */}
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem', minHeight: '38px', padding: '0.3rem 0.75rem', flexShrink: 0 }}
                      onClick={() => addItemRow('mano_obra_items')}
                    >
                      + Fila Manual
                    </button>
                  </div>

                  {/* Panel de presets integrado */}
                  {showLaborList && (
                    <div style={{
                      marginBottom: '0.85rem',
                      background: '#0a0f1d',
                      border: '1px solid var(--accent)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                      maxHeight: '270px',
                      overflowY: 'auto'
                    }}>
                      {/* Cabecera con cerrar */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0.85rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(59,130,246,0.08)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: '600' }}>
                          Toque un trabajo para agregarlo a la orden:
                        </span>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ fontSize: '0.72rem', minHeight: '26px', padding: '0.15rem 0.55rem' }}
                          onClick={() => setShowLaborList(false)}
                        >
                          Cerrar ▲
                        </button>
                      </div>

                      {LABOR_PRESETS.map((p, i) => (
                        <div
                          key={`lp-${i}`}
                          style={{
                            padding: '0.7rem 1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                            borderBottom: i < LABOR_PRESETS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            transition: 'background 0.1s ease'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          onClick={() => {
                            addLaborPreset(p);
                            setShowLaborList(false);
                          }}
                        >
                          <span style={{ fontSize: '0.875rem', color: '#e2e8f0' }}>{p.descripcion}</span>
                          <span style={{
                            fontSize: '0.85rem', fontWeight: '700',
                            color: 'var(--warning)',
                            background: 'rgba(245,158,11,0.12)',
                            border: '1px solid rgba(245,158,11,0.3)',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            flexShrink: 0
                          }}>
                            S/ {p.precio.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Lista actual de Mano de Obra */}
                  {(order.mano_obra_items || []).length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      {(order.mano_obra_items || []).map((mo, idx) => (
                        <div key={`mo-${idx}`} style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <input
                            type="text"
                            className="form-control"
                            style={{ flex: '2 1 180px', minWidth: '150px', fontWeight: '500' }}
                            value={mo.descripcion || ''}
                            onChange={e => handleItemChange('mano_obra_items', idx, 'descripcion', e.target.value)}
                            placeholder="Descripción trabajo..."
                          />
                          <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flex: '1 1 120px' }}>
                            <input
                              type="number"
                              className="form-control"
                              style={{ flex: 1, minWidth: '75px', fontWeight: '600', color: 'var(--primary)' }}
                              value={mo.precio_unitario || ''}
                              onChange={e => handleItemChange('mano_obra_items', idx, 'precio_unitario', e.target.value)}
                              placeholder="Precio S/"
                            />
                            <button type="button" className="btn btn-danger" style={{ minHeight: '44px', padding: '0.4rem 0.75rem', flexShrink: 0 }} onClick={() => removeItemRow('mano_obra_items', idx)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Repuestos de Taller — Panel desplegable */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
                      <button
                        type="button"
                        onClick={() => setShowPartsList(v => !v)}
                        style={{
                          flex: '1 1 220px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: showPartsList ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                          border: showPartsList ? '1px solid var(--success)' : '1px solid rgba(16,185,129,0.35)',
                          borderRadius: '8px',
                          padding: '0.6rem 0.9rem',
                          cursor: 'pointer',
                          color: '#fff',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          textAlign: 'left',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Package size={15} style={{ color: 'var(--success)', flexShrink: 0 }} />
                          Repuestos de Taller Frecuentes
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '400' }}>
                            ({workshopParts.length} items)
                          </span>
                        </span>
                        <span style={{ color: 'var(--success)', fontSize: '1rem' }}>{showPartsList ? '▲' : '▼'}</span>
                      </button>

                      {/* Botón fila manual */}
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ fontSize: '0.8rem', minHeight: '38px', padding: '0.3rem 0.75rem', flexShrink: 0 }}
                        onClick={() => addItemRow('repuestos_items')}
                      >
                        + Fila Manual
                      </button>
                    </div>

                    {/* Panel de repuestos integrado (expande la tarjeta naturalmente, nunca se corta) */}
                    {showPartsList && (
                      <div style={{
                        marginBottom: '0.85rem',
                        background: '#0a0f1d',
                        border: '1px solid var(--success)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                        maxHeight: '290px',
                        overflowY: 'auto'
                      }}>
                        {/* Cabecera con cerrar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0.85rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(16,185,129,0.08)' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: '600' }}>
                            Toque un repuesto para agregarlo a la orden:
                          </span>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ fontSize: '0.72rem', minHeight: '26px', padding: '0.15rem 0.55rem' }}
                            onClick={() => setShowPartsList(false)}
                          >
                            Cerrar ▲
                          </button>
                        </div>

                        {workshopParts.map((part, i) => (
                          <div
                            key={part.id}
                            style={{
                              padding: '0.7rem 1rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.75rem',
                              borderBottom: i < workshopParts.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                              transition: 'background 0.1s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            onClick={() => {
                              addRepuestoPreset(part);
                              setShowPartsList(false);
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.875rem', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {part.descripcion}
                              </div>
                              {part.categoria && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                                  {part.categoria} {part.codigo ? `· ${part.codigo}` : ''}
                                </div>
                              )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0 }}>
                              <span style={{
                                fontSize: '0.85rem', fontWeight: '700',
                                color: 'var(--success)',
                                background: 'rgba(16,185,129,0.12)',
                                border: '1px solid rgba(16,185,129,0.3)',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '6px'
                              }}>
                                S/ {part.precio.toFixed(2)}
                              </span>
                              {part.stock !== undefined && (
                                <span style={{ fontSize: '0.68rem', color: part.stock > 5 ? 'var(--success)' : 'var(--warning)' }}>
                                  Stock: {part.stock}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Lista actual de Repuestos */}
                    {(order.repuestos_items || []).length > 0 && (
                      <div style={{ marginTop: '0.75rem' }}>
                        {(order.repuestos_items || []).map((rep, idx) => (
                          <div key={`rep-${idx}`} style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                            <input
                              type="text"
                              className="form-control"
                              style={{ flex: '2 1 180px', minWidth: '150px' }}
                              placeholder="Descripción del repuesto..."
                              value={rep.descripcion || ''}
                              onChange={e => handleItemChange('repuestos_items', idx, 'descripcion', e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flex: '1 1 150px' }}>
                              <input
                                type="number"
                                className="form-control"
                                style={{ flex: 1, minWidth: '70px', fontWeight: '600', color: 'var(--success)' }}
                                placeholder="Precio S/"
                                value={rep.precio_unitario ?? ''}
                                onChange={e => handleItemChange('repuestos_items', idx, 'precio_unitario', e.target.value)}
                              />
                              <input
                                type="number"
                                min="1"
                                className="form-control"
                                style={{ width: '70px', minWidth: '55px', textAlign: 'center', fontWeight: '600' }}
                                value={rep.cantidad ?? 1}
                                onChange={e => handleItemChange('repuestos_items', idx, 'cantidad', e.target.value)}
                                title="Cantidad"
                              />
                              <button type="button" className="btn btn-danger" style={{ minHeight: '44px', padding: '0.4rem 0.75rem', flexShrink: 0 }} onClick={() => removeItemRow('repuestos_items', idx)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>



          {/* ============================================ */}
          {/* PASO 4: TOTALES Y PAGO                      */}
          {/* ============================================ */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, #111827 0%, #090d16 100%)',
            border: '1.5px solid rgba(16, 185, 129, 0.45)',
            borderRadius: '12px'
          }}>
            <div className="card-header">
              <div className="card-title" style={{ fontSize: '1.08rem' }}>
                <span style={{ background: 'var(--success)', color: '#000', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.825rem', fontWeight: '700' }}>
                  4
                </span>
                Paso 4: Total a Cobrar y Confirmación
              </div>
              <span className="badge badge-ready" style={{ fontSize: '0.775rem' }}>
                Resumen de Cobro
              </span>
            </div>

            <div className="order-totals-grid">
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Mano de Obra:</div>
                <strong style={{ fontSize: '1.35rem', color: '#fff' }}>S/ {(order.resumen_soles?.subtotal_mo || 0).toFixed(2)}</strong>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Repuestos:</div>
                <strong style={{ fontSize: '1.35rem', color: '#fff' }}>S/ {(order.resumen_soles?.subtotal_repuestos || 0).toFixed(2)}</strong>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: '700', display: 'block', marginBottom: '0.3rem' }}>
                  Adelanto a Cuenta (S/):
                </label>
                <input
                  type="number"
                  step="5.00"
                  className="form-control"
                  style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--warning)', background: '#090d16' }}
                  value={order.resumen_soles?.adelantos ?? ''}
                  onChange={e => updateNestedField('resumen_soles', 'adelantos', Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>

              {/* TOTAL A PAGAR ELEGANTE */}
              <div style={{ background: 'rgba(16, 185, 129, 0.14)', padding: '1rem 1.15rem', borderRadius: '8px', border: '1.5px solid var(--success)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: '700', letterSpacing: '0.5px' }}>
                  TOTAL A PAGAR:
                </div>
                <div style={{ fontSize: '1.95rem', fontWeight: '800', color: '#34d399', lineHeight: '1.2' }}>
                  S/ {(order.resumen_soles?.total_a_pagar || 0).toFixed(2)}
                </div>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="order-actions-bar" style={{ marginTop: '1.35rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: '0.875rem', minHeight: '44px', borderColor: 'var(--border-color)', color: '#cbd5e1' }}
                onClick={() => setActiveTab('INVENTARIO')}
              >
                <CheckSquare size={17} style={{ color: 'var(--accent)' }} /> Checklist Accesorios ➔
              </button>

              <div className="order-actions-group" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ background: '#25D366', color: '#fff', borderColor: '#25D366', fontSize: '0.9rem', minHeight: '44px', padding: '0.55rem 1.25rem' }}
                  onClick={sendWhatsAppNotification}
                >
                  <Send size={16} /> WhatsApp
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.9rem', minHeight: '44px', padding: '0.55rem 1.25rem' }}
                  onClick={() => onPrint(order)}
                >
                  <Printer size={16} /> Imprimir Ficha
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ padding: '0.6rem 1.85rem', fontSize: '0.95rem', fontWeight: '700', minHeight: '44px', background: 'var(--success)' }}
                  onClick={() => onSave(order)}
                >
                  <Save size={18} /> Guardar Orden
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* VISTA 2: INVENTARIO (CHECKLIST DE RECEPCIÓN Y REPUESTOS)       */}
      {/* ============================================================== */}
      {activeTab === 'INVENTARIO' && (
        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="card-title">
                <CheckSquare size={22} style={{ color: 'var(--success)' }} />
                📦 Inventario y Checklist de Recepción de la Motocicleta
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Verifique los accesorios presentes al ingresar la moto ({order.datos_vehiculo?.modelo || 'Motocicleta'} - {order.datos_vehiculo?.placa || 'S/P'})
              </span>
            </div>

            {/* Quick Bulk Action Buttons */}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                className="btn"
                style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid var(--success)', color: '#fff', fontWeight: 'bold' }}
                onClick={() => toggleAllInventory(true)}
              >
                <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                ⚡ Marcar TODO OK (1 Clic)
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ borderColor: 'var(--danger)', color: '#f87171' }}
                onClick={() => toggleAllInventory(false)}
              >
                <XCircle size={18} style={{ color: 'var(--danger)' }} />
                ❎ Desmarcar Todo
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ borderColor: 'var(--accent)', color: '#fff' }}
                onClick={() => setShowAddAccessory(true)}
              >
                + Agregar Accesorio
              </button>
            </div>
          </div>

          {/* Formulario rápido para añadir accesorio personalizado */}
          {showAddAccessory && (
            <form onSubmit={handleAddCustomAccessory} style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--accent)', padding: '0.85rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <strong style={{ fontSize: '0.85rem', color: '#fff' }}>Nuevo Accesorio / Parte para esta Moto:</strong>
              <input
                type="text"
                autoFocus
                required
                className="form-control"
                style={{ flex: 1, minWidth: '200px' }}
                placeholder="Ej: Alarma con control, Sliders, Neblineras LED, Casco..."
                value={newAccessoryName}
                onChange={e => setNewAccessoryName(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                Añadir al Checklist
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowAddAccessory(false)}>
                Cancelar
              </button>
            </form>
          )}

          {/* Categorized Checklist Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {INVENTORY_CATEGORIES.map((cat, catIdx) => (
              <div
                key={`cat-inv-${catIdx}`}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  padding: '1rem'
                }}
              >
                <h4 style={{ margin: '0 0 0.85rem 0', fontSize: '0.95rem', color: 'var(--accent)', borderBottom: '1px solid #334155', paddingBottom: '0.4rem' }}>
                  {cat.title}
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.45rem' }}>
                  {cat.keys.map(key => {
                    const isChecked = !!order.inventario_vehiculo[key];
                    return (
                      <label
                        key={key}
                        className="checkbox-label"
                        style={{
                          background: isChecked ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.02)',
                          padding: '0.45rem 0.6rem',
                          borderRadius: '8px',
                          border: isChecked ? '1px solid var(--success)' : '1px solid rgba(255,255,255,0.06)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => updateNestedField('inventario_vehiculo', key, e.target.checked)}
                        />
                        <span style={{ fontSize: '0.78rem', color: isChecked ? '#fff' : 'var(--text-muted)', fontWeight: isChecked ? '600' : 'normal' }}>
                          {key.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* SECCIÓN DE ACCESORIOS PERSONALIZADOS EDITABLES */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '12px',
                border: '1px solid var(--accent)',
                padding: '1rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '0.4rem', marginBottom: '0.85rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--accent)' }}>
                  ⭐ Accesorios Personalizados
                </h4>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={() => setShowAddAccessory(true)}
                >
                  + Agregar
                </button>
              </div>

              {(!order.inventario_vehiculo?.custom_items || order.inventario_vehiculo.custom_items.length === 0) ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem' }}>
                  No hay accesorios adicionales. Haz clic en "+ Agregar Accesorio" para añadir uno (ej: Alarma, Defensas, etc.).
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {order.inventario_vehiculo.custom_items.map(item => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: item.estado ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.02)',
                        padding: '0.45rem 0.6rem',
                        borderRadius: '8px',
                        border: item.estado ? '1px solid var(--success)' : '1px solid rgba(255,255,255,0.06)'
                      }}
                    >
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1, margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={item.estado}
                          onChange={() => handleToggleCustomAccessory(item.id)}
                        />
                        <span style={{ fontSize: '0.82rem', fontWeight: item.estado ? 'bold' : 'normal', color: item.estado ? '#fff' : 'var(--text-muted)' }}>
                          {item.nombre}
                        </span>
                      </label>
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}
                        onClick={() => handleDeleteCustomAccessory(item.id)}
                        title="Eliminar este accesorio"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label>Observaciones de Inventario / Daños Previos (Rayaduras, Golpes, Faltantes)</label>
            <textarea
              className="form-control"
              rows="2"
              value={order.observaciones || ''}
              onChange={e => setOrder({ ...order, observaciones: e.target.value })}
              placeholder="Indique si la moto ingresa con rayones en tanque, espejo quebrado, etc..."
            />
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setActiveTab('DATOS')}
            >
              ⬅ Volver a Datos de la Orden (Cliente, Moto, Trabajos)
            </button>

            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '0.75rem 2rem', fontWeight: 'bold' }}
              onClick={() => onSave(order)}
            >
              <Save size={18} /> Guardar Orden
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
