import React, { useState, useEffect } from 'react';
import { Settings, Save, Download, Upload, FileSpreadsheet, X, CheckCircle, AlertTriangle, ShieldCheck, Database, Building2 } from 'lucide-react';

export default function SystemConfigModal({ isOpen, onClose, onNotify, onRefreshOrders, onSettingsSaved }) {
  const [activeTab, setActiveTab] = useState('TALLER'); // TALLER, BACKUP
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    nombre_taller: 'ROLAND / ALONSO',
    razon_social: "TECNIMOTOR'S & RECTIFICACIONES ALONSO E.I.R.L.",
    ruc: '20600240677',
    direccion: 'CALLE LIBERTAD N° 491 - MORRO SOLAR',
    distrito: 'JAÉN',
    departamento: 'CAJAMARCA',
    telefono: '980 988 321 - 931 429 334',
    whatsapp: '998843989',
    tecnico_principal: 'ALONSO VARGAS L.',
    terminos_garantia: 'Garantía de servicio técnico: 30 días en mano de obra. Todo repuesto sustituido queda a disposición del cliente.',
    pie_pagina: 'Servicio especializado de inyección electrónica, rectificaciones y venta de repuestos originales.'
  });

  const [restoreFile, setRestoreFile] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      const json = await res.json();
      if (json.success && json.data) {
        setSettings(json.data);
      }
    } catch (err) {
      console.error('Error cargando configuración:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const json = await res.json();
      if (json.success) {
        onNotify('✅ Configuración del taller actualizada exitosamente');
        if (onSettingsSaved) onSettingsSaved(settings);
        onClose();
      } else {
        throw new Error(json.error || 'Error al guardar');
      }
    } catch (err) {
      onNotify('❌ Error guardando configuración: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };


  const handleDownloadBackup = () => {
    window.location.href = '/api/backup/export';
    onNotify('📦 Descargando archivo de respaldo de base de datos...');
  };

  const handleDownloadCSV = () => {
    window.location.href = '/api/export/csv';
    onNotify('📊 Descargando reporte de órdenes para Excel (CSV)...');
  };

  const handleRestoreBackup = async () => {
    if (!restoreFile) {
      alert('Por favor selecciona un archivo JSON de respaldo.');
      return;
    }

    if (!window.confirm('⚠️ ADVERTENCIA: Esta acción restaurará las órdenes e inventario desde el archivo seleccionado. ¿Deseas continuar?')) {
      return;
    }

    try {
      setIsRestoring(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const payload = JSON.parse(e.target.result);
          const res = await fetch('/api/backup/restore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const json = await res.json();
          if (json.success) {
            onNotify(`✅ Respaldo restaurado: ${json.data.ordersImported} órdenes y ${json.data.inventoryImported} repuestos`);
            if (onRefreshOrders) await onRefreshOrders();
            onClose();
          } else {
            throw new Error(json.error || 'Error restaurando datos');
          }
        } catch (err) {
          onNotify('❌ Error procesando el archivo de respaldo: ' + err.message, 'error');
        } finally {
          setIsRestoring(false);
        }
      };
      reader.readAsText(restoreFile);
    } catch (err) {
      onNotify('❌ Error leyendo archivo: ' + err.message, 'error');
      setIsRestoring(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem'
    }}>
      <div className="card" style={{
        maxWidth: '680px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        background: '#111827',
        border: '1.5px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '14px',
        padding: '1.5rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
      }}>
        {/* MODAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem', marginBottom: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Settings size={22} style={{ color: 'var(--accent)' }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff' }}>Gestión Real del Taller</h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Configuración, respaldos de base de datos y reportes contables</div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            style={{ minHeight: '34px', padding: '0.35rem 0.6rem' }}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* TABS SELECTOR */}
        <div className="nav-tabs" style={{ marginBottom: '1.25rem', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <button
            type="button"
            className={`nav-tab ${activeTab === 'TALLER' ? 'active' : ''}`}
            onClick={() => setActiveTab('TALLER')}
          >
            <Building2 size={16} /> Datos del Negocio
          </button>
          <button
            type="button"
            className={`nav-tab ${activeTab === 'BACKUP' ? 'active' : ''}`}
            onClick={() => setActiveTab('BACKUP')}
          >
            <Database size={16} /> Respaldos & Reportes
          </button>
        </div>

        {/* TAB 1: DATOS DEL NEGOCIO */}
        {activeTab === 'TALLER' && (
          <form onSubmit={handleSaveSettings}>
            <div className="form-grid" style={{ marginBottom: '1rem' }}>
              <div className="form-group">
                <label>Nombre Comercial *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={settings.nombre_taller || ''}
                  onChange={e => setSettings({ ...settings, nombre_taller: e.target.value })}
                  placeholder="Ej: ROLAND / ALONSO"
                />
              </div>

              <div className="form-group">
                <label>Razón Social (Legal) *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={settings.razon_social || ''}
                  onChange={e => setSettings({ ...settings, razon_social: e.target.value })}
                  placeholder="Ej: TECNIMOTOR'S ALONSO E.I.R.L."
                />
              </div>

              <div className="form-group">
                <label>RUC del Taller (SUNAT) *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={settings.ruc || ''}
                  onChange={e => setSettings({ ...settings, ruc: e.target.value })}
                  placeholder="Ej: 20600240677"
                />
              </div>

              <div className="form-group">
                <label>Teléfono Principal / WhatsApp</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.whatsapp || ''}
                  onChange={e => setSettings({ ...settings, whatsapp: e.target.value })}
                  placeholder="Ej: 998843989"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Dirección y Ubicación Física *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={settings.direccion || ''}
                  onChange={e => setSettings({ ...settings, direccion: e.target.value })}
                  placeholder="Ej: CALLE LIBERTAD N° 491 - MORRO SOLAR - JAÉN"
                />
              </div>

              <div className="form-group">
                <label>Técnico / Asesor Principal</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.tecnico_principal || ''}
                  onChange={e => setSettings({ ...settings, tecnico_principal: e.target.value })}
                  placeholder="Ej: ALONSO VARGAS L."
                />
              </div>

              <div className="form-group">
                <label>Teléfonos Adicionales</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.telefono || ''}
                  onChange={e => setSettings({ ...settings, telefono: e.target.value })}
                  placeholder="Ej: 980 988 321 - 931 429 334"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Términos de Garantía en Comprobantes Impresos</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={settings.terminos_garantia || ''}
                  onChange={e => setSettings({ ...settings, terminos_garantia: e.target.value })}
                  placeholder="Indique las condiciones de garantía impresas..."
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Save size={16} /> {loading ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: RESPALDOS Y REPORTES */}
        {activeTab === 'BACKUP' && (
          <div>
            {/* DESCARGA DE RESPALDO Y EXCEL */}
            <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid var(--accent)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <ShieldCheck size={20} style={{ color: 'var(--accent)' }} />
                <strong style={{ fontSize: '0.95rem', color: '#fff' }}>Copias de Seguridad y Reportes</strong>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                Descargue regularmente copias de su base de datos para no perder sus órdenes ni su inventario ante fallos de equipo o mantenimiento de servidor.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ borderColor: 'var(--accent)', color: '#fff', justifyContent: 'center' }}
                  onClick={handleDownloadBackup}
                >
                  <Download size={16} style={{ color: 'var(--accent)' }} /> Descargar Respaldo JSON
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ borderColor: 'var(--success)', color: '#fff', justifyContent: 'center' }}
                  onClick={handleDownloadCSV}
                >
                  <FileSpreadsheet size={16} style={{ color: 'var(--success)' }} /> Exportar a Excel (CSV)
                </button>
              </div>
            </div>

            {/* RESTAURAR BASE DE DATOS */}
            <div style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.35)', padding: '1rem', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <AlertTriangle size={20} style={{ color: 'var(--primary)' }} />
                <strong style={{ fontSize: '0.95rem', color: '#fff' }}>Restaurar Base de Datos</strong>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                Si reinstala el sistema o cambia de servidor, seleccione su archivo de respaldo previo (<code>.json</code>) para restaurar todo al instante.
              </p>

              <input
                type="file"
                accept=".json"
                className="form-control"
                style={{ marginBottom: '0.85rem', padding: '0.4rem' }}
                onChange={e => setRestoreFile(e.target.files[0])}
              />

              <button
                type="button"
                className="btn btn-danger"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={!restoreFile || isRestoring}
                onClick={handleRestoreBackup}
              >
                <Upload size={16} /> {isRestoring ? 'Restaurando Datos...' : 'Subir y Restaurar Base de Datos'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
