/**
 * Logger-Dienst.
 * Produktion: nur warn/error. Entwicklung: zusätzlich info.
 * secureError redigiert bekannte Geheimnisfelder, bevor etwas ins Log geht.
 */

const isDev = process.env.NODE_ENV !== 'production';
const REDACT = ['password', 'passwort', 'pin', 'token', 'secret', 'auth', 'cookie'];

function redact(data) {
    if (!data || typeof data !== 'object') return data;
    const safe = { ...data };
    for (const key of Object.keys(safe)) {
        if (REDACT.some((r) => key.toLowerCase().includes(r))) safe[key] = '[REDACTED]';
    }
    return safe;
}

export const logger = {
    info: (message, ...args) => {
        if (isDev) console.log(`[INFO] ${message}`, ...args);
    },
    warn: (message, ...args) => {
        console.warn(`[WARN] ${message}`, ...args);
    },
    error: (message, error) => {
        console.error(`[ERROR] ${message}`, error);
    },
    secureError: (message, data) => {
        console.error(`[SECURE_ERROR] ${message}`, redact(data));
    },
};
