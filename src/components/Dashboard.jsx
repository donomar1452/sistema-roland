import React, { useState } from 'react';
import { Search, Plus, FileText, Printer, Trash2, Edit3, CheckCircle, Clock, DollarSign, Wrench } from 'lucide-react';

export default function Dashboard({ orders, onNewOrder, onScanOrder, onEditOrder, onPrintOrder, onDeleteOrder }) {
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
  const completadas = orders.filter(o => o.estado === 'COMPLETADO' || o.estado === 'ENTREGADO').length;
  const totalSoles = orders.reduce((acc, o) => acc + (o.resumen_soles?.total_a_pagar || 0), 0);

  return (
    <div>
      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon red">
            <FileText size={24} />
          </div>
          <div>
            <div className="metric-value">{totalOrders}</div>
            <div className="metric-label">Total Órdenes</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon amber">
            <Clock size={24} />
          </div>
          <div>
            <div className="metric-value">{enProceso}</div>
            <div className="metric-label">En Trabajo / Taller</div>
          </div>
        </div>

        <div className="metric-card">
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

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn btn-outline" onClick={onScanOrder}>
              <FileText size={18} /> Digitalizar Foto / IA OCR
            </button>
            <button className="btn btn-primary" onClick={onNewOrder}>
              <Plus size={18} /> Nueva Orden Manual
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '38px', width: '100%' }}
              placeholder="Buscar por Placa, Cliente, N° Orden o DNI..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="TODOS">Todos los estados</option>
            <option value="EN_PROCESO">En Proceso</option>
            <option value="COMPLETADO">Completado</option>
            <option value="ENTREGADO">Entregado</option>
          </select>
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
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No se encontraron órdenes registradas. Haz clic en "Digitalizar Foto / IA OCR" o "Nueva Orden Manual".
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id}>
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
                      <span className={`badge ${
                        order.estado === 'COMPLETADO' ? 'badge-ready' :
                        order.estado === 'ENTREGADO' ? 'badge-delivered' : 'badge-process'
                      }`}>
                        {order.estado || 'EN PROCESO'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button className="btn btn-outline" style={{ padding: '0.4rem' }} title="Editar Orden" onClick={() => onEditOrder(order)}>
                          <Edit3 size={16} />
                        </button>
                        <button className="btn btn-outline" style={{ padding: '0.4rem' }} title="Imprimir / PDF" onClick={() => onPrintOrder(order)}>
                          <Printer size={16} />
                        </button>
                        <button className="btn btn-danger" style={{ padding: '0.4rem' }} title="Eliminar" onClick={() => onDeleteOrder(order.id)}>
                          <Trash2 size={16} />
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
