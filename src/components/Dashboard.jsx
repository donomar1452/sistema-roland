import React, { useState } from 'react';
import { Search, Plus, FileText, Printer, Trash2, Edit3, CheckCircle, Clock, DollarSign, Wrench, Send, Copy } from 'lucide-react';

export default function Dashboard({ orders, onNewOrder, onOpenInventory, onScanOrder, onEditOrder, onPrintOrder, onDeleteOrder, onUpdateStatus }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODOS');


  const filteredOrders = orders.filter(o => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      (o.numero_orden || '').toLowerCase().includes(term) ||
      (o.datos_cliente?.razon_social || '').toLowerCase().includes(term) ||
      (o.datos_cliente?.dni || '').toLowerCase().includes(term) ||
      (o.datos_vehiculo?.placa || '').toLowerCase().includes(term) ||
      (o.datos_vehiculo?.modelo || '').toLowerCase().includes(term)
    );
    const matchesStatus = filterStatus === 'TODOS' || o.estado === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalOrders = orders.length;
  const enProceso = orders.filter(o => o.estado === 'EN_PROCESO' || !o.estado).length;
  const completadas = orders.filter(o => o.estado === 'COMPLETADO').length;
  const entregadas = orders.filter(o => o.estado === 'ENTREGADO').length;
  const totalSoles = orders.reduce((acc, o) => acc + (o.resumen_soles?.total_a_pagar || 0), 0);

  // WhatsApp Sender Helper
  const sendWhatsApp = (order) => {
    const phone = (order.datos_cliente?.celular || order.datos_cliente?.telefono || '').replace(/\D/g, '');
    const clientName = order.datos_cliente?.razon_social || 'Cliente';
    const bikeModel = order.datos_vehiculo?.modelo || 'Motocicleta';
    const plate = order.datos_vehiculo?.placa ? `(Placa: ${order.datos_vehiculo.placa})` : '';
    const total = (order.resumen_soles?.total_a_pagar || 0).toFixed(2);
    const orderNum = order.numero_orden || 'N/A';
    const estadoStr = order.estado === 'COMPLETADO' ? '¡LISTO PARA RETIRAR! 🏍️' : 'EN ATENCIÓN / REPARACIÓN 🛠️';

    const msg = `Hola *${clientName}*, le saludamos de *Taller ROLAND / ALONSO*.
Estado de su orden *${orderNum}* (${bikeModel} ${plate}): *${estadoStr}*.
💰 Total a pagar: *S/ ${total}*.
📌 Dirección: Calle Libertad 491, Jaén.
¡Muchas gracias!`;

    const fullPhone = phone ? (phone.startsWith('51') ? phone : `51${phone}`) : '';
    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Duplicate / Clone Order Helper
  const handleDuplicateOrder = (order) => {
    const duplicated = {
      ...order,
      id: undefined,
      numero_orden: `OS-${Math.floor(100000 + Math.random() * 900000)}`,
      fecha_emision: new Date().toISOString().split('T')[0],
      hora_emision: new Date().toTimeString().slice(0, 5),
      estado: 'EN_PROCESO'
    };
    onEditOrder(duplicated);
  };

  return (
    <div>
      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => setFilterStatus('TODOS')}>
          <div className="metric-icon red">
            <FileText size={24} />
          </div>
          <div>
            <div className="metric-value">{totalOrders}</div>
            <div className="metric-label">Total Órdenes</div>
          </div>
        </div>

        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => setFilterStatus('EN_PROCESO')}>
          <div className="metric-icon amber">
            <Clock size={24} />
          </div>
          <div>
            <div className="metric-value">{enProceso}</div>
            <div className="metric-label">En Trabajo / Taller</div>
          </div>
        </div>

        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => setFilterStatus('COMPLETADO')}>
          <div className="metric-icon green">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="metric-value">{completadas}</div>
            <div className="metric-label">Completadas / Listas</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="metric-value">S/ {totalSoles.toFixed(2)}</div>
            <div className="metric-label">Total Facturado</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="card-title">
            <Wrench size={20} /> Historial de Órdenes de Servicio
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              className="btn btn-outline"
              style={{ minHeight: '42px', fontSize: '0.9rem', fontWeight: '600', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399', padding: '0.5rem 1.1rem' }}
              onClick={onOpenInventory}
            >
              <Wrench size={18} style={{ color: '#34d399' }} /> Inventario
            </button>
            <button
              className="btn btn-primary"
              style={{ minHeight: '42px', fontSize: '0.9rem', fontWeight: '600', padding: '0.5rem 1.25rem' }}
              onClick={onNewOrder}
            >
              <Plus size={18} /> Nueva Orden
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div style={{ marginBottom: '1.15rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              className="form-control"
              style={{ minHeight: '46px', paddingLeft: '44px', fontSize: '0.95rem', width: '100%', borderRadius: '8px' }}
              placeholder="Buscar por placa, cliente, DNI o N° de orden..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.15rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '600', marginRight: '4px' }}>Estado:</span>
          {[
            { label: `Todas (${totalOrders})`, value: 'TODOS' },
            { label: `En Trabajo (${enProceso})`, value: 'EN_PROCESO' },
            { label: `Listas (${completadas})`, value: 'COMPLETADO' },
            { label: `Entregadas (${entregadas})`, value: 'ENTREGADO' }
          ].map(chip => (
            <button
              key={chip.value}
              type="button"
              className="btn"
              style={{
                fontSize: '0.825rem',
                fontWeight: '600',
                padding: '0.35rem 0.85rem',
                minHeight: '34px',
                borderRadius: '6px',
                background: filterStatus === chip.value ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                color: filterStatus === chip.value ? '#fff' : '#cbd5e1',
                border: filterStatus === chip.value ? '1px solid rgba(255,255,255,0.3)' : '1px solid var(--border-color)'
              }}
              onClick={() => setFilterStatus(chip.value)}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>N° Orden</th>
                <th>Fecha</th>
                <th>Cliente / RUC</th>
                <th>Vehículo / Placa</th>
                <th>Técnico</th>
                <th>Total S/</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones Rápidas</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No se encontraron órdenes registradas. Haz clic en <strong>"+ Nueva Orden Manual"</strong>.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id || order.numero_orden}>
                    <td>
                      <strong style={{ color: 'var(--primary)' }}>{order.numero_orden || 'N/A'}</strong>
                    </td>
                    <td>{order.fecha_emision || 'N/A'}</td>
                    <td>
                      <div><strong>{order.datos_cliente?.razon_social || 'Desconocido'}</strong></div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DNI/RUC: {order.datos_cliente?.dni || order.datos_cliente?.ruc || 'N/A'}</div>
                    </td>
                    <td>
                      <div>{order.datos_vehiculo?.modelo || 'N/A'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>Placa: {order.datos_vehiculo?.placa || 'S/N'}</div>
                    </td>
                    <td>{order.tecnico_responsable || 'ALONSO'}</td>
                    <td>
                      <strong>S/ {(order.resumen_soles?.total_a_pagar || 0).toFixed(2)}</strong>
                    </td>
                    <td>
                      <select
                        value={order.estado || 'EN_PROCESO'}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          if (onUpdateStatus) {
                            onUpdateStatus(order.id, newStatus);
                            if (newStatus === 'COMPLETADO') {
                              setTimeout(() => {
                                if (window.confirm('🏍️ La orden está LISTA. ¿Deseas abrir WhatsApp para avisar al cliente ahora mismo?')) {
                                  sendWhatsApp({ ...order, estado: 'COMPLETADO' });
                                }
                              }, 300);
                            }
                          }
                        }}
                        style={{
                          padding: '0.35rem 0.6rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          border: '1px solid',
                          outline: 'none',
                          backgroundColor: order.estado === 'COMPLETADO' ? 'rgba(16, 185, 129, 0.15)' :
                                           order.estado === 'ENTREGADO' ? 'rgba(59, 130, 246, 0.15)' :
                                           'rgba(245, 158, 11, 0.15)',
                          color: order.estado === 'COMPLETADO' ? '#34d399' :
                                 order.estado === 'ENTREGADO' ? '#60a5fa' :
                                 '#fbbf24',
                          borderColor: order.estado === 'COMPLETADO' ? 'rgba(16, 185, 129, 0.4)' :
                                       order.estado === 'ENTREGADO' ? 'rgba(59, 130, 246, 0.4)' :
                                       'rgba(245, 158, 11, 0.4)'
                        }}
                      >
                        <option value="EN_PROCESO" style={{ background: '#1e293b', color: '#fbbf24' }}>🛠️ EN PROCESO</option>
                        <option value="COMPLETADO" style={{ background: '#1e293b', color: '#34d399' }}>✅ LISTO PARA ENTREGA</option>
                        <option value="ENTREGADO" style={{ background: '#1e293b', color: '#60a5fa' }}>🏍️ ENTREGADO</option>
                      </select>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button className="btn btn-outline" style={{ padding: '0.4rem', background: '#25D366', color: '#fff', borderColor: '#25D366' }} title="Enviar por WhatsApp" onClick={() => sendWhatsApp(order)}>
                          <Send size={15} />
                        </button>
                        <button className="btn btn-outline" style={{ padding: '0.4rem' }} title="Clonar / Duplicar Orden" onClick={() => handleDuplicateOrder(order)}>
                          <Copy size={15} />
                        </button>
                        <button className="btn btn-outline" style={{ padding: '0.4rem' }} title="Editar Orden" onClick={() => onEditOrder(order)}>
                          <Edit3 size={15} />
                        </button>
                        <button className="btn btn-outline" style={{ padding: '0.4rem' }} title="Imprimir / PDF" onClick={() => onPrintOrder(order)}>
                          <Printer size={15} />
                        </button>
                        <button className="btn btn-danger" style={{ padding: '0.4rem' }} title="Eliminar" onClick={() => onDeleteOrder(order.id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
