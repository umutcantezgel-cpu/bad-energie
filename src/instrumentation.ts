import type { Instrumentation } from 'next';

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { validateEnv } = await import('./lib/env');
  validateEnv();
}

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const { logger } = await import('./services/logger');
  logger.secureError('Unbehandelter Serverfehler', {
    message: error instanceof Error ? error.message : String(error),
    digest: (error as { digest?: string })?.digest,
    path: request.path,
    method: request.method,
    routeType: context.routeType,
  });
};
