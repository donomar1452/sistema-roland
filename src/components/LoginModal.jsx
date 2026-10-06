import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, CheckCircle } from 'lucide-react';

export default function LoginModal({ onSuccess, onCancel }) {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pin) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });

      const json = await res.json();
      if (json.success) {
        onSuccess(pin);
      } else {
        setErrorMsg(json.error || 'PIN incorrecto.');
      }
    } catch (err) {
      setErrorMsg('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem'
    }}>
      <div className="card" style={{ maxWidth: '400px', margin: 0, border: '1px solid var(--primary)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ width: '56px', height: '56px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '0.75rem' }}>
            <Lock size={28} />
          </div>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>Acceso de Seguridad Taller</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
            Ingrese el PIN de taller para realizar acciones administrativas.
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--primary)', padding: '0.6rem 0.8rem', borderRadius: '8px', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label>PIN de Acceso</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '38px', textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px', fontWeight: 'bold' }}
                placeholder="••••"
                maxLength="8"
                value={pin}
                onChange={e => setPin(e.target.value)}
                autoFocus
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              PIN por defecto en desarrollo: <strong>1234</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {onCancel && (
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onCancel}>
                Cancelar
              </button>
            )}
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isLoading}>
              {isLoading ? 'Verificando...' : 'Desbloquear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
