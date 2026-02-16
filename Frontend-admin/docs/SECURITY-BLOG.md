# Sicurezza – Modulo Blog (Admin)

Breve spiegazione delle scelte di sicurezza adottate nella pagina elenco articoli e nel servizio API.

---

## 1. Perché il rendering difensivo è importante

**Rendering difensivo** significa non dare per scontato che la risposta dell’API abbia sempre la forma attesa. Il backend può restituire:

- un array vuoto o `null` al posto di un array;
- oggetti con campi mancanti o tipi sbagliati (es. numero al posto di stringa);
- strutture diverse in caso di errori o versioni diverse dell’API.

Se il codice fa direttamente `data.map(...)` senza verificare che `data` sia un array, una risposta malformata può far crashare l’intera pagina (es. "data.map is not a function"). Controlli come `Array.isArray(data)` e la validazione della forma degli oggetti (es. in `blogService` con `isApiPost`) garantiscono che:

- si renderizza solo quando i dati sono validi;
- in caso di dati invalidi si mostra uno stato di errore invece di un crash;
- non si espongono stack trace o dettagli interni all’utente.

Quindi il rendering difensivo **evita crash e migliora l’affidabilità** anche in contesto admin.

---

## 2. Perché i fallback sulle traduzioni evitano crash

I campi `translations.en`, `translations.it` potrebbero essere assenti o non essere oggetti con `title`/`content`. Se il codice accedesse direttamente a `post.translations[locale].title` senza controlli:

- con `translations` undefined si avrebbe un errore di lettura su proprietà di `undefined`;
- con una lingua mancante (es. solo `en` e locale `it`) stesso problema.

La funzione `getTitleForLocale` applica una **catena di fallback** (lingua corrente → altre lingue supportate → stringa vuota): così si ottiene sempre un valore sicuro da mostrare (testo o "—") e non si lancia mai un’eccezione per dati mancanti. In questo modo l’interfaccia resta stabile anche con articoli incompleti o vecchi.

---

## 3. Dove può esserci XSS anche nel pannello admin

Anche in un’area riservata agli admin, **XSS (Cross-Site Scripting)** è possibile se:

1. **Si renderizza HTML proveniente dal backend**  
   Se il contenuto degli articoli (es. `content` o `title`) venisse mostrato con `dangerouslySetInnerHTML` o inserito in attributi non escapati, un articolo malevolo (o un account admin compromesso) potrebbe inserire `<script>...</script>` o `onerror=...`. Quel codice verrebbe eseguito nel browser di chi visualizza la pagina.

2. **Dati dall’URL o da query**  
   Parametri come `?lang=it` o segmenti del path usati senza sanitizzazione (es. messi in attributi `href` o in HTML) potrebbero essere manipolati per iniettare script.

3. **Messaggi di errore o toast**  
   Se i messaggi di errore provenienti dal server venissero inseriti nel DOM come HTML invece che come testo, potrebbero diventare vettore di XSS.

Per questo nel modulo blog:

- **non si usa mai `dangerouslySetInnerHTML`** per titolo o contenuto;
- tutti i valori mostrati in tabella sono **stringhe passate come figli di React** (es. `{row.title}`), così React fa l’escaping automatico;
- si usano **funzioni tipo `safeText()`** per limitare lunghezza e garantire conversione a stringa, senza interpretare HTML.

Queste precauzioni riducono il rischio XSS anche nel pannello admin, dove un eventuale compromissione potrebbe colpire chi ha accesso ai dati sensibili.
