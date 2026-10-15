import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Package, LayoutDashboard, CheckCircle, AlertCircle, Scan, Settings, Receipt, FileText } from 'lucide-react';
import Dashboard from './components/Dashboard';
import InventoryView from './components/InventoryView';
import OrderScanner from './components/OrderScanner';
import OrderEditor from './components/OrderEditor';
import PrintableOrder from './components/PrintableOrder';
import PrintableTicket from './components/PrintableTicket';
import SystemConfigModal from './components/SystemConfigModal';
import { generateInitialOrderData } from './utils/orderUtils';

export default function App() {
  const [orders, setOrders] = useState([]);
  const [currentView, setCurrentView] = useState('DASHBOARD'); // DASHBOARD, EDITOR, INVENTARIO, SCANNER, PRINT
  const [editorInitialTab, setEditorInitialTab] = useState('DATOS'); // DATOS or INVENTARIO
  const [activeOrder, setActiveOrder] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [printMode, setPrintMode] = useState('A4'); // 'A4' | 'TICKET'

  useEffect(() => {
    fetchOrders();
    fetchSettings();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success && json.data) {
        setOrders(json.data);
      }
    } catch (err) {
      console.error('Error cargando órdenes:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const json = await res.json();
      if (json.success && json.data) {
        setSettings(json.data);
      }
    } catch (err) {
      console.error('Error cargando configuración:', err);
    }
  };


  const showNotify = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. Botón NUEVA ORDEN: abre directamente Datos del Cliente, Datos de la Moto y Trabajos Solicitados
  const handleCreateNew = () => {
    const newOrd = generateInitialOrderData();
    setActiveOrder(newOrd);
    setEditorInitialTab('DATOS');
    setCurrentView('EDITOR');
  };

  // 2. Botón INVENTARIO: abre el módulo de inventario de moto y repuestos
  const handleOpenInventory = () => {
    if (!activeOrder && orders.length > 0) {
      setActiveOrder(orders[0]);
    }
    setCurrentView('INVENTARIO');
  };

  const handleEditOrder = (order) => {
    setActiveOrder(order);
    setEditorInitialTab('DATOS');
    setCurrentView('EDITOR');
  };

  const handlePrintOrder = (order) => {
    setActiveOrder(order);
    setCurrentView('PRINT');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleExtractionComplete = (extractedData) => {
    setActiveOrder(extractedData);
    setEditorInitialTab('DATOS');
    setCurrentView('EDITOR');
    showNotify('¡Datos extraídos con éxito desde la fotografía por la IA!');
  };

  const handleSaveOrder = async (orderToSave) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderToSave)
      });
      const json = await res.json();
      if (json.success) {
        showNotify(`Orden ${orderToSave.numero_orden} guardada exitosamente en la base de datos.`);
        await fetchOrders();
        setCurrentView('DASHBOARD');
      } else {
        throw new Error(json.error || 'Error al guardar');
      }
    } catch (err) {
      showNotify(err.message || 'Error guardando orden', 'error');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus })
      });
      const json = await res.json();
      if (json.success) {
        showNotify(`Estado actualizado a: ${newStatus === 'COMPLETADO' ? 'LISTO' : newStatus}`);
        await fetchOrders();
      } else {
        throw new Error(json.error || 'Error al actualizar estado');
      }
    } catch (err) {
      showNotify(err.message || 'Error actualizando estado', 'error');
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta orden de servicio?')) return;

    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showNotify('Orden eliminada correctamente.');
        await fetchOrders();
      }
    } catch (err) {
      showNotify('Error eliminando la orden', 'error');
    }
  };

  return (
    <div className="app-container">
      {/* Top Header Simplificado y Automatizado con SOLO 2 BOTONES PRINCIPALES */}
      <header className="app-header">
        <div className="brand-logo" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('DASHBOARD')}>
          <Wrench size={32} />
          <div>
            <h1 className="brand-title">{settings?.nombre_taller || 'SISTEMA ROLAND / ALONSO'}</h1>
            <div className="brand-subtitle">Gestión de Taller de Motos & Órdenes de Servicio</div>
          </div>
        </div>

        {/* LOS BOTONES PRINCIPALES: INVENTARIO, NUEVA ORDEN, HISTORIAL Y CONFIGURACIÓN */}
        <div className="app-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            className="btn"
            style={{
              fontSize: '0.925rem',
              fontWeight: '600',
              minHeight: '42px',
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              background: currentView === 'INVENTARIO' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.1)',
              border: '1.5px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              cursor: 'pointer'
            }}
            onClick={handleOpenInventory}
          >
            <Package size={19} style={{ color: '#34d399' }} /> Inventario Repuestos
          </button>

          <button
            className="btn btn-primary"
            style={{
              fontSize: '0.925rem',
              fontWeight: '600',
              minHeight: '42px',
              padding: '0.55rem 1.35rem',
              borderRadius: '8px',
              background: 'var(--primary)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.25)',
              boxShadow: '0 2px 10px rgba(239, 68, 68, 0.35)',
              cursor: 'pointer'
            }}
            onClick={handleCreateNew}
          >
            <Plus size={20} /> Nueva Orden
          </button>

          {/* Acceso secundario al Historial */}
          <button
            className="btn btn-outline"
            style={{
              minHeight: '42px',
              padding: '0.55rem 1.1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              borderRadius: '8px',
              borderColor: currentView === 'DASHBOARD' ? 'rgba(255,255,255,0.25)' : 'var(--border-color)',
              background: currentView === 'DASHBOARD' ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: '#cbd5e1'
            }}
            onClick={() => setCurrentView('DASHBOARD')}
            title="Ver Historial de Órdenes Guardadas"
          >
            <LayoutDashboard size={17} /> Historial ({orders.length})
          </button>

          {/* Botón de Configuración del Negocio y Respaldos */}
          <button
            className="btn btn-outline"
            style={{
              minHeight: '42px',
              padding: '0.55rem 0.9rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              borderRadius: '8px',
              borderColor: isConfigOpen ? 'var(--accent)' : 'var(--border-color)',
              background: isConfigOpen ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: '#94a3b8'
            }}
            onClick={() => setIsConfigOpen(true)}
            title="Configuración de Taller, Respaldos de Base de Datos y Excel"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          background: notification.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
          color: '#fff',
          padding: '0.9rem 1.4rem',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          fontWeight: '600'
        }}>
          {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          {notification.msg}
        </div>
      )}

      {/* View Switcher */}
      {currentView === 'DASHBOARD' && (
        <Dashboard
          orders={orders}
          onNewOrder={handleCreateNew}
          onOpenInventory={handleOpenInventory}
          onScanOrder={() => setCurrentView('SCANNER')}
          onEditOrder={handleEditOrder}
          onPrintOrder={handlePrintOrder}
          onDeleteOrder={handleDeleteOrder}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {currentView === 'INVENTARIO' && (
        <InventoryView
          activeOrder={activeOrder}
          onUpdateActiveOrder={setActiveOrder}
          onNewOrder={handleCreateNew}
          onBack={() => setCurrentView('DASHBOARD')}
        />
      )}

      {currentView === 'EDITOR' && (
        <OrderEditor
          initialOrder={activeOrder}
          initialTab={editorInitialTab}
          onSave={handleSaveOrder}
          onCancel={() => setCurrentView('DASHBOARD')}
          onPrint={handlePrintOrder}
          existingOrders={orders}
        />
      )}

      {currentView === 'SCANNER' && (
        <OrderScanner
          onExtractionComplete={handleExtractionComplete}
          onCancel={() => setCurrentView('DASHBOARD')}
        />
      )}

      {currentView === 'PRINT' && (
        <div>
          <div className="no-print" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            background: '#1e293b',
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.1)',
            flexWrap: 'wrap',
            gap: '0.8rem'
          }}>
            <button className="btn btn-outline" onClick={() => setCurrentView('DASHBOARD')}>
              ← Volver al Historial
            </button>

            {/* Selector de formato: Hoja A4 vs Ticket Térmico */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>Formato:</span>
              <button
                type="button"
                className={`btn ${printMode === 'A4' ? 'btn-primary' : 'btn-outline'}`}
                style={{ minHeight: '36px', padding: '0.4rem 0.9rem', fontSize: '0.85rem', fontWeight: '600' }}
                onClick={() => setPrintMode('A4')}
              >
                <FileText size={16} /> Hoja Oficial A4 (2 Págs)
              </button>
              <button
                type="button"
                className={`btn ${printMode === 'TICKET' ? 'btn-primary' : 'btn-outline'}`}
                style={{ minHeight: '36px', padding: '0.4rem 0.9rem', fontSize: '0.85rem', fontWeight: '600' }}
                onClick={() => setPrintMode('TICKET')}
              >
                <Receipt size={16} /> Ticket Térmico 80mm / 58mm
              </button>
            </div>

            <button className="btn btn-primary" onClick={() => window.print()} style={{ minHeight: '38px', padding: '0.45rem 1.35rem' }}>
              🖨️ Imprimir Ahora
            </button>
          </div>

          {printMode === 'A4' ? (
            <PrintableOrder order={activeOrder} settings={settings} />
          ) : (
            <PrintableTicket order={activeOrder} settings={settings} />
          )}
        </div>
      )}

      {/* Modal de Configuración, Respaldos y Exportación */}
      <SystemConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onNotify={showNotify}
        onRefreshOrders={fetchOrders}
        onSettingsSaved={(newSettings) => setSettings(newSettings)}
      />
    </div>
  );
}

