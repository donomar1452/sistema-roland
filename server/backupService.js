import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../data/sistema_roland.db');
const backupDir = path.join(__dirname, '../backups');

export function createDatabaseBackup() {
  try {
    if (!fs.existsSync(dbPath)) return null;

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup_roland_${timestamp}.db`);

    fs.copyFileSync(dbPath, backupPath);
    console.log(`🔒 Backup automático creado exitosamente: ${backupPath}`);
    return backupPath;
  } catch (err) {
    console.error('Error creando backup de base de datos:', err.message);
    return null;
  }
}

// Respaldo automático programado cada 24 horas
setInterval(() => {
  createDatabaseBackup();
}, 24 * 60 * 60 * 1000);
