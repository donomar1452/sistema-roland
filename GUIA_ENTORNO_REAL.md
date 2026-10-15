# 🏍️ Guía de Puesta en Marcha en Entorno Real
## SISTEMA ROLAND / ALONSO — Taller de Motos & Rectificaciones

El sistema ya está completamente preparado, blindado y probado para funcionar en producción real. A continuación tienes las dos formas de usarlo:

---

## 🏢 OPCIÓN 1: USO EN EL TALLER (PC de Mostrador + Móviles por WiFi)
*(Recomendado para talleres físicos: sin costos mensuales, funciona con o sin internet, y con máxima rapidez).*

### 1. Iniciar con un solo clic:
Haz doble clic sobre el archivo:
👉 **`INICIAR_SISTEMA.bat`**

Este archivo se encarga de:
1. Verificar Node.js.
2. Compilar los archivos de producción si no existen.
3. Abrir automáticamente tu navegador en `http://localhost:3001`.
4. Mostrar la dirección IP local de tu taller.

### 2. Conectar Celulares y Tablets de los Mecánicos:
En la pantalla negra que se abre verás algo como esto:
```text
========================================================
🚀 SISTEMA ROLAND / ALONSO - ENTORNO REAL ACTIVO
========================================================
💻 Acceso Local (esta PC):        http://localhost:3001
📱 Acceso Red WiFi Taller:       http://192.168.18.124:3001
🔒 Modo Producción & Seguridad:   ACTIVO
========================================================
```
- Cualquier mecánico o asesor conectado a la misma red Wi-Fi del taller puede abrir en su celular (Chrome o Safari) la dirección `http://192.168.18.xxx:3001`.
- Desde el celular pueden tomar fotos a las órdenes manuales con la cámara o actualizar el estado de los trabajos.

### 3. Impresión Dual (Hojas A4 y Tickets Térmicos):
Al hacer clic en **Imprimir / PDF** en cualquier orden, verás en la parte superior un selector para elegir:
- **📄 Hoja Oficial A4 (2 Páginas):** Para archivar y firmar por el cliente (frente y reverso con inventario detallado de la moto).
- **🧾 Ticket Térmico 80mm / 58mm:** Formato compacto diseñado para impresoras térmicas de tickets (ideal para entregar una copia al cliente o engrapar a la llave de la moto).

---

## ☁️ OPCIÓN 2: DESPLIEGUE EN LA NUBE (Render / Docker / VPS)

### Despliegue en Render:
1. El proyecto ya cuenta con el archivo `render.yaml` preconfigurado.
2. Sube el código a tu repositorio de GitHub.
3. En [dashboard.render.com](https://dashboard.render.com), haz clic en **New + > Blueprint** y selecciona tu repositorio.
4. Render ejecutará automáticamente:
   - `buildCommand`: `npm install && npm run build`
   - `startCommand`: `npm start`
5. Configura en la sección de Environment Variables de Render tu `GEMINI_API_KEY` (si deseas usar el OCR con IA).

> ⚠️ **Importante sobre bases de datos en Render (Plan Free):**
> En el plan gratuito de Render, los discos son temporales y se reinician si el servidor pasa a suspensión por inactividad.  
> **Recomendaciones para el entorno real:**
> - Puedes usar con total confianza la **Opción 1 (PC local del taller)** donde tus datos nunca se borran.
> - O en Render, utiliza regularmente el botón **⚙️ Configuración > Respaldos > Descargar Respaldo JSON** para guardar tus copias en tu computadora personal.
> - Si deseas la nube 100% fija, puedes activar un *Persistent Disk* en Render Starter o usar Docker en un VPS.

### Despliegue con Docker / VPS:
El proyecto incluye `Dockerfile` y `docker-compose.yml`. Para arrancarlo en cualquier servidor Linux o VPS:
```bash
docker compose up -d --build
```
La base de datos SQLite se almacena automáticamente en el volumen local `./data` y los respaldos en `./backups`.

---

## ⚙️ CONFIGURACIÓN, RESPALDOS Y GESTIÓN DIARIA

En la barra superior del sistema encontrarás el botón **⚙️ (Configuración)**:

1. **Datos del Negocio:**
   - Permite cambiar en cualquier momento el Nombre del Taller, RUC, Teléfonos, Dirección, WhatsApp y Condiciones de Garantía.
   - Estos datos se actualizan **en tiempo real** en todas las hojas impresas y tickets.

2. **Copias de Seguridad (Respaldos JSON):**
   - **Descargar Respaldo JSON:** Descarga un archivo completo con todas tus órdenes, historial de clientes, repuestos y configuración.
   - **Restaurar Base de Datos:** Permite subir un archivo JSON y restaurar toda la base de datos al instante si formateas la PC o te mudas de equipo.
   - **Exportar a Excel (CSV):** Descarga una planilla compatible directamente con Microsoft Excel con el resumen de todas las órdenes, montos, adelantos y saldos.

3. **Control Rápido de Estados:**
   - En la tabla principal puedes cambiar el estado de cada orden con un clic entre:
     - 🛠️ `EN PROCESO`
     - ✅ `LISTO PARA ENTREGA` (Al marcarlo, el sistema te ofrece abrir WhatsApp para avisarle al cliente con su texto pre-armado).
     - 🏍️ `ENTREGADO`

4. **Descuento Automático de Inventario:**
   - Al registrar o guardar una orden con repuestos, el stock se descuenta automáticamente del inventario.
   - Si la orden se cancela o elimina, el stock se repone de forma automática.
