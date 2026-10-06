import React, { useState, useEffect } from 'react';
import { Save, Printer, ArrowLeft, Plus, Trash2, Calculator, CheckSquare, Wrench, User, Bike, DollarSign } from 'lucide-react';
import PrintableOrder from './PrintableOrder';

export default function OrderEditor({ initialOrder, onSave, onCancel, onPrint }) {
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
        modelo: '', nro_motor: '', nro_chasis: '', ano_fab: '', color: '', placa: '', kilometraje: '', gasolina: '1/2'
      },
      tipo_servicio: {
        reparacion_general: false, reparacion_parcial: false, mantenimiento_preventivo: false, mantenimiento_general: true, servicio_express: false, servicio_garantia: false
      },
      trabajos_especificos: {
        mantenimiento: true, cambio_aceite: true, reparacion_motor: false, descarbonizados: false, embrague: false, transmision: false, sistema_arrastre: false, frenos: false, bateria: false, revision_electrico: false, revision_encendido: false, suspension: false, aro_neumatico: false, sistema_escape: false, sistema_direccion: false, otros: ''
      },
      resumen_soles: {
        mo_mantenimiento: 0, mo_reparacion: 0, servicio_terceros: 0, otros_mo: 0, subtotal_mo: 0,
        repuestos: 0, accesorios: 0, lubricantes: 0, otros_repuestos: 0, subtotal_repuestos: 0,
        valor_venta_total: 0, adelantos: 0, total_a_pagar: 0
      },
      requerimientos_cliente: '',
      inventario_vehiculo: {
        llave_contacto: true, tarjeta_propiedad: true, libro_servicio: false, espejos_izq: true, espejos_der: true, tapiz_asiento: true, porta_herramientas: true, telescopicas: true, cobertores: true, tapas_laterales_izq: true, tapas_laterales_der: true, parrilla: true, velocimetro: true, tacometro: true, maletera_delivery: false, seguro_cadena: true, cable_freno_delantero: true, cable_embrague: true, cable_velocimetro: true, cable_tacometro: true, parador_lateral: true, parador_central: true, cubrecadena: true, amortiguadores_post_1: true, amortiguadores_post_2: true, guardafango_delantero: true, guardafango_posterior: true, llanta_delantera_buena: true, llanta_delantera_gastada: false, llanta_posterior_buena: true, llanta_posterior_gastada: false, pedal_arranque: true, pedal_cambio: true, tapa_lateral_si: true, tapa_lateral_no: false, jebe_estribo_izq: true, jebe_estribo_der: true, descanza_pie_izq: true, descanza_pie_der: true, faro_delantero: true, tapa_gasolina: true, herramientas: true, varilla_aceite: true, tapa_deposito_freno: true, escarines: true, emblemas: true, faros_direccionales_laterales: true, faros_posteriores: true, pedal_frenos: true, otros: ''
      },
      forma_pago: 'EFECTIVO',
      facturacion: { tipo: 'BOLETA', series: 'B001', numeros: '' },
      firmas: { aceptado_cliente_nombre: '', aceptado_cliente_dni: '', vb_asesor: 'ALONSO V.', recibi_conforme_nombre: '', recibi_conforme_dni: '' },
      repuestos_items: [],
      terceros_items: [],
      mano_obra_items: [],
      observaciones: '',
      tecnico_responsable: 'ALONSO VARGAS L.',
      hora_inicio: '', hora_fin: '', fecha_trabajo: new Date().toISOString().split('T')[0],
      estado: 'EN_PROCESO'
    };
  });

  const [activeTab, setActiveTab] = useState('DATOS'); // DATOS, INVENTARIO, ITEMS, PREVIEW

  // Recalculate Totals automatically whenever items or summary change
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

  const removeItemRow = (listName, index) => {
    const list = (order[listName] || []).filter((_, i) => i !== index);
    setOrder(prev => ({ ...prev, [listName]: list }));
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Top Header Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: '10px', zIndex: 100, backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={onCancel}>
            <ArrowLeft size={18} /> Volver
          </button>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>
              Orden: <span style={{ color: 'var(--primary)' }}>{order.numero_orden}</span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {order.datos_cliente?.razon_social || 'Cliente'} &nbsp;|&nbsp; Placa: {order.datos_vehiculo?.placa || 'S/N'}
            </span>
          </div>
        </div>

        {/* Tab Selector inside Header */}
        <div className="nav-tabs" style={{ width: '100%', maxWidth: '500px' }}>
          <button className={`nav-tab ${activeTab === 'DATOS' ? 'active' : ''}`} onClick={() => setActiveTab('DATOS')}>
            <User size={16} /> Datos
          </button>
          <button className={`nav-tab ${activeTab === 'INVENTARIO' ? 'active' : ''}`} onClick={() => setActiveTab('INVENTARIO')}>
            <CheckSquare size={16} /> Moto
          </button>
          <button className={`nav-tab ${activeTab === 'ITEMS' ? 'active' : ''}`} onClick={() => setActiveTab('ITEMS')}>
            <Wrench size={16} /> Repuestos
          </button>
          <button className={`nav-tab ${activeTab === 'PREVIEW' ? 'active' : ''}`} onClick={() => setActiveTab('PREVIEW')}>
            <Printer size={16} /> PDF
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '300px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => onPrint(order)}>
            <Printer size={18} /> Imprimir
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onSave(order)}>
            <Save size={18} /> Guardar
          </button>
        </div>
      </div>

      {/* TAB 1: DATOS GENERALES Y TRABAJOS */}
      {activeTab === 'DATOS' && (
        <>
          {/* Ficha Header & Cliente */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: '1rem' }}>
              <User size={20} style={{ color: 'var(--accent)' }} /> 1. Datos de la Orden y del Cliente
            </div>
            <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label>N° Orden Servicio</label>
                <input type="text" className="form-control" value={order.numero_orden} onChange={e => setOrder({ ...order, numero_orden: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Fecha Emisión</label>
                <input type="date" className="form-control" value={order.fecha_emision} onChange={e => setOrder({ ...order, fecha_emision: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Condición Pago</label>
                <select className="form-control" value={order.condicion_pago} onChange={e => setOrder({ ...order, condicion_pago: e.target.value })}>
                  <option value="CONTADO">CONTADO</option>
                  <option value="CRÉDITO">CRÉDITO</option>
                  <option value="HDP">HDP</option>
                </select>
              </div>
              <div className="form-group">
                <label>Estado de Orden</label>
                <select className="form-control" value={order.estado} onChange={e => setOrder({ ...order, estado: e.target.value })}>
                  <option value="EN_PROCESO">EN PROCESO</option>
                  <option value="COMPLETADO">COMPLETADO</option>
                  <option value="ENTREGADO">ENTREGADO</option>
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Razón Social / Nombre</label>
                <input type="text" className="form-control" value={order.datos_cliente?.razon_social || ''} onChange={e => updateNestedField('datos_cliente', 'razon_social', e.target.value)} />
              </div>
              <div className="form-group">
                <label>D.N.I. / R.U.C.</label>
                <input type="text" className="form-control" value={order.datos_cliente?.dni || order.datos_cliente?.ruc || ''} onChange={e => updateNestedField('datos_cliente', 'dni', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Celular / Teléfono</label>
                <input type="text" className="form-control" value={order.datos_cliente?.celular || ''} onChange={e => updateNestedField('datos_cliente', 'celular', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input type="text" className="form-control" value={order.datos_cliente?.direccion || ''} onChange={e => updateNestedField('datos_cliente', 'direccion', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Vehículo y Tipo Servicio */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: '1rem' }}>
              <Bike size={20} style={{ color: 'var(--primary)' }} /> 2. Datos del Vehículo (Motocicleta)
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Modelo</label>
                <input type="text" className="form-control" value={order.datos_vehiculo?.modelo || ''} onChange={e => updateNestedField('datos_vehiculo', 'modelo', e.target.value)} placeholder="Ej: HONDA GL 150" />
              </div>
              <div className="form-group">
                <label>Placa</label>
                <input type="text" className="form-control" value={order.datos_vehiculo?.placa || ''} onChange={e => updateNestedField('datos_vehiculo', 'placa', e.target.value)} placeholder="Ej: 1234-AB" />
              </div>
              <div className="form-group">
                <label>Color</label>
                <input type="text" className="form-control" value={order.datos_vehiculo?.color || ''} onChange={e => updateNestedField('datos_vehiculo', 'color', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Kilometraje</label>
                <input type="text" className="form-control" value={order.datos_vehiculo?.kilometraje || ''} onChange={e => updateNestedField('datos_vehiculo', 'kilometraje', e.target.value)} />
              </div>
              <div className="form-group">
                <label>N° Motor</label>
                <input type="text" className="form-control" value={order.datos_vehiculo?.nro_motor || ''} onChange={e => updateNestedField('datos_vehiculo', 'nro_motor', e.target.value)} />
              </div>
              <div className="form-group">
                <label>N° Chasis</label>
                <input type="text" className="form-control" value={order.datos_vehiculo?.nro_chasis || ''} onChange={e => updateNestedField('datos_vehiculo', 'nro_chasis', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Nivel Gasolina</label>
                <select className="form-control" value={order.datos_vehiculo?.gasolina || '1/2'} onChange={e => updateNestedField('datos_vehiculo', 'gasolina', e.target.value)}>
                  <option value="E">E (Vacio)</option>
                  <option value="1/4">1/4</option>
                  <option value="1/2">1/2</option>
                  <option value="3/4">3/4</option>
                  <option value="F">F (Lleno)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Trabajos a Realizar */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: '1rem' }}>
              <Wrench size={20} style={{ color: 'var(--warning)' }} /> 3. Trabajos Específicos a Realizar
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '0.6rem', marginBottom: '1.25rem' }}>
              {Object.keys(order.trabajos_especificos || {}).filter(k => k !== 'otros').map(jobKey => (
                <label key={jobKey} className="checkbox-label" style={{ background: '#0f172a', padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <input
                    type="checkbox"
                    checked={!!order.trabajos_especificos[jobKey]}
                    onChange={e => updateNestedField('trabajos_especificos', jobKey, e.target.checked)}
                  />
                  <span>{jobKey.replace(/_/g, ' ').toUpperCase()}</span>
                </label>
              ))}
            </div>

            <div className="form-group">
              <label>Requerimientos del Cliente / Observaciones Iniciales</label>
              <textarea
                className="form-control"
                value={order.requerimientos_cliente || ''}
                onChange={e => setOrder({ ...order, requerimientos_cliente: e.target.value })}
                placeholder="Indique los problemas reportados por el cliente..."
              />
            </div>
          </div>
        </>
      )}

      {/* TAB 2: INVENTARIO DE LA MOTOCICLETA */}
      {activeTab === 'INVENTARIO' && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: '1rem' }}>
            <CheckSquare size={20} style={{ color: 'var(--success)' }} /> Checklist del Inventario de la Moto
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Marque los elementos y estado de accesorios presentes en la entrega de la unidad.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '0.5rem' }}>
            {Object.keys(order.inventario_vehiculo || {}).filter(k => k !== 'otros').map(invKey => (
              <label key={invKey} className="checkbox-label" style={{ background: '#0f172a', padding: '0.4rem 0.7rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <input
                  type="checkbox"
                  checked={!!order.inventario_vehiculo[invKey]}
                  onChange={e => updateNestedField('inventario_vehiculo', invKey, e.target.checked)}
                />
                <span style={{ fontSize: '0.8rem' }}>{invKey.replace(/_/g, ' ').toUpperCase()}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REPUESTOS, SERVICIOS Y MANO DE OBRA */}
      {activeTab === 'ITEMS' && (
        <>
          {/* TABLA REPUESTOS */}
          <div className="card">
            <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div className="card-title">🔩 Tabla de Repuestos (Editables)</div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Edite descripciones, precios o cantidades libremente. El subtotal se calcula solo.</span>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {/* Botón de Selección Rápida de Repuestos Frecuentes */}
                <select
                  className="form-control"
                  style={{ width: '210px', background: '#0f172a', borderColor: 'var(--accent)', color: '#fff', fontSize: '0.85rem' }}
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const preset = JSON.parse(e.target.value);
                    const list = [...(order.repuestos_items || [])];
                    list.push({
                      item: list.length + 1,
                      num_parte: preset.num_parte,
                      descripcion: preset.descripcion,
                      precio_unitario: preset.precio,
                      cantidad: 1,
                      subtotal: preset.precio
                    });
                    setOrder(prev => ({ ...prev, repuestos_items: list }));
                    e.target.value = '';
                  }}
                >
                  <option value="">+ Insertar Repuesto Frecuente...</option>
                  <option value='{"num_parte":"HON-10W30","descripcion":"ACEITE HONDA 4T 10W30 (1L)","precio":35}'>🛢️ Aceite Honda 10W30 - S/ 35.00</option>
                  <option value='{"num_parte":"HON-FILT01","descripcion":"FILTRO DE ACEITE ORIGINAL","precio":15}'>⚙️ Filtro de Aceite - S/ 15.00</option>
                  <option value='{"num_parte":"HON-PAST01","descripcion":"PASTILLAS DE FRENO DELANTERO","precio":45}'>🛑 Pastillas de Freno - S/ 45.00</option>
                  <option value='{"num_parte":"NGK-BUJIA","descripcion":"BUJÍA DE ENCENDIDO NGK","precio":18}'>⚡ Bujía NGK - S/ 18.00</option>
                  <option value='{"num_parte":"KIT-ARRAST","descripcion":"KIT DE ARRASTRE COMPLETO","precio":140}'>⛓️ Kit de Arrastre - S/ 140.00</option>
                  <option value='{"num_parte":"CAMARA-18","descripcion":"CÁMARA DE LLANTA 2.75/3.00-18","precio":25}'>🛞 Cámara de Llanta - S/ 25.00</option>
                </select>

                <button className="btn btn-primary" onClick={() => addItemRow('repuestos_items')}>
                  <Plus size={16} /> + Agregar Fila en Blanco
                </button>
              </div>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>#</th>
                    <th style={{ width: '160px' }}>N° Parte / Código</th>
                    <th>Descripción del Repuesto</th>
                    <th style={{ width: '130px' }}>Precio Unit. (S/)</th>
                    <th style={{ width: '90px' }}>Cant.</th>
                    <th style={{ width: '130px' }}>Subtotal (S/)</th>
                    <th style={{ width: '60px', textAlign: 'center' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.repuestos_items || []).length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No hay repuestos agregados. Selecciona uno frecuente o haz clic en <strong>"+ Agregar Fila en Blanco"</strong>.
                      </td>
                    </tr>
                  ) : (
                    (order.repuestos_items || []).map((item, idx) => (
                      <tr key={`rep-row-${idx}`}>
                        <td style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>{idx + 1}</td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            style={{ fontSize: '0.85rem' }}
                            placeholder="Ej: HON-15410"
                            value={item.num_parte || ''}
                            onChange={e => handleItemChange('repuestos_items', idx, 'num_parte', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            style={{ fontSize: '0.9rem', fontWeight: '500' }}
                            placeholder="Descripción del repuesto..."
                            value={item.descripcion || ''}
                            onChange={e => handleItemChange('repuestos_items', idx, 'descripcion', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.50"
                            className="form-control"
                            style={{ fontWeight: 'bold', color: 'var(--success)' }}
                            value={item.precio_unitario ?? ''}
                            onChange={e => handleItemChange('repuestos_items', idx, 'precio_unitario', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            className="form-control"
                            style={{ textAlign: 'center', fontWeight: 'bold' }}
                            value={item.cantidad ?? 1}
                            onChange={e => handleItemChange('repuestos_items', idx, 'cantidad', e.target.value)}
                          />
                        </td>
                        <td>
                          <div style={{ padding: '0.4rem 0.6rem', background: '#0f172a', borderRadius: '6px', textAlign: 'right', fontWeight: 'bold', color: '#fff', border: '1px solid var(--border-color)' }}>
                            S/ {(item.subtotal || 0).toFixed(2)}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button className="btn btn-danger" style={{ padding: '0.4rem 0.6rem' }} title="Eliminar este repuesto" onClick={() => removeItemRow('repuestos_items', idx)}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLA MANO DE OBRA & SERVICIOS */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Mano de Obra y Servicios</div>
              <button className="btn btn-outline" onClick={() => addItemRow('mano_obra_items')}>
                <Plus size={16} /> Agregar Mano de Obra
              </button>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>#</th>
                    <th>Descripción Servicio</th>
                    <th style={{ width: '120px' }}>Precio Unit.</th>
                    <th style={{ width: '90px' }}>Cant.</th>
                    <th style={{ width: '120px' }}>Subtotal</th>
                    <th style={{ width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {(order.mano_obra_items || []).map((item, idx) => (
                    <tr key={`mo-row-${idx}`}>
                      <td>{idx + 1}</td>
                      <td>
                        <input type="text" className="form-control" value={item.descripcion || ''} onChange={e => handleItemChange('mano_obra_items', idx, 'descripcion', e.target.value)} />
                      </td>
                      <td>
                        <input type="number" step="0.01" className="form-control" value={item.precio_unitario || ''} onChange={e => handleItemChange('mano_obra_items', idx, 'precio_unitario', e.target.value)} />
                      </td>
                      <td>
                        <input type="number" className="form-control" value={item.cantidad || ''} onChange={e => handleItemChange('mano_obra_items', idx, 'cantidad', e.target.value)} />
                      </td>
                      <td>
                        <strong>S/ {(item.subtotal || 0).toFixed(2)}</strong>
                      </td>
                      <td>
                        <button className="btn btn-danger" style={{ padding: '0.3rem' }} onClick={() => removeItemRow('mano_obra_items', idx)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RESUMEN DE TOTALES Y ADELANTOS */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid var(--primary)' }}>
            <div className="card-title" style={{ color: 'var(--primary)' }}>
              <DollarSign size={20} /> Resumen Económico
            </div>

            <div className="form-grid" style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label>Subtotal Repuestos</label>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                  S/ {(order.resumen_soles?.subtotal_repuestos || 0).toFixed(2)}
                </div>
              </div>

              <div className="form-group">
                <label>Subtotal Mano de Obra</label>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                  S/ {(order.resumen_soles?.subtotal_mo || 0).toFixed(2)}
                </div>
              </div>

              <div className="form-group">
                <label>Adelantos Recibidos (S/)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={order.resumen_soles?.adelantos || ''}
                  onChange={e => updateNestedField('resumen_soles', 'adelantos', Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label style={{ color: 'var(--primary)', fontWeight: 'bold' }}>TOTAL A PAGAR</label>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--primary)' }}>
                  S/ {(order.resumen_soles?.total_a_pagar || 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* TAB 4: VISTA PREVIA E IMPRESIÓN */}
      {activeTab === 'PREVIEW' && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <button className="btn btn-primary" style={{ padding: '0.75rem 2rem' }} onClick={() => window.print()}>
              <Printer size={20} /> Imprimir Ficha Físicamente o Guardar en PDF
            </button>
          </div>

          <PrintableOrder order={order} />
        </div>
      )}
    </div>
  );
}
