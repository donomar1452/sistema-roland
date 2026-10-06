import dotenv from 'dotenv';
dotenv.config();

const WORKSHOP_PIN = process.env.WORKSHOP_PIN || '1234';

export function verifyPIN(pin) {
  if (!pin) return false;
  return String(pin).trim() === String(WORKSHOP_PIN).trim();
}

export function authMiddleware(req, res, next) {
  // Allow GET requests without PIN if configured, but protect POST/PUT/DELETE
  if (req.method === 'GET') {
    return next();
  }

  const pinHeader = req.headers['x-workshop-pin'] || req.body?.pin;

  if (verifyPIN(pinHeader)) {
    return next();
  }

  return res.status(401).json({
    success: false,
    error: 'Acceso no autorizado: PIN de taller incorrecto o no provisto.'
  });
}
