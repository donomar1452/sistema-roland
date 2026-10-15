import React, { useState, useEffect } from 'react';
import { Package, CheckSquare, Search, Plus, Trash2, ArrowLeft, CheckCircle2, XCircle, Wrench, ShieldCheck, Edit3, DollarSign, Bike, Save, RefreshCw } from 'lucide-react';
import { DEFAULT_PARTS_INVENTORY, INVENTORY_CATEGORIES, getStoredParts, saveStoredParts } from '../utils/inventoryData';

export default function InventoryView({ activeOrder, onUpdateActiveOrder, onNewOrder, onBack }) {
  const [subTab, setSubTab] = useState('CHECKLIST'); // CHECKLIST, REPUESTOS
  const [parts, setParts] = useState(getStoredParts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('TODAS');
  
  // Custom accessories for the motorcycle checklist
  const [customAccessories, setCustomAccessories] = useState(() => {
    return activeOrder?.inventario_vehiculo?.custom_items || [
      { id: 'c1', nombre: 'Alarma / GPS', estado: true },
      { id: 'c2', nombre: 'Defensas / Sliders', estado: true },
      { id: 'c3', nombre: 'Soporte de Celular', estado: false }
    ];
  });
  const [newAccessoryName, setNewAccessoryName] = useState('');
  const [showAddAccessory, setShowAddAccessory] = useState(false);

  // Bike inventory state
  const [bikeInv, setBikeInv] = useState(() => {
    return activeOrder?.inventario_vehiculo || {
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
    };
  });

  // Modals for editing and adding parts
  const [newPartModal, setNewPartModal] = useState(false);
  const [newPart, setNewPart] = useState({ codigo: '', descripcion: '', categoria: 'Lubricantes', precio: '', stock: '' });
  const [editingPart, setEditingPart] = useState(null); // when editing an existing part

  // Load from API on mount
  useEffect(() => {
    fetch('/api/inventory')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setParts(json.data);
          saveStoredParts(json.data);
        }
      })
      .catch(err => console.error('Error fetching inventory from API:', err));
  }, []);

  // Sync parts with localStorage
  useEffect(() => {
    saveStoredParts(parts);
  }, [parts]);

  // Bulk Checklist actions
  const toggleAllChecklist = (status) => {
    const updated = { ...bikeInv };
    Object.keys(updated).forEach(k => {
      if (k !== 'otros' && k !== 'custom_items' && typeof updated[k] === 'boolean') {
        updated[k] = status;
      }
    });
    const updatedCustom = customAccessories.map(c => ({ ...c, estado: status }));
    setCustomAccessories(updatedCustom);
    updated.custom_items = updatedCustom;
    setBikeInv(updated);

    if (onUpdateActiveOrder && activeOrder) {
      onUpdateActiveOrder({ ...activeOrder, inventario_vehiculo: updated });
    }
  };

  const handleChecklistChange = (key, value) => {
    const updated = { ...bikeInv, [key]: value, custom_items: customAccessories };
    setBikeInv(updated);
    if (onUpdateActiveOrder && activeOrder) {
      onUpdateActiveOrder({ ...activeOrder, inventario_vehiculo: updated });
    }
  };

  // Custom accessory handlers
  const handleAddCustomAccessory = (e) => {
    e.preventDefault();
    if (!newAccessoryName.trim()) return;

    const newItem = {
      id: 'c_' + Date.now(),
      nombre: newAccessoryName.trim(),
      estado: true
    };
    const updated = [...customAccessories, newItem];
    setCustomAccessories(updated);
    setNewAccessoryName('');
    setShowAddAccessory(false);

    const updatedInv = { ...bikeInv, custom_items: updated };
    setBikeInv(updatedInv);
    if (onUpdateActiveOrder && activeOrder) {
      onUpdateActiveOrder({ ...activeOrder, inventario_vehiculo: updatedInv });
    }
  };

  const handleToggleCustomAccessory = (id) => {
    const updated = customAccessories.map(c => c.id === id ? { ...c, estado: !c.estado } : c);
    setCustomAccessories(updated);
    const updatedInv = { ...bikeInv, custom_items: updated };
    setBikeInv(updatedInv);
    if (onUpdateActiveOrder && activeOrder) {
      onUpdateActiveOrder({ ...activeOrder, inventario_vehiculo: updatedInv });
    }
  };

  const handleDeleteCustomAccessory = (id) => {
    const updated = customAccessories.filter(c => c.id !== id);
    setCustomAccessories(updated);
    const updatedInv = { ...bikeInv, custom_items: updated };
    setBikeInv(updatedInv);
    if (onUpdateActiveOrder && activeOrder) {
      onUpdateActiveOrder({ ...activeOrder, inventario_vehiculo: updatedInv });
    }
  };

  // Stock modification and API sync
  const handleStockChange = async (id, delta) => {
    let targetPart = null;
    const updatedList = parts.map(p => {
      if (p.id === id) {
        const nextStock = Math.max(0, (Number(p.stock) || 0) + delta);
        targetPart = { ...p, stock: nextStock };
        return targetPart;
      }
      return p;
    });

    setParts(updatedList);
    if (targetPart) {
      try {
        await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(targetPart)
        });
      } catch (err) {
        console.error('Error actualizando stock:', err);
      }
    }
  };

  // Inline stock input change
  const handleDirectStockChange = async (id, newStockVal) => {
    const stockNum = Math.max(0, Number(newStockVal) || 0);
    let targetPart = null;
    const updatedList = parts.map(p => {
      if (p.id === id) {
        targetPart = { ...p, stock: stockNum };
        return targetPart;
      }
      return p;
    });
    setParts(updatedList);
    if (targetPart) {
      try {
        await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(targetPart)
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Add new part to database
  const handleAddNewPart = async (e) => {
    e.preventDefault();
    if (!newPart.descripcion || !newPart.precio) {
      alert('Por favor ingrese al menos la descripción y el precio del repuesto.');
      return;
    }

    const created = {
      id: 'p_' + Date.now(),
      codigo: newPart.codigo.trim() || `REP-${Math.floor(100 + Math.random() * 900)}`,
      descripcion: newPart.descripcion.trim(),
      categoria: newPart.categoria,
      precio: Number(newPart.precio) || 0,
      stock: Number(newPart.stock) || 1
    };

    setParts(prev => [created, ...prev]);
    setNewPart({ codigo: '', descripcion: '', categoria: 'Lubricantes', precio: '', stock: '' });
    setNewPartModal(false);

    try {
      await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      });
    } catch (err) {
      console.error('Error guardando en API:', err);
    }
  };

  // Save edited part
  const handleSaveEditedPart = async (e) => {
    e.preventDefault();
    if (!editingPart || !editingPart.descripcion) return;

    const updated = {
      ...editingPart,
      precio: Number(editingPart.precio) || 0,
      stock: Number(editingPart.stock) || 0
    };

    setParts(prev => prev.map(p => p.id === updated.id ? updated : p));
    setEditingPart(null);

    try {
      await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (err) {
      console.error('Error actualizando en API:', err);
    }
  };

  // Delete part from database
  const handleDeletePart = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este producto del inventario?')) {
      setParts(prev => prev.filter(p => p.id !== id));
      try {
        await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Error eliminando en API:', err);
      }
    }
  };

  const handleAddPartToActiveOrder = (part) => {
    if (!activeOrder || !onUpdateActiveOrder) {
      alert('Para agregar repuestos directamente a una orden, cree o abra una "Nueva Orden" primero.');
      return;
    }
    const currentItems = [...(activeOrder.repuestos_items || [])];
    currentItems.push({
      item: currentItems.length + 1,
      num_parte: part.codigo,
      descripcion: part.descripcion,
      precio_unitario: part.precio,
      cantidad: 1,
      subtotal: part.precio
    });
    onUpdateActiveOrder({ ...activeOrder, repuestos_items: currentItems });
    alert(`✅ Repuesto agregado a la Orden ${activeOrder.numero_orden || ''}: ${part.descripcion}`);
  };

  // Filter parts
  const categories = ['TODAS', ...Array.from(new Set(parts.map(p => p.categoria || 'Varios')))];
  const filteredParts = parts.filter(p => {
    const matchesSearch = p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'TODAS' || p.categoria === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalStockItems = parts.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const totalValue = parts.reduce((acc, p) => acc + ((Number(p.stock) || 0) * (Number(p.precio) || 0)), 0);

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Top Header Card */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={onBack}>
            <ArrowLeft size={18} /> Volver
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={22} style={{ color: 'var(--accent)' }} /> Inventario Editable
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {activeOrder ? `Asociado a Orden: ${activeOrder.numero_orden} (${activeOrder.datos_vehiculo?.modelo || 'Moto'})` : 'Edición y Control de Repuestos & Checklist de Motos'}
            </span>
          </div>
        </div>

        {/* 2 Primary Views Switcher */}
        <div className="nav-tabs">
          <button
            className={`nav-tab ${subTab === 'CHECKLIST' ? 'active' : ''}`}
            onClick={() => setSubTab('CHECKLIST')}
          >
            <CheckSquare size={16} /> Checklist Moto ({Object.values(bikeInv).filter(v => v === true).length + customAccessories.filter(c => c.estado).length} OK)
          </button>
          <button
            className={`nav-tab ${subTab === 'REPUESTOS' ? 'active' : ''}`}
            onClick={() => setSubTab('REPUESTOS')}
          >
            <Package size={16} /> Stock de Repuestos ({parts.length})
          </button>
        </div>

        <button className="btn btn-primary" onClick={onNewOrder}>
          <Plus size={18} /> + Ir a Nueva Orden
        </button>
      </div>

      {/* ============================================================== */}
      {/* SUBTAB 1: CHECKLIST DE LA MOTO EDITABLE                        */}
      {/* ============================================================== */}
      {subTab === 'CHECKLIST' && (
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="card-title">
                <Bike size={22} style={{ color: 'var(--primary)' }} />
                Checklist e Inventario de Recepción de la Motocicleta (Editable)
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Marca, desmarca o añade nuevos accesorios personalizados a la recepción de la moto
              </span>
            </div>

            {/* Automatización rápida */}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                className="btn"
                style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid var(--success)', color: '#fff', fontWeight: 'bold' }}
                onClick={() => toggleAllChecklist(true)}
              >
                <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                ⚡ Marcar TODO OK
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ borderColor: 'var(--danger)', color: '#f87171' }}
                onClick={() => toggleAllChecklist(false)}
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
                <Plus size={16} style={{ color: 'var(--accent)' }} />
                + Agregar Accesorio
              </button>
            </div>
          </div>

          {/* Formulario rápido para agregar accesorio personalizado */}
          {showAddAccessory && (
            <form onSubmit={handleAddCustomAccessory} style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--accent)', padding: '0.85rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <strong style={{ fontSize: '0.85rem', color: '#fff' }}>Nuevo Accesorio / Pieza:</strong>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
            {INVENTORY_CATEGORIES.map((cat, catIdx) => (
              <div
                key={`cat-${catIdx}`}
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
                    const isChecked = !!bikeInv[key];
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
                          onChange={e => handleChecklistChange(key, e.target.checked)}
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

              {customAccessories.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem' }}>
                  No hay accesorios adicionales. Haz clic en "+ Agregar" para añadir uno.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {customAccessories.map(item => (
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

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.9rem', fontWeight: 'bold' }}>
              <ShieldCheck size={20} />
              Total piezas OK: {Object.values(bikeInv).filter(v => v === true).length + customAccessories.filter(c => c.estado).length} componentes verificados
            </div>

            <button
              className="btn btn-primary"
              style={{ padding: '0.7rem 1.8rem' }}
              onClick={onNewOrder}
            >
              Continuar a Datos de la Orden (Cliente y Moto) ➔
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 2: STOCK Y CATÁLOGO DE REPUESTOS TOTALMENTE EDITABLE    */}
      {/* ============================================================== */}
      {subTab === 'REPUESTOS' && (
        <div className="card">
          {/* Metrics summary */}
          <div className="metrics-grid" style={{ marginBottom: '1rem' }}>
            <div className="metric-card">
              <div className="metric-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent)' }}>
                <Package size={22} />
              </div>
              <div>
                <div className="metric-value">{parts.length}</div>
                <div className="metric-label">Productos en Inventario</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon green">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <div className="metric-value">{totalStockItems}</div>
                <div className="metric-label">Unidades en Almacén</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">
                <DollarSign size={22} />
              </div>
              <div>
                <div className="metric-value">S/ {totalValue.toFixed(2)}</div>
                <div className="metric-label">Valor Total del Stock</div>
              </div>
            </div>
          </div>

          <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div className="card-title">
                <Wrench size={20} style={{ color: 'var(--primary)' }} />
                Inventario de Repuestos, Lubricantes y Precios (Editable)
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Edita precios, cantidades, códigos o agrega nuevos repuestos directamente
              </span>
            </div>

            <button className="btn btn-primary" onClick={() => setNewPartModal(true)}>
              <Plus size={16} /> + Agregar Nuevo Repuesto al Inventario
            </button>
          </div>

          {/* Search and Category Filter */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 180px', minWidth: '150px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '38px' }}
                placeholder="Buscar repuesto por nombre o código..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="form-control"
              style={{ flex: '0 1 180px', minWidth: '140px' }}
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Products Table with Direct Editable Stock and Edit Modal */}
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '110px' }}>Código</th>
                  <th>Descripción del Repuesto</th>
                  <th style={{ width: '120px' }}>Categoría</th>
                  <th style={{ width: '120px' }}>Precio Venta</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>Stock Editable</th>
                  <th style={{ width: '170px', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredParts.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No se encontraron repuestos con los criterios de búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredParts.map(part => (
                    <tr key={part.id}>
                      <td>
                        <strong style={{ color: 'var(--accent)', fontSize: '0.82rem' }}>{part.codigo}</strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{part.descripcion}</div>
                      </td>
                      <td>
                        <span className="badge badge-process" style={{ fontSize: '0.7rem' }}>
                          {part.categoria}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--success)' }}>S/ {(Number(part.precio) || 0).toFixed(2)}</strong>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '0.2rem 0.45rem', fontSize: '0.85rem' }}
                            onClick={() => handleStockChange(part.id, -1)}
                            title="Restar 1"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            style={{
                              width: '55px',
                              textAlign: 'center',
                              padding: '0.2rem',
                              fontWeight: 'bold',
                              borderRadius: '6px',
                              background: part.stock > 5 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: part.stock > 5 ? 'var(--success)' : '#f87171',
                              border: '1px solid var(--border-color)'
                            }}
                            value={part.stock ?? 0}
                            onChange={e => handleDirectStockChange(part.id, e.target.value)}
                            title="Escribe directamente el número de stock"
                          />
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '0.2rem 0.45rem', fontSize: '0.85rem' }}
                            onClick={() => handleStockChange(part.id, 1)}
                            title="Sumar 1"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          {activeOrder && (
                            <button
                              className="btn btn-primary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                              onClick={() => handleAddPartToActiveOrder(part)}
                              title="Añadir a la orden activa"
                            >
                              + Añadir
                            </button>
                          )}
                          <button
                            className="btn btn-outline"
                            style={{ padding: '0.35rem 0.55rem', color: 'var(--accent)', borderColor: 'var(--accent)' }}
                            onClick={() => setEditingPart({ ...part })}
                            title="Editar todos los datos de este producto"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '0.35rem 0.5rem' }}
                            onClick={() => handleDeletePart(part.id)}
                            title="Eliminar producto"
                          >
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
      )}

      {/* MODAL 1: EDITAR REPUESTO EXISTENTE */}
      {editingPart && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', margin: 0, background: '#1e293b', border: '1px solid var(--accent)' }}>
            <div className="card-header">
              <div className="card-title">
                <Edit3 size={20} style={{ color: 'var(--accent)' }} /> Editar Repuesto: {editingPart.codigo}
              </div>
              <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem' }} onClick={() => setEditingPart(null)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedPart}>
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label>Descripción del Repuesto / Producto *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={editingPart.descripcion || ''}
                  onChange={e => setEditingPart({ ...editingPart, descripcion: e.target.value })}
                />
              </div>

              <div className="form-grid" style={{ marginBottom: '0.85rem' }}>
                <div className="form-group">
                  <label>Código / N° Parte</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingPart.codigo || ''}
                    onChange={e => setEditingPart({ ...editingPart, codigo: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    className="form-control"
                    value={editingPart.categoria || 'Lubricantes'}
                    onChange={e => setEditingPart({ ...editingPart, categoria: e.target.value })}
                  >
                    <option value="Lubricantes">Lubricantes</option>
                    <option value="Frenos">Frenos</option>
                    <option value="Filtros">Filtros</option>
                    <option value="Motor">Motor</option>
                    <option value="Transmisión">Transmisión</option>
                    <option value="Eléctrico">Eléctrico</option>
                    <option value="Neumáticos">Neumáticos</option>
                    <option value="Fluidos">Fluidos</option>
                    <option value="Mandos">Mandos</option>
                    <option value="Varios">Varios</option>
                  </select>
                </div>
              </div>

              <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label>Precio de Venta (S/) *</label>
                  <input
                    type="number"
                    step="0.50"
                    required
                    className="form-control"
                    style={{ fontWeight: 'bold', color: 'var(--success)' }}
                    value={editingPart.precio ?? ''}
                    onChange={e => setEditingPart({ ...editingPart, precio: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Stock Disponible</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    style={{ fontWeight: 'bold' }}
                    value={editingPart.stock ?? 0}
                    onChange={e => setEditingPart({ ...editingPart, stock: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditingPart(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: AGREGAR NUEVO REPUESTO */}
      {newPartModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', margin: 0, background: '#1e293b' }}>
            <div className="card-header">
              <div className="card-title">
                <Plus size={20} style={{ color: 'var(--primary)' }} /> Nuevo Repuesto al Inventario
              </div>
              <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem' }} onClick={() => setNewPartModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewPart}>
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label>Descripción del Repuesto / Producto *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="Ej: Aceite Honda 4T 10W30"
                  value={newPart.descripcion}
                  onChange={e => setNewPart({ ...newPart, descripcion: e.target.value })}
                />
              </div>

              <div className="form-grid" style={{ marginBottom: '0.85rem' }}>
                <div className="form-group">
                  <label>Código / N° Parte</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej: HON-10W30"
                    value={newPart.codigo}
                    onChange={e => setNewPart({ ...newPart, codigo: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    className="form-control"
                    value={newPart.categoria}
                    onChange={e => setNewPart({ ...newPart, categoria: e.target.value })}
                  >
                    <option value="Lubricantes">Lubricantes</option>
                    <option value="Frenos">Frenos</option>
                    <option value="Filtros">Filtros</option>
                    <option value="Motor">Motor</option>
                    <option value="Transmisión">Transmisión</option>
                    <option value="Eléctrico">Eléctrico</option>
                    <option value="Neumáticos">Neumáticos</option>
                    <option value="Fluidos">Fluidos</option>
                    <option value="Mandos">Mandos</option>
                    <option value="Varios">Varios</option>
                  </select>
                </div>
              </div>

              <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label>Precio de Venta (S/) *</label>
                  <input
                    type="number"
                    step="0.50"
                    required
                    className="form-control"
                    placeholder="35.00"
                    value={newPart.precio}
                    onChange={e => setNewPart({ ...newPart, precio: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Stock Inicial</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="10"
                    value={newPart.stock}
                    onChange={e => setNewPart({ ...newPart, stock: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setNewPartModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar Repuesto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
