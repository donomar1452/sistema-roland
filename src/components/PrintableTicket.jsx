import React from 'react';

export default function PrintableTicket({ order, settings }) {
  if (!order) return null;

  const client = order.datos_cliente || {};
  const vehicle = order.datos_vehiculo || {};
  const soles = order.resumen_soles || {};
  const repuestos = order.repuestos_items || [];
  const manoObra = order.mano_obra_items || [];

  const workshopName = settings?.nombre_taller || "ROLAND / ALONSO";
  const legalName = settings?.razon_social || "TECNIMOTOR'S & RECTIFICACIONES ALONSO E.I.R.L.";
  const ruc = settings?.ruc || "20600240677";
  const address = settings?.direccion || "CALLE LIBERTAD N° 491 - MORRO SOLAR - JAÉN";
  const phone = settings?.telefono || "980 988 321 - 931 429 334";
  const whatsapp = settings?.whatsapp || "998843989";
  const warranty = settings?.terminos_garantia || "Garantía de servicio técnico: 30 días en mano de obra. Todo repuesto sustituido queda a disposición del cliente.";

  return (
    <div className="ticket-printable-container">
      <div className="ticket-sheet">
        {/* ENCABEZADO DEL TALLER */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{ fontWeight: '900', fontSize: '13pt', letterSpacing: '0.5px' }}>
            {workshopName}
          </div>
          <div style={{ fontSize: '8pt', fontWeight: 'bold' }}>{legalName}</div>
          <div style={{ fontSize: '7.5pt' }}>R.U.C. {ruc}</div>
          <div style={{ fontSize: '7pt', margin: '2px 0' }}>{address}</div>
          <div style={{ fontSize: '7pt' }}>Telf: {phone} | WhatsApp: {whatsapp}</div>
        </div>

        <div className="ticket-divider" />

        {/* NÚMERO DE ORDEN Y FECHA */}
        <div style={{ textAlign: 'center', margin: '6px 0' }}>
          <div style={{ fontSize: '8pt', fontWeight: 'bold' }}>ORDEN DE SERVICIO TÉCNICO</div>
          <div style={{ fontSize: '14pt', fontWeight: '900', margin: '2px 0' }}>
            {order.numero_orden || 'S/N'}
          </div>
          <div style={{ fontSize: '7pt' }}>
            Ingreso: {order.fecha_emision} {order.hora_emision}
          </div>
          {order.fecha_entrega && (
            <div style={{ fontSize: '7pt' }}>
              Promesa Entrega: {order.fecha_entrega} {order.hora_entrega}
            </div>
          )}
          <div style={{ fontSize: '7pt', fontWeight: 'bold', marginTop: '2px' }}>
            ESTADO: {order.estado === 'COMPLETADO' ? 'LISTO PARA RETIRAR' : (order.estado || 'EN TALLER')}
          </div>
        </div>

        <div className="ticket-divider" />

        {/* DATOS DEL CLIENTE */}
        <div style={{ fontSize: '7.5pt', margin: '4px 0' }}>
          <div><strong>Cliente:</strong> {client.razon_social || 'Desconocido'}</div>
          {client.dni && <div><strong>DNI / RUC:</strong> {client.dni || client.ruc}</div>}
          {client.celular && <div><strong>Celular:</strong> {client.celular}</div>}
        </div>

        <div className="ticket-divider" />

        {/* DATOS DEL VEHÍCULO */}
        <div style={{ fontSize: '7.5pt', margin: '4px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><strong>Vehículo:</strong> {vehicle.modelo || 'S/M'}</span>
            <span style={{ fontSize: '10pt', fontWeight: 'bold', border: '1px solid #000', padding: '1px 5px' }}>
              {vehicle.placa || 'S/P'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
            <span>Color: {vehicle.color || 'N/E'}</span>
            <span>Km: {vehicle.kilometraje || 'S/K'}</span>
            <span>Gas: {vehicle.gasolina || 'N/E'}</span>
          </div>
        </div>

        <div className="ticket-divider" />

        {/* DETALLE DE TRABAJOS Y MANO DE OBRA */}
        <div style={{ fontSize: '7.5pt', margin: '4px 0' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>TRABAJOS SOLICITADOS:</div>
          {manoObra.length === 0 ? (
            <div style={{ fontSize: '7pt', fontStyle: 'italic' }}>Revisión y diagnóstico general</div>
          ) : (
            manoObra.map((mo, i) => (
              <div key={`ticket-mo-${i}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ flex: 1, paddingRight: '4px' }}>• {mo.descripcion}</span>
                <span style={{ fontWeight: 'bold' }}>S/ {(Number(mo.subtotal) || 0).toFixed(2)}</span>
              </div>
            ))
          )}
        </div>

        {/* DETALLE DE REPUESTOS */}
        {repuestos.length > 0 && (
          <div style={{ fontSize: '7.5pt', margin: '4px 0' }}>
            <div style={{ fontWeight: 'bold', margin: '3px 0' }}>REPUESTOS UTILIZADOS:</div>
            {repuestos.map((rep, i) => (
              <div key={`ticket-rep-${i}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ flex: 1, paddingRight: '4px' }}>
                  {rep.cantidad}x {rep.descripcion}
                </span>
                <span style={{ fontWeight: 'bold' }}>S/ {(Number(rep.subtotal) || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* OBSERVACIONES DE INGRESO */}
        {order.observaciones && (
          <div style={{ fontSize: '7pt', fontStyle: 'italic', margin: '4px 0', background: '#f1f5f9', padding: '3px' }}>
            <strong>Obs:</strong> {order.observaciones}
          </div>
        )}

        <div className="ticket-divider" />

        {/* RESUMEN DE TOTALES */}
        <div style={{ fontSize: '8pt', margin: '6px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Mano de Obra:</span>
            <span>S/ {(soles.subtotal_mo || 0).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Repuestos:</span>
            <span>S/ {(soles.subtotal_repuestos || 0).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '2px' }}>
            <span>Total Venta:</span>
            <span>S/ {(soles.valor_venta_total || soles.total_a_pagar || 0).toFixed(2)}</span>
          </div>
          {(soles.adelantos || 0) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000' }}>
              <span>Adelanto a Cuenta:</span>
              <span>- S/ {(soles.adelantos || 0).toFixed(2)}</span>
            </div>
          )}
          <div className="ticket-divider" style={{ margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11pt', fontWeight: '900' }}>
            <span>SALDO A PAGAR:</span>
            <span>S/ {(soles.total_a_pagar || 0).toFixed(2)}</span>
          </div>
          <div style={{ fontSize: '7pt', textAlign: 'right', marginTop: '2px' }}>
            Condición: {order.condicion_pago || 'CONTADO'}
          </div>
        </div>

        <div className="ticket-divider" />

        {/* TALÓN DE RETIRO PARA EL CLIENTE */}
        <div style={{ textAlign: 'center', fontSize: '6.5pt', marginTop: '6px', color: '#333' }}>
          <div style={{ fontWeight: 'bold' }}>TALÓN DE RECEPCIÓN Y GARANTÍA</div>
          <div>{warranty}</div>
          <div style={{ margin: '4px 0', borderTop: '1px dashed #000', paddingTop: '4px', fontWeight: 'bold' }}>
            ¡Gracias por confiar en {workshopName}!
          </div>
          <div style={{ fontSize: '6pt' }}>
            Conserve este comprobante para retirar su vehículo.
          </div>
        </div>
      </div>
    </div>
  );
}
