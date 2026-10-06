import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Scan, LayoutDashboard, CheckCircle, AlertCircle } from 'lucide-react';
import Dashboard from './components/Dashboard';
import OrderScanner from './components/OrderScanner';
import OrderEditor from './components/OrderEditor';
import PrintableOrder from './components/PrintableOrder';
import { generateInitialOrderData } from './utils/orderUtils';

export default function App() {
  const [orders, setOrders] = useState([]);
  const [currentView, setCurrentView] = useState('DASHBOARD'); // DASHBOARD, SCANNER, EDITOR, PRINT
  const [activeOrder, setActiveOrder] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchOrders();
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

  const showNotify = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateNew = () => {
    setActiveOrder(generateInitialOrderData());
    setCurrentView('EDITOR');
  };

  const handleEditOrder = (order) => {
    setActiveOrder(order);
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
        showNotify(`Orden ${orderToSave.numero_orden} guardada exitosamente.`);
        await fetchOrders();
        setCurrentView('DASHBOARD');
      } else {
        throw new Error(json.error || 'Error al guardar');
      }
    } catch (err) {
      showNotify(err.message || 'Error guardando orden', 'error');
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
      {/* Top Header */}
      <header className="app-header">
        <div className="brand-logo">
          <Wrench size={32} />
          <div>
            <h1 className="brand-title">SISTEMA ROLAND / ALONSO</h1>
            <div className="brand-subtitle">Gestión y Extracción Inteligente de Órdenes de Servicio</div>
          </div>
        </div>

        <div className="nav-tabs">
          <button
            className={`nav-tab ${currentView === 'DASHBOARD' ? 'active' : ''}`}
            onClick={() => setCurrentView('DASHBOARD')}
          >
            <LayoutDashboard size={18} /> Historial
          </button>
          <button
            className={`nav-tab ${currentView === 'SCANNER' ? 'active' : ''}`}
            onClick={() => setCurrentView('SCANNER')}
          >
            <Scan size={18} /> Escanear Foto / IA
          </button>
          <button
            className="nav-tab btn-primary"
            style={{ color: '#fff' }}
            onClick={handleCreateNew}
          >
            <Plus size={18} /> Nueva Orden
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
          onScanOrder={() => setCurrentView('SCANNER')}
          onEditOrder={handleEditOrder}
          onPrintOrder={handlePrintOrder}
          onDeleteOrder={handleDeleteOrder}
        />
      )}

      {currentView === 'SCANNER' && (
        <OrderScanner
          onExtractionComplete={handleExtractionComplete}
          onCancel={() => setCurrentView('DASHBOARD')}
        />
      )}

      {currentView === 'EDITOR' && (
        <OrderEditor
          initialOrder={activeOrder}
          onSave={handleSaveOrder}
          onCancel={() => setCurrentView('DASHBOARD')}
          onPrint={handlePrintOrder}
        />
      )}

      {currentView === 'PRINT' && (
        <div>
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <button className="btn btn-outline" onClick={() => setCurrentView('DASHBOARD')}>
              Volver al Historial
            </button>
            <button className="btn btn-primary" onClick={() => window.print()}>
              Imprimir Ahora
            </button>
          </div>
          <PrintableOrder order={activeOrder} />
        </div>
      )}
    </div>
  );
}
