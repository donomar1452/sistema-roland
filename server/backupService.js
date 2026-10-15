import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkpointDB } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../data/sistema_roland.db');
const backupDir = process.env.BACKUP_DIR || path.join(__dirname, '../backups');

export function createDatabaseBackup() {
  try {
    if (!fs.existsSync(dbPath)) return null;

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Asegurar que todas las transacciones en memoria WAL se escriban al archivo .db principal
    checkpointDB();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup_roland_${timestamp}.db`);

    fs.copyFileSync(dbPath, backupPath);
    console.log(`🔒 Backup automático creado exitosamente: ${backupPath}`);

    // Limpieza preventiva: conservar los últimos 30 backups para no saturar disco
    cleanOldBackups(30);

    return backupPath;
  } catch (err) {
    console.error('Error creando backup de base de datos:', err.message);
    return null;
  }
}

function cleanOldBackups(maxKeep = 30) {
  try {
    if (!fs.existsSync(backupDir)) return;
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('backup_roland_') && f.endsWith('.db'))
      .map(f => ({ name: f, time: fs.statSync(path.join(backupDir, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time);

    if (files.length > maxKeep) {
      const toDelete = files.slice(maxKeep);
      for (const file of toDelete) {
        fs.unlinkSync(path.join(backupDir, file.name));
      }
    }
  } catch (e) {
    // Silently continue if cleaning fails
  }
}

// Respaldo automático programado cada 24 horas
setInterval(() => {
  createDatabaseBackup();
}, 24 * 60 * 60 * 1000);

