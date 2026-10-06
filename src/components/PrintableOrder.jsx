import React from 'react';

export default function PrintableOrder({ order }) {
  if (!order) return null;

  const client = order.datos_cliente || {};
  const vehicle = order.datos_vehiculo || {};
  const serviceType = order.tipo_servicio || {};
  const jobs = order.trabajos_especificos || {};
  const soles = order.resumen_soles || {};
  const inv = order.inventario_vehiculo || {};
  const billing = order.facturacion || {};
  const signatures = order.firmas || {};

  const repuestos = order.repuestos_items || [];
  const terceros = order.terceros_items || [];
  const manoObra = order.mano_obra_items || [];

  // Helper check icon
  const CheckBox = ({ checked, label }) => (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '7.5pt', marginRight: '6px' }}>
      <span style={{
        display: 'inline-block',
        width: '10px',
        height: '10px',
        border: '1px solid #000',
        textAlign: 'center',
        lineHeight: '9px',
        fontSize: '8px',
        fontWeight: 'bold'
      }}>
        {checked ? 'X' : ''}
      </span>
      <span>{label}</span>
    </div>
  );

  return (
    <div className="printable-container">
      {/* PAGE 1 - FRENTE */}
      <div className="printable-sheet" style={{ border: '1px solid #000' }}>
        {/* HEADER SECTION */}
        <table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: '2px solid #000' }}>
          <tbody>
            <tr>
              <td style={{ width: '25%', padding: '4px', verticalAlign: 'middle', borderRight: '1px solid #000' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#dc2626', fontWeight: '900', fontSize: '13pt', lineHeight: '1.1' }}>
                    Ao<br />ALONSO
                  </div>
                  <div style={{ fontSize: '6.5pt', marginTop: '2px', fontWeight: 'bold' }}>HONDA</div>
                </div>
              </td>
              <td style={{ width: '45%', padding: '4px', textAlign: 'center', borderRight: '1px solid #000' }}>
                <div style={{ fontWeight: 'bold', fontSize: '9pt' }}>TECNIMOTOR'S & RECTIFICACIONES ALONSO E.I.R.L.</div>
                <div style={{ fontSize: '7.5pt', fontWeight: 'bold', color: '#b91c1c' }}>
                  SERVICIO DE INYECCIÓN ELECTRÓNICA Y ESCANEO
                </div>
                <div style={{ fontSize: '6pt' }}>
                  MANTENIMIENTO Y REPARACIÓN DE MOTOCICLETAS, MOTOKAR Y PRODUCTOS DE FUERZA<br />
                  SERVICIO DE TORNO Y RECTIFICACIONES.VENTA DE REPUESTOS ORIGINALE<br />
                  CALLE LIBERTAD N° 491 - MORRO SOLAR - JAEN - CAJAMARCA<br />
                  ☎ 980 988 321 - 931 429 334 &nbsp;|&nbsp; 💬 998 843 989
                </div>
              </td>
              <td style={{ width: '30%', padding: '4px', verticalAlign: 'top' }}>
                <div style={{ fontWeight: 'bold', fontSize: '10pt', borderBottom: '1px solid #000', paddingBottom: '2px' }}>
                  ORDEN DE SERVICIO N° <span style={{ color: '#dc2626' }}>{order.numero_orden || '________'}</span>
                </div>
                <div style={{ fontSize: '6.5pt', marginTop: '3px' }}>
                  CONDICIONES DE PAGO:&nbsp;
                  CONTADO <span style={{ border: '1px solid #000', padding: '0 3px' }}>{order.condicion_pago === 'CONTADO' ? 'X' : ' '}</span>&nbsp;
                  CRÉDITO <span style={{ border: '1px solid #000', padding: '0 3px' }}>{order.condicion_pago === 'CRÉDITO' ? 'X' : ' '}</span>&nbsp;
                  HDP <span style={{ border: '1px solid #000', padding: '0 3px' }}>{order.condicion_pago === 'HDP' ? 'X' : ' '}</span>
                </div>
                <div style={{ fontSize: '6.5pt', marginTop: '3px' }}>
                  FECHA Y HORA DE EMISIÓN: {order.fecha_emision} {order.hora_emision}
                </div>
                <div style={{ fontSize: '6.5pt', marginTop: '2px' }}>
                  FECHA Y HORA DE ENTREGA: {order.fecha_entrega} {order.hora_entrega}
                </div>
                <div style={{ fontSize: '6.5pt', fontWeight: 'bold', marginTop: '2px' }}>
                  R.U.C. 20600240677
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* CLIENTE, TIPO SERVICIO, VEHICULO HEADER TITLES */}
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#334155', color: '#fff', fontSize: '8pt', fontWeight: 'bold' }}>
          <tbody>
            <tr>
              <td style={{ width: '38%', padding: '2px 4px', borderRight: '1px solid #fff' }}>DATOS DEL CLIENTE</td>
              <td style={{ width: '24%', padding: '2px 4px', borderRight: '1px solid #fff' }}>TIPO DE SERVICIO</td>
              <td style={{ width: '38%', padding: '2px 4px' }}>DATOS DEL VEHICULO</td>
            </tr>
          </tbody>
        </table>

        {/* CLIENTE, TIPO SERVICIO, VEHICULO GRID */}
        <table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: '1px solid #000', fontSize: '7.5pt' }}>
          <tbody>
            <tr>
              {/* CLIENTE */}
              <td style={{ width: '38%', verticalAlign: 'top', padding: '2px', borderRight: '1px solid #000' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr><td style={{ fontWeight: 'bold', width: '30%' }}>Razón Social:</td><td>{client.razon_social}</td></tr>
                    <tr><td style={{ fontWeight: 'bold' }}>R.U.C.:</td><td>{client.ruc}</td></tr>
                    <tr><td style={{ fontWeight: 'bold' }}>Dirección:</td><td>{client.direccion}</td></tr>
                    <tr><td style={{ fontWeight: 'bold' }}>Distrito:</td><td>{client.distrito}</td></tr>
                    <tr><td style={{ fontWeight: 'bold' }}>Usuario:</td><td>{client.usuario}</td></tr>
                    <tr><td style={{ fontWeight: 'bold' }}>D.N.I.:</td><td>{client.dni} &nbsp; <b>Email:</b> {client.email}</td></tr>
                    <tr><td style={{ fontWeight: 'bold' }}>Cel.:</td><td>{client.celular} &nbsp; <b>Telf:</b> {client.telefono}</td></tr>
                  </tbody>
                </table>
              </td>
              {/* TIPO SERVICIO */}
              <td style={{ width: '24%', verticalAlign: 'top', padding: '4px', borderRight: '1px solid #000' }}>
                <CheckBox checked={serviceType.reparacion_general} label="Reparación General" /><br />
                <CheckBox checked={serviceType.reparacion_parcial} label="Reparación Parcial" /><br />
                <CheckBox checked={serviceType.mantenimiento_preventivo} label="Mantenimiento Preventivo" /><br />
                <CheckBox checked={serviceType.mantenimiento_general} label="Mantenimiento General" /><br />
                <CheckBox checked={serviceType.servicio_express} label="Servicio Express" /><br />
                <CheckBox checked={serviceType.servicio_garantia} label="Servicio por Garantía" />
              </td>
              {/* VEHICULO */}
              <td style={{ width: '38%', verticalAlign: 'top', padding: '2px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr><td style={{ fontWeight: 'bold', width: '35%' }}>Modelo:</td><td>{vehicle.modelo}</td></tr>
                    <tr><td style={{ fontWeight: 'bold' }}>N° de Motor:</td><td>{vehicle.nro_motor}</td></tr>
                    <tr><td style={{ fontWeight: 'bold' }}>N° de Chasis:</td><td>{vehicle.nro_chasis}</td></tr>
                    <tr><td style={{ fontWeight: 'bold' }}>Año de Fab.:</td><td>{vehicle.ano_fab}</td></tr>
                    <tr><td style={{ fontWeight: 'bold' }}>Color:</td><td>{vehicle.color}</td></tr>
                    <tr><td style={{ fontWeight: 'bold' }}>Placa:</td><td>{vehicle.placa}</td></tr>
                    <tr><td style={{ fontWeight: 'bold' }}>Kilometraje:</td><td>{vehicle.kilometraje}</td></tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* TRABAJOS ESPECIFICOS A REALIZAR HEADER */}
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#334155', color: '#fff', fontSize: '8pt', fontWeight: 'bold' }}>
          <tbody>
            <tr>
              <td style={{ width: '62%', padding: '2px 4px', borderRight: '1px solid #fff' }}>TRABAJOS ESPECÍFICOS A REALIZAR</td>
              <td style={{ width: '38%', padding: '2px 4px', textAlign: 'center' }}>SOLES S/</td>
            </tr>
          </tbody>
        </table>

        {/* TRABAJOS Y RESUMEN SOLES GRID */}
        <table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: '1px solid #000', fontSize: '7.5pt' }}>
          <tbody>
            <tr>
              <td style={{ width: '62%', verticalAlign: 'top', padding: '4px', borderRight: '1px solid #000' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
                  <div>
                    <CheckBox checked={jobs.mantenimiento} label="MANTENIMIENTO" /><br />
                    <CheckBox checked={jobs.cambio_aceite} label="CAMBIO DE ACEITE" /><br />
                    <CheckBox checked={jobs.reparacion_motor} label="REPARACION DE MOTOR" /><br />
                    <CheckBox checked={jobs.descarbonizados} label="DESCARBONIZADOS" /><br />
                    <CheckBox checked={jobs.embrague} label="EMBRAGUE" /><br />
                    <CheckBox checked={jobs.transmision} label="TRANSMISIÓN" /><br />
                    <CheckBox checked={jobs.sistema_arrastre} label="SISTEMA DE ARRASTRE" /><br />
                    <CheckBox checked={jobs.frenos} label="FRENOS" />
                  </div>
                  <div>
                    <CheckBox checked={jobs.bateria} label="BATERIA" /><br />
                    <CheckBox checked={jobs.revision_electrico} label="REVISIÓN SISTEMA ELÉCTRICO" /><br />
                    <CheckBox checked={jobs.revision_encendido} label="REVISIÓN SISTEMA ENCENDIDO" /><br />
                    <CheckBox checked={jobs.suspension} label="SUSPENSIÓN" /><br />
                    <CheckBox checked={jobs.aro_neumatico} label="ARO-NEUMÁTICO" /><br />
                    <CheckBox checked={jobs.sistema_escape} label="SISTEMA DE ESCAPE" /><br />
                    <CheckBox checked={jobs.sistema_direccion} label="SISTEMA DE DIRECCIÓN" /><br />
                    <CheckBox checked={!!jobs.otros} label={`OTROS: ${jobs.otros || ''}`} />
                  </div>
                </div>
              </td>
              <td style={{ width: '38%', verticalAlign: 'top', padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7pt' }}>
                  <tbody>
                    <tr><td style={{ padding: '1px 4px', borderBottom: '1px solid #ccc' }}>M.O. MANTENIMIENTO</td><td style={{ textAlign: 'right', padding: '1px 4px', borderBottom: '1px solid #ccc' }}>{soles.mo_mantenimiento?.toFixed(2) || '0.00'}</td></tr>
                    <tr><td style={{ padding: '1px 4px', borderBottom: '1px solid #ccc' }}>M.O. REPARACIÓN</td><td style={{ textAlign: 'right', padding: '1px 4px', borderBottom: '1px solid #ccc' }}>{soles.mo_reparacion?.toFixed(2) || '0.00'}</td></tr>
                    <tr><td style={{ padding: '1px 4px', borderBottom: '1px solid #ccc' }}>SERVICIO DE TERCEROS</td><td style={{ textAlign: 'right', padding: '1px 4px', borderBottom: '1px solid #ccc' }}>{soles.servicio_terceros?.toFixed(2) || '0.00'}</td></tr>
                    <tr><td style={{ padding: '1px 4px', borderBottom: '1px solid #ccc' }}>OTROS</td><td style={{ textAlign: 'right', padding: '1px 4px', borderBottom: '1px solid #ccc' }}>{soles.otros_mo?.toFixed(2) || '0.00'}</td></tr>
                    <tr style={{ fontWeight: 'bold', backgroundColor: '#f1f5f9' }}><td style={{ padding: '1px 4px', borderBottom: '1px solid #000' }}>SUB TOTAL M.O.</td><td style={{ textAlign: 'right', padding: '1px 4px', borderBottom: '1px solid #000' }}>{soles.subtotal_mo?.toFixed(2) || '0.00'}</td></tr>
                    <tr><td style={{ padding: '1px 4px', borderBottom: '1px solid #ccc' }}>REPUESTOS</td><td style={{ textAlign: 'right', padding: '1px 4px', borderBottom: '1px solid #ccc' }}>{soles.repuestos?.toFixed(2) || '0.00'}</td></tr>
                    <tr><td style={{ padding: '1px 4px', borderBottom: '1px solid #ccc' }}>ACCESORIOS</td><td style={{ textAlign: 'right', padding: '1px 4px', borderBottom: '1px solid #ccc' }}>{soles.accesorios?.toFixed(2) || '0.00'}</td></tr>
                    <tr><td style={{ padding: '1px 4px', borderBottom: '1px solid #ccc' }}>LUBRICANTES</td><td style={{ textAlign: 'right', padding: '1px 4px', borderBottom: '1px solid #ccc' }}>{soles.lubricantes?.toFixed(2) || '0.00'}</td></tr>
                    <tr><td style={{ padding: '1px 4px', borderBottom: '1px solid #ccc' }}>OTROS</td><td style={{ textAlign: 'right', padding: '1px 4px', borderBottom: '1px solid #ccc' }}>{soles.otros_repuestos?.toFixed(2) || '0.00'}</td></tr>
                    <tr style={{ fontWeight: 'bold', backgroundColor: '#f1f5f9' }}><td style={{ padding: '1px 4px', borderBottom: '1px solid #000' }}>SUB TOTAL REPUESTOS</td><td style={{ textAlign: 'right', padding: '1px 4px', borderBottom: '1px solid #000' }}>{soles.subtotal_repuestos?.toFixed(2) || '0.00'}</td></tr>
                    <tr style={{ fontWeight: 'bold' }}><td style={{ padding: '1px 4px', borderBottom: '1px solid #ccc' }}>VALOR VENTA TOTAL</td><td style={{ textAlign: 'right', padding: '1px 4px', borderBottom: '1px solid #ccc' }}>{soles.valor_venta_total?.toFixed(2) || '0.00'}</td></tr>
                    <tr><td style={{ padding: '1px 4px', borderBottom: '1px solid #ccc' }}>ADELANTOS</td><td style={{ textAlign: 'right', padding: '1px 4px', borderBottom: '1px solid #ccc' }}>{soles.adelantos?.toFixed(2) || '0.00'}</td></tr>
                    <tr style={{ fontWeight: 'bold', fontSize: '8pt', backgroundColor: '#fee2e2', color: '#991b1b' }}>
                      <td style={{ padding: '2px 4px' }}>TOTAL A PAGAR</td>
                      <td style={{ textAlign: 'right', padding: '2px 4px' }}>S/ {soles.total_a_pagar?.toFixed(2) || '0.00'}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* REQUERIMIENTOS DEL CLIENTE */}
        <div style={{ borderBottom: '1px solid #000' }}>
          <div style={{ backgroundColor: '#334155', color: '#fff', fontSize: '7.5pt', fontWeight: 'bold', padding: '1px 4px' }}>
            REQUERIMIENTOS DEL CLIENTE
          </div>
          <div style={{ padding: '4px', minHeight: '28px', fontSize: '7.5pt' }}>
            {order.requerimientos_cliente || 'N/A'}
          </div>
        </div>

        {/* INVENTARIO DEL VEHICULO & FIRMAS */}
        <div style={{ backgroundColor: '#334155', color: '#fff', fontSize: '7.5pt', fontWeight: 'bold', padding: '1px 4px', textAlign: 'center' }}>
          INVENTARIO DEL VEHICULO
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
          {/* Checklist col 1 & 2 */}
          <div style={{ width: '60%', borderRight: '1px solid #000', padding: '4px', fontSize: '6.5pt' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
              <div>
                <CheckBox checked={inv.llave_contacto} label="Llave de Contacto" /><br />
                <CheckBox checked={inv.tarjeta_propiedad} label="Tarjeta de Propiedad" /><br />
                <CheckBox checked={inv.libro_servicio} label="Libro de Servicio" /><br />
                <CheckBox checked={inv.espejos_izq || inv.espejos_der} label="Espejos IZQ / DER" /><br />
                <CheckBox checked={inv.tapiz_asiento} label="Tapiz de Asiento" /><br />
                <CheckBox checked={inv.porta_herramientas} label="Porta Herramientas" /><br />
                <CheckBox checked={inv.telescopicas} label="Telescópicas" /><br />
                <CheckBox checked={inv.cobertores} label="Cobertores" /><br />
                <CheckBox checked={inv.tapas_laterales_izq || inv.tapas_laterales_der} label="Tapas Laterales IZQ / DER" /><br />
                <CheckBox checked={inv.parrilla} label="Parrilla" /><br />
                <CheckBox checked={inv.velocimetro} label="Velocímetro" /><br />
                <CheckBox checked={inv.tacometro} label="Tacómetro" /><br />
                <CheckBox checked={inv.maletera_delivery} label="Maletera Delivery" /><br />
                <CheckBox checked={inv.seguro_cadena} label="Seguro / Cadena" /><br />
                <CheckBox checked={inv.cable_freno_delantero} label="Cable Freno Delantero" /><br />
                <CheckBox checked={inv.cable_embrague} label="Cable de Embrague" /><br />
                <CheckBox checked={inv.cable_velocimetro} label="Cable Velocímetro" /><br />
                <CheckBox checked={inv.cable_tacometro} label="Cable Tacómetro" /><br />
                <CheckBox checked={inv.parador_lateral} label="Parador Lateral" /><br />
                <CheckBox checked={inv.parador_central} label="Parador Central" /><br />
                <CheckBox checked={inv.cubrecadena} label="Cubrecadena" />
              </div>
              <div>
                <CheckBox checked={inv.amortiguadores_post_1 || inv.amortiguadores_post_2} label="Amortiguadores Post. 1 - 2" /><br />
                <CheckBox checked={inv.guardafango_delantero} label="Guardafango Delantero" /><br />
                <CheckBox checked={inv.guardafango_posterior} label="Guardafango Posterior" /><br />
                <CheckBox checked={inv.llanta_delantera_buena || inv.llanta_delantera_gastada} label="Llanta Del. (Buena/Gastada)" /><br />
                <CheckBox checked={inv.llanta_posterior_buena || inv.llanta_posterior_gastada} label="Llanta Post. (Buena/Gastada)" /><br />
                <CheckBox checked={inv.pedal_arranque} label="Pedal de Arranque" /><br />
                <CheckBox checked={inv.pedal_cambio} label="Pedal de Cambio" /><br />
                <CheckBox checked={inv.tapa_lateral_si} label="Tapa Lateral Si / No" /><br />
                <CheckBox checked={inv.jebe_estribo_izq || inv.jebe_estribo_der} label="Jebe de Estribo IZQ / DER" /><br />
                <CheckBox checked={inv.descanza_pie_izq || inv.descanza_pie_der} label="Descanza pie pas. IZQ / DER" /><br />
                <CheckBox checked={inv.faro_delantero} label="Faro Delantero" /><br />
                <CheckBox checked={inv.tapa_gasolina} label="Tapa de Gasolina" /><br />
                <CheckBox checked={inv.herramientas} label="Herramientas" /><br />
                <CheckBox checked={inv.varilla_aceite} label="Varilla de Aceite" /><br />
                <CheckBox checked={inv.tapa_deposito_freno} label="Tapa Depósito de Freno" /><br />
                <CheckBox checked={inv.escarines} label="Escarines" /><br />
                <CheckBox checked={inv.emblemas} label="Emblemas" /><br />
                <CheckBox checked={inv.faros_direccionales_laterales} label="Faros Direccionales Lat." /><br />
                <CheckBox checked={inv.faros_posteriores} label="Faros Posteriores" /><br />
                <CheckBox checked={inv.pedal_frenos} label="Pedal de Frenos" />
              </div>
            </div>
          </div>

          {/* Signatures & Fuel gauge */}
          <div style={{ width: '40%', padding: '4px', fontSize: '6.5pt', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <b>Modelo:</b> {vehicle.modelo}<br />
              <b>Placa:</b> {vehicle.placa}<br />
              <b>Nivel Gasolina:</b> <span style={{ fontWeight: 'bold', color: '#b91c1c' }}>{vehicle.gasolina || '1/2'}</span>
            </div>
            
            <div style={{ borderTop: '1px solid #ccc', paddingTop: '2px', marginTop: '4px' }}>
              <div style={{ fontWeight: 'bold' }}>ACEPTADO POR EL CLIENTE</div>
              <div>NOMBRE: {signatures.aceptado_cliente_nombre || client.razon_social}</div>
              <div>D.N.I.: {signatures.aceptado_cliente_dni || client.dni}</div>
            </div>

            <div style={{ borderTop: '1px solid #ccc', paddingTop: '2px', marginTop: '4px' }}>
              <div style={{ fontWeight: 'bold' }}>RECIBÍ CONFORME</div>
              <div>NOMBRE: {signatures.recibi_conforme_nombre || ''}</div>
              <div>D.N.I.: {signatures.recibi_conforme_dni || ''}</div>
            </div>

            <div style={{ borderTop: '1px solid #ccc', paddingTop: '2px', marginTop: '4px' }}>
              <b>FACTURACIÓN:</b> {billing.tipo} &nbsp; <b>Series:</b> {billing.series} <b>N°:</b> {billing.numeros}
            </div>
          </div>
        </div>

        {/* FOOTER BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '6.5pt', padding: '2px 4px', background: '#f8fafc' }}>
          <div><b>HORA Y FECHA DE RECEPCIÓN:</b> {order.fecha_emision} {order.hora_emision}</div>
          <div><b>FORMA DE PAGO:</b> {order.forma_pago || 'EFECTIVO'}</div>
          <div><b>TÉCNICO:</b> {order.tecnico_responsable || 'ALONSO'}</div>
        </div>
        <div style={{ textAlign: 'center', fontSize: '6pt', fontStyle: 'italic', fontWeight: 'bold', marginTop: '2px' }}>
          "AÑO DE LA ESPERANZA Y EL FORTALECIMIENTO DE LA DEMOCRACIA"
        </div>
      </div>

      {/* PAGE 2 - REVERSO (PAGE BREAK) */}
      <div className="printable-sheet page-break" style={{ border: '1px solid #000', marginTop: '1rem' }}>
        {/* REVERSO HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '4px' }}>
          <div style={{ color: '#dc2626', fontWeight: '900', fontSize: '11pt' }}>ALONSO</div>
          <div style={{ fontWeight: 'bold', fontSize: '10pt' }}>REPUESTOS, SERVICIOS Y MANO DE OBRA</div>
          <div style={{ fontSize: '8pt', fontWeight: 'bold' }}>ORDEN N° {order.numero_orden}</div>
        </div>

        {/* TABLA REPUESTOS */}
        <div style={{ backgroundColor: '#334155', color: '#fff', fontSize: '7.5pt', fontWeight: 'bold', padding: '2px 4px', textAlign: 'center' }}>
          REPUESTOS
        </div>
        <table className="print-table" style={{ marginBottom: '8px' }}>
          <thead>
            <tr>
              <th style={{ width: '6%' }}>Item</th>
              <th style={{ width: '20%' }}>N° de Parte</th>
              <th style={{ width: '48%' }}>DESCRIPCIÓN</th>
              <th style={{ width: '10%' }}>Precio Unit.</th>
              <th style={{ width: '6%' }}>Cant.</th>
              <th style={{ width: '10%' }}>SubTotal</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 15 }).map((_, idx) => {
              const item = repuestos[idx] || {};
              return (
                <tr key={`rep-${idx}`}>
                  <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                  <td>{item.num_parte || ''}</td>
                  <td>{item.descripcion || ''}</td>
                  <td style={{ textAlign: 'right' }}>{item.precio_unitario ? item.precio_unitario.toFixed(2) : ''}</td>
                  <td style={{ textAlign: 'center' }}>{item.cantidad || ''}</td>
                  <td style={{ textAlign: 'right' }}>{item.subtotal ? item.subtotal.toFixed(2) : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* TABLA SERVICIOS DE TERCEROS */}
        <div style={{ backgroundColor: '#334155', color: '#fff', fontSize: '7.5pt', fontWeight: 'bold', padding: '2px 4px', textAlign: 'center' }}>
          SERVICIOS DE TERCEROS
        </div>
        <table className="print-table" style={{ marginBottom: '8px' }}>
          <thead>
            <tr>
              <th style={{ width: '6%' }}>Item</th>
              <th style={{ width: '68%' }}>DESCRIPCIÓN</th>
              <th style={{ width: '10%' }}>Precio Unit.</th>
              <th style={{ width: '6%' }}>Cant.</th>
              <th style={{ width: '10%' }}>SubTotal</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }).map((_, idx) => {
              const item = terceros[idx] || {};
              return (
                <tr key={`terc-${idx}`}>
                  <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                  <td>{item.descripcion || ''}</td>
                  <td style={{ textAlign: 'right' }}>{item.precio_unitario ? item.precio_unitario.toFixed(2) : ''}</td>
                  <td style={{ textAlign: 'center' }}>{item.cantidad || ''}</td>
                  <td style={{ textAlign: 'right' }}>{item.subtotal ? item.subtotal.toFixed(2) : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* TABLA MANO DE OBRA */}
        <div style={{ backgroundColor: '#334155', color: '#fff', fontSize: '7.5pt', fontWeight: 'bold', padding: '2px 4px', textAlign: 'center' }}>
          MANO DE OBRA
        </div>
        <table className="print-table" style={{ marginBottom: '8px' }}>
          <thead>
            <tr>
              <th style={{ width: '6%' }}>Item</th>
              <th style={{ width: '68%' }}>DESCRIPCIÓN</th>
              <th style={{ width: '10%' }}>Precio Unit.</th>
              <th style={{ width: '6%' }}>Cant.</th>
              <th style={{ width: '10%' }}>SubTotal</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }).map((_, idx) => {
              const item = manoObra[idx] || {};
              return (
                <tr key={`mo-${idx}`}>
                  <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                  <td>{item.descripcion || ''}</td>
                  <td style={{ textAlign: 'right' }}>{item.precio_unitario ? item.precio_unitario.toFixed(2) : ''}</td>
                  <td style={{ textAlign: 'center' }}>{item.cantidad || ''}</td>
                  <td style={{ textAlign: 'right' }}>{item.subtotal ? item.subtotal.toFixed(2) : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* OBSERVACIONES Y RECOMENDACIONES */}
        <div style={{ border: '1px solid #000', padding: '4px', marginBottom: '8px', minHeight: '45px', fontSize: '7.5pt' }}>
          <b>OBSERVACIONES Y RECOMENDACIONES:</b><br />
          {order.observaciones || 'Sin observaciones.'}
        </div>

        {/* FOOTER REVERSO */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '7.5pt' }}>
          <div>
            <b>HORA DE INICIO DE TRABAJO:</b> {order.hora_inicio || '____'} &nbsp;&nbsp;
            <b>HORA FIN DE TRABAJO:</b> {order.hora_fin || '____'}<br />
            <b>FECHA:</b> {order.fecha_trabajo || new Date().toISOString().split('T')[0]}
          </div>
          <div style={{ textAlign: 'right' }}>
            <b>TÉCNICO RESPONSABLE:</b><br />
            <span style={{ fontSize: '9pt', fontWeight: 'bold' }}>NOMBRE: {order.tecnico_responsable || 'ALONSO VARGAS L.'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
