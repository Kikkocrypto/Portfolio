import { API_BASE } from './config';

/**
 * Payload per l'invio del form contatti.
 * Allineato al backend ContactRequest (name, email, message, website honeypot).
 */
export interface ContactPayload {
  name: string;
  email: string;
  message: string;
  /** Honeypot: lasciare vuoto nel form (campo nascosto). Se valorizzato = bot → backend non salva. */
  website?: string;
}

/**
 * Risposta attesa dal backend su successo (201).
 */
interface ContactSuccessResponse {
  success: boolean;
  message?: string;
}

function isValidSuccessResponse(data: unknown): data is ContactSuccessResponse {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return obj.success === true;
}

/**
 * Invia il messaggio di contatto al backend.
 *
 * Sicurezza:
 * - AbortController per annullare la richiesta
 * - Validazione Content-Type prima del parse
 * - Validazione risposta prima di usarla
 * - Credentials espliciti (omit per endpoint pubblico)
 *
 * @param payload - Dati del form (name, email, message, website opzionale)
 * @param signal - AbortSignal per cancellazione
 * @returns true se inviato con successo
 * @throws Error con codice user-friendly in caso di fallimento
 */
export async function submitContact(
  payload: ContactPayload,
  signal?: AbortSignal
): Promise<boolean> {
  if (!API_BASE) {
    throw new Error('API_NOT_CONFIGURED');
  }

  const url = `${API_BASE}/api/contacts`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'omit',
      body: JSON.stringify({
        name: payload.name.trim(),
        email: payload.email.trim(),
        message: payload.message.trim(),
        ...(payload.website !== undefined && payload.website !== '' && { website: payload.website.trim() }),
      }),
      signal,
    });

    const contentType = response.headers.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('INVALID_RESPONSE_TYPE');
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new Error('INVALID_JSON');
    }

    if (response.status === 201) {
      if (!isValidSuccessResponse(data)) {
        if (import.meta.env.DEV) {
          console.warn('[submitContact] Unexpected 201 body:', data);
        }
      }
      return true;
    }

    if (response.status === 400) {
      // Validazione backend (campi obbligatori, email non valida, ecc.)
      const details = (data as { details?: unknown })?.details;
      throw new Error('VALIDATION_ERROR');
    }

    if (response.status >= 500) {
      throw new Error('SERVER_ERROR');
    }

    throw new Error('SUBMIT_FAILED');
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    if (error instanceof TypeError) {
      throw new Error('NETWORK_ERROR');
    }
    if (
      error instanceof Error &&
      [
        'API_NOT_CONFIGURED',
        'INVALID_RESPONSE_TYPE',
        'INVALID_JSON',
        'VALIDATION_ERROR',
        'SERVER_ERROR',
        'SUBMIT_FAILED',
        'NETWORK_ERROR',
      ].includes(error.message)
    ) {
      throw error;
    }
    throw new Error('UNKNOWN_ERROR');
  }
}
