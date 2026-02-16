# Verifica sicurezza frontend – endpoint e dati

Checklist per la verifica della sicurezza lato frontend (portfolio pubblico + admin) rispetto agli endpoint e ai dati.

---

## 1. Separazione endpoint pubblici vs admin

| App            | Endpoint usati                    | Credenziali      | Note                          |
|----------------|-----------------------------------|------------------|-------------------------------|
| **Frontend**   | `GET /api/posts`, `GET /api/posts/{locale}/{slug}`, `POST /api/contacts` | `credentials: 'omit'` | Nessun cookie/token inviato    |
| **Frontend-admin** | `/api/admin/*` (login, logout, posts, messages, audit-logs) | `credentials: 'same-origin'` + `Authorization: Bearer <token>` | Solo richieste autenticate    |

- Il portfolio **non** chiama mai `/api/admin/*` e **non** invia token.
- L’admin usa **solo** `adminFetch`, che aggiunge il Bearer e gestisce il 401.

---

## 2. Token e autenticazione (admin)

- **Token**: tenuto in memoria + `sessionStorage` (chiave `admin_session`). Non in `localStorage` (meno esposto a XSS persistente).
- **401**: su qualsiasi risposta 401, `authClient` chiama `onUnauthorized` → logout e redirect al login.
- **Login**: credenziali inviate solo a `POST /api/admin/login` con `Content-Type: application/json`.
- **Logout**: `POST /api/admin/logout` con Bearer per invalidare la sessione lato server.
- **Route protette**: `ProtectedRoute` non rende le pagine admin finché non è noto se l’utente è autenticato; se non lo è, redirect a `/admin/login`. La protezione effettiva resta **sul backend** (verifica token e ruoli).

---

## 3. Validazione risposte e input

- **Portfolio – post**: `fetchAllPosts` / `fetchPostByLocaleAndSlug` controllano `Content-Type: application/json`, poi usano type guard (`isValidPostsArray`, controlli su campi) prima di usare i dati.
- **Portfolio – contatti**: `submitContact` valida la risposta con `isValidSuccessResponse`; i campi del payload vengono trimmati prima dell’invio; honeypot `website` per ridurre spam/bot.
- **Admin – blog**: parsing delle risposte con controlli su struttura e tipi (es. `parseApiPost`, gestione 409/404).
- **Parametri in URL**: `slug` e `locale` usati nelle chiamate sono codificati con `encodeURIComponent` dove necessario.

---

## 4. Credentials e CORS

- **Portfolio**: `credentials: 'omit'` su post e contatti → nessun cookie inviato alle API pubbliche (comportamento corretto per endpoint anonimi).
- **Admin**: `credentials: 'same-origin'` e Bearer nell’header → cookie (se usati) e token solo verso la stessa origine. La whitelist CORS va configurata **sul backend** (origini consentite).

---

## 5. Esposizione dati sensibili

- **Build**: `VITE_API_URL` è una variabile d’ambiente a build time; non contiene segreti, solo base URL del backend.
- **Errori**: messaggi generici verso l’utente (es. “Errore di caricamento”); in dev eventuali log dettagliati, in prod evitare di esporre stack o body di errore.
- **Console**: `console.error`/`console.warn` usati in punti specifici (es. validazione risposta) e in genere condizionati a `import.meta.env.DEV`.

---

## 6. XSS e contenuto HTML (portfolio)

- **Lista blog**: titolo, excerpt, date sono usati come testo (React escapa automaticamente).
- **Dettaglio post**: il corpo del post è renderizzato con `dangerouslySetInnerHTML` (contenuto da TinyMCE). L’HTML è sanitizzato **in salvataggio** nel backend/admin; il frontend portfolio non sanitizza di nuovo.
- **Raccomandazione (difesa in profondità)**: considerare sanitizzazione lato client prima di `dangerouslySetInnerHTML` (es. DOMPurify) per il contenuto dei post, soprattutto se in futuro altre fonti potessero fornire HTML.

---

## 7. Riepilogo checklist

- [x] Endpoint pubblici senza credenziali (`credentials: 'omit'`).
- [x] Admin: tutte le chiamate autenticate con Bearer; 401 → logout.
- [x] Token admin in memoria + sessionStorage, non in localStorage.
- [x] Route admin protette da `ProtectedRoute` (UX); autorizzazione reale sul backend.
- [x] Validazione risposta (Content-Type, tipo, struttura) prima di usare i dati.
- [x] Parametri URL (slug, locale) codificati dove necessario.
- [x] Nessun segreto in frontend; solo base URL in env.
- [ ] (Opzionale) Sanitizzazione HTML lato client per il corpo dei post (es. DOMPurify) prima di `dangerouslySetInnerHTML`.

---

*Ultimo aggiornamento: verifica basata sullo stato del codice del frontend (portfolio + admin). La sicurezza effettiva degli endpoint dipende dalla configurazione del backend (CORS, validazione input, rate limiting, ecc.).*
