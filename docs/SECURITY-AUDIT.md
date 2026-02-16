# Audit di sicurezza – Portfolio

Sintesi di ciò che è stato verificato e cosa tenere d’occhio. Niente allarmismi: la base è solida.

---

## Cosa è già a posto

### Backend

- **Autenticazione admin**: JWT in header `Authorization`, sessione stateless, niente cookie di sessione → CSRF non necessario (è documentato in `SecurityConfig`).
- **Password**: Argon2 (Spring Security v5.8), mai in chiaro nei log; reset con token temporaneo e revoca di tutti i JWT dopo il reset.
- **Validazione input**: `@Valid` sui DTO, `@NotBlank` / `@Email` / `@Size` / `@Pattern`; `ContactRequest.normalize()` tronca oltre i limiti anche se qualcosa bypassasse la validazione.
- **XSS (stored)**: `XssSanitizer` (Jsoup Safelist.none()) su contatti e su titolo/contenuto post in admin; niente HTML salvato da input utente non sanitizzato.
- **Rate limiting**: login admin, contatti, messaggi admin, GET post pubblici; limiti configurabili da properties.
- **CORS**: origini da env (`CORS_ALLOWED_ORIGINS` o `FRONTEND_URL` / `ADMIN_FRONTEND_URL`), niente `*` con credentials; `allowCredentials(false)`.
- **Header di sicurezza**: `X-Frame-Options: DENY`, `Referrer-Policy: STRICT_ORIGIN_WHEN_CROSS_ORIGIN`.
- **Autorizzazione**: `@PreAuthorize("hasRole('ADMIN')")` sugli endpoint admin; 401/403 gestiti con risposta JSON senza dettagli sensibili.
- **Honeypot contatti**: campo `website`; se compilato la richiesta restituisce 201 ma non salva (anti-bot).
- **SQL**: JPA/Hibernate con query parametrizzate; nessuna concatenazione di stringhe per SQL.
- **Secret JWT**: letto da configurazione (es. `jwt.secret` da `.env` / `JWT_SECRET`); script per generare secret in `Backend/scripts/`.

### Frontend (portfolio + admin)

- **Endpoint pubblici**: nessun token inviato; `credentials: 'omit'` dove previsto.
- **Admin**: token in memoria + sessionStorage, non in localStorage; 401 → logout; route protette con `ProtectedRoute`.
- **Risposte API**: validazione (Content-Type, struttura) prima di usare i dati; slug/parametri codificati in URL.
- **Contenuto post (portfolio)**: HTML da backend già sanitizzato in salvataggio; eventuale sanitizzazione lato client (es. DOMPurify) è un ulteriore strato opzionale.

---

## Cose da verificare / configurare in produzione

1. **JWT secret**  
   In produzione `jwt.secret` deve venire da variabile d’ambiente (es. `JWT_SECRET` nel `.env`) e deve essere robusto (es. 256 bit). Non lasciare default o valori di dev in produzione.

2. **CORS**  
   Impostare `CORS_ALLOWED_ORIGINS` (o `FRONTEND_URL` e `ADMIN_FRONTEND_URL`) con le origini effettive (es. `https://tuodominio.it`, `https://admin.tuodominio.it`). Nessuna origine “*” con credential.

3. **Database**  
   In produzione preferibile `ddl-auto: validate` (o `none`) e migrazioni (Flyway/Liquibase) invece di `update`, per evitare modifiche automatiche allo schema.

4. **HTTPS**  
   Tutto il traffico in produzione su HTTPS; il backend non gestisce il TLS (è compito del reverse proxy / hosting).

5. **Secret e .env**  
   File `.env` non committati (devono essere in `.gitignore`); in produzione usare variabili d’ambiente del sistema o del PaaS, non file in repo.

---

## Migliorie opzionali (non critiche)

- **Sanitizzazione HTML in lettura (portfolio)**: prima di `dangerouslySetInnerHTML` sul contenuto del post si può passare l’HTML da DOMPurify (difesa in profondità).
- **Audit log**: già presenti per azioni sensibili; si può estendere ad altre operazioni admin se serve tracciabilità.
- **Scadenza JWT**: valore `jwt.expiration-ms` adeguato (es. 1–24 ore); rinnovo con refresh token è opzionale per un solo admin.
- **Rate limit**: in cluster multi-istanza i limiti in-memory non sono condivisi; per scale-out si può introdurre un backend condiviso (es. Redis) per i contatori.

---

## Riepilogo

- **Rischio alto**: non emerso da questa revisione; secret, CORS, validazione, XSS, auth e rate limit sono gestiti in modo coerente.
- **Rischio medio**: dipende da configurazione (JWT secret, CORS, HTTPS, .env) → da controllare in deploy.
- **Migliorie**: soprattutto “difesa in profondità” e operatività (migrazioni DB, HTTPS, secret forte).

In sintesi: niente di grave; con configurazione di produzione corretta (secret, CORS, HTTPS, .env) sei in una posizione solida. La paranoia qui si traduce in “controllare checklist e variabili d’ambiente”, non in rifare tutto.
