import React, { useState } from 'react';
import { UploadCloud, FileImage, Sparkles, AlertCircle, ArrowRight, Loader } from 'lucide-react';

export default function OrderScanner({ onExtractionComplete, onCancel }) {
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleFileChange = (e, side) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (side === 'front') {
        setFrontImage(file);
        setFrontPreview(reader.result);
      } else {
        setBackImage(file);
        setBackPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProcessImages = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      if (frontImage) formData.append('images', frontImage);
      if (backImage) formData.append('images', backImage);

      const res = await fetch('/api/extract', {
        method: 'POST',
        body: formData
      });

      const json = await res.json();

      if (json.success && json.data) {
        onExtractionComplete(json.data);
      } else {
        throw new Error(json.error || 'No se pudo procesar la imagen.');
      }
    } catch (err) {
      console.error('Error procesando imagen:', err);
      setErrorMsg(err.message || 'Error al conectar con el servidor de análisis.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseDemoTemplate = () => {
    setIsProcessing(true);
    fetch('/api/extract', { method: 'POST' })
      .then(res => res.json())
      .then(json => {
        onExtractionComplete(json.data);
      })
      .finally(() => setIsProcessing(false));
  };

  return (
    <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="card-header">
        <div className="card-title">
          <Sparkles size={22} style={{ color: 'var(--primary)' }} /> Escáner de Orden de Servicio por IA / Fotos
        </div>
        <button className="btn btn-outline" onClick={onCancel}>Cancelar</button>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Sube la fotografía o imagen escaneada del <strong>Frente (Página 1)</strong> y/o <strong>Reverso (Página 2)</strong> de la ficha física de Tecnimotor's Alonso. La IA extraerá los datos automáticamente.
      </p>

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--primary)', padding: '0.75rem 1rem', borderRadius: '10px', color: '#f87171', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      {/* Upload Boxes Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* FRONT IMAGE */}
        <div>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#fff' }}>1. Frente de la Ficha (Hoja 1)</h4>
          <label className={`dropzone ${frontPreview ? 'active' : ''}`} style={{ height: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileChange(e, 'front')} />
            {frontPreview ? (
              <img src={frontPreview} alt="Frente" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <>
                <FileImage size={40} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Haga clic o arrastre el FRENTE</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Datos Cliente, Vehículo, Inventario y Totales</div>
              </>
            )}
          </label>
        </div>

        {/* BACK IMAGE */}
        <div>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#fff' }}>2. Reverso de la Ficha (Hoja 2)</h4>
          <label className={`dropzone ${backPreview ? 'active' : ''}`} style={{ height: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileChange(e, 'back')} />
            {backPreview ? (
              <img src={backPreview} alt="Reverso" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <>
                <FileImage size={40} style={{ color: 'var(--accent)', marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Haga clic o arrastre el REVERSO</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Tablas de Repuestos, Terceros y Mano de Obra</div>
              </>
            )}
          </label>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
        <button className="btn btn-outline" onClick={handleUseDemoTemplate}>
          Cargar Datos de Demostración
        </button>

        <button
          className="btn btn-primary"
          style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
          disabled={(!frontImage && !backImage) || isProcessing}
          onClick={handleProcessImages}
        >
          {isProcessing ? (
            <>
              <Loader className="spin" size={20} /> Extrayendo con IA...
            </>
          ) : (
            <>
              Extraer Datos e Ir al Editor <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
