# Sicurezza – Editor articoli (Blog Edit) e rich text

Spiegazione delle scelte di sicurezza per la pagina di modifica articoli con TinyMCE e DOMPurify.

---

## 1. Perché gli editor di rich text sono vettori ad alto rischio di XSS

Gli editor WYSIWYG (What You See Is What You Get) come TinyMCE consentono di inserire **HTML**. L’HTML può contenere:

- **Tag `<script>`** che eseguono JavaScript nel contesto della pagina.
- **Attributi di evento** (`onclick`, `onerror`, `onload`, ecc.) che eseguono codice quando l’utente interagisce o quando un’immagine/risorsa fallisce.
- **`javascript:` negli URL** nei link (`<a href="javascript:...">`).
- **`<iframe>`** che caricano pagine esterne e possono essere usati per phishing o esfiltrazione.
- **`<object>` / `<embed>`** per eseguire plugin o contenuti esterni.

Se questo HTML viene salvato e poi **renderizzato** (in admin o sul sito pubblico) senza sanitizzazione, il browser **esegue** script e gestori di evento: è **XSS (Cross-Site Scripting)**. Un admin malevolo o un account compromesso può quindi iniettare codice che ruba token, reindirizza, o modifica dati. Per questo gli editor rich text sono considerati **vettori ad alto rischio**: accettano input strutturato (HTML) che, se non trattato correttamente, diventa codice eseguibile.

---

## 2. Perché sanitizzare solo sul backend non basta

Sanitizzare **solo** sul backend ha questi limiti:

1. **Doppio rendering**  
   Se il frontend (React) in qualche punto mostra il contenuto come HTML (es. `dangerouslySetInnerHTML` o un iframe dell’editor) **prima** che i dati vengano inviati al backend, l’utente può essere esposto a XSS anche se il backend poi sanitizza: il danno avviene nel browser prima del round-trip.

2. **Bug o bypass lato server**  
   Un bug nella sanitizzazione backend, un’API alternativa, o una cache che serve contenuto non sanitizzato possono far arrivare HTML malevolo al client. Se il frontend **non** sanitizza mai, un solo punto di fallimento (il backend) espone tutti i client.

3. **Defense in depth**  
   La sanitizzazione **sul frontend** (in editor change, prima del submit e prima di ogni preview) riduce il rischio: anche se il backend fosse bypassato o restituisse dati vecchi non sanitizzati, il frontend può comunque sanitizzare prima di mettere l’HTML nel DOM. Quindi: **sanitizzare sia in invio (e in stato) che in rendering** è una misura di difesa in profondità.

4. **Stato e preview**  
   Nel nostro flusso il contenuto viene tenuto in stato React e può essere mostrato in anteprima. Sanitizzare **on change** e **prima di ogni uso** (inclusa la preview) garantisce che nulla di non sanitizzato finisca mai nel DOM.

Per questi motivi nel modulo Blog Edit si usa **DOMPurify** sul frontend: alla modifica dell’editor, prima del submit e prima di qualsiasi rendering HTML (preview). Il backend dovrebbe comunque ripetere la sanitizzazione.

---

## 3. Perché TinyMCE deve essere limitato

TinyMCE di default può caricare **plugin** e **funzionalità** che:

- consentono di inserire **iframe**, **video**, **oggetti**;
- abilitano **upload di file** (rischio di upload di script o HTML);
- permettono **HTML arbitrario** (paste da Word, “full” HTML).

Se lasciamo tutte le opzioni attive:

- **Script e iframe** possono essere inseriti dall’utente (o da un attaccante che sfrutta la sessione admin) e poi eseguiti quando il contenuto viene mostrato.
- **Upload** può essere usato per caricare file malevoli o HTML con script.
- **Plugin esterni** potrebbero caricare script da terze parti non controllate.

Per questo la configurazione TinyMCE in questo progetto è **minimale e restrittiva**:

- **Solo plugin sicuri**: `lists`, `link`, `autolink` (niente code, media, iframe, image upload).
- **Toolbar limitata**: bold, italic, underline, liste, link, remove format.
- **Whitelist di elementi** (`valid_elements` / `valid_children`): solo `p`, `br`, `strong`, `b`, `em`, `i`, `u`, `ul`, `ol`, `li`, `a[href|target|rel]`, `h2`, `h3`, `h4`. Niente `script`, `iframe`, `object`, `embed`, attributi di evento.
- **Nessun caricamento di plugin da URL esterni** (no script esterni arbitrari).

Anche con queste restrizioni, l’output di TinyMCE **non** è considerato fidato: viene sempre passato da **DOMPurify** prima di essere salvato in stato e inviato al backend, e prima di qualsiasi preview. Così si riduce il rischio sia da configurazione errata che da bypass dell’editor.

---

## 4. Rischi di consentire iframe o embedding di script

- **iframe**  
  Consentire `<iframe>` permetterebbe di incorporare pagine esterne. Un attaccante potrebbe:
  - mostrare una pagina di login fasulla (phishing) per rubare credenziali;
  - esfiltrare dati tramite richieste dalla pagina incorporata;
  - sfruttare vulnerabilità del contenuto incorporato.

- **Script**  
  Consentire `<script>` o attributi di evento (`onclick`, `onerror`, ecc.) significa **eseguire codice arbitrario** nel contesto della pagina (stesso dominio, stesso utente). Conseguenze: furto di token/sessioni, modifica di dati, redirect, cryptominer, ecc.

- **Media/object/embed**  
  Plugin e contenuti esterni possono avere bug o essere malevoli; l’upload di file può introdurre HTML/JS che viene poi interpretato.

Per questo nel nostro setup **iframe e script sono esplicitamente esclusi** (whitelist elementi TinyMCE + DOMPurify con tag/attributi limitati). L’upload di file è disabilitato a meno che non sia esplicitamente richiesto e controllato.

---

## 5. Come il mass assignment potrebbe sovrascrivere campi non voluti

**Mass assignment** significa accettare dal client un oggetto “intero” (es. l’intero post con `id`, `createdAt`, `status`, ecc.) e aggiornare il database con tutti i campi ricevuti, senza whitelist.

Rischi:

- Il client potrebbe inviare **`id`** o **`postId`** diversi e far aggiornare un altro articolo.
- Potrebbe inviare **`createdAt`** / **`updatedAt`** per falsare date.
- Potrebbe inviare **`status`** (es. da “draft” a “published”) senza che l’applicazione preveda un flusso di approvazione.
- Potrebbe inviare **campi riservati** (ruoli, permessi, flag interni) se il backend li mappa sull’entità.

Per evitare ciò:

- Il **payload di update** è esplicitamente limitato a **`slug`** e **`translations`** (con sotto-campi controllati: `id` opzionale, `locale`, `title`, `content`). Non si inviano mai `createdAt`, `updatedAt`, `status`, `postId` (o si inviano solo dove il backend li accetta in modo controllato).
- Il backend dovrebbe **accettare solo** i campi previsti (whitelist) e ignorare o rifiutare il resto, così un eventuale campo “in più” nel JSON non modifica nulla.

In questo modo si evita che un client malevolo o un bug sovrascriva campi che non dovrebbero essere modificabili dall’editor.

---

## Riepilogo pratico

| Aspetto | Scelta |
|--------|--------|
| Rich text | TinyMCE con toolbar e plugin minimi, whitelist elementi |
| Sanitizzazione | DOMPurify su change, prima del submit e prima di ogni preview |
| Rendering | Nessun `dangerouslySetInnerHTML` senza sanitizzazione; preview solo con HTML sanitizzato |
| Update API | Payload limitato a `slug` + `translations` (no mass assignment di id, date, status) |
| Validazione | Slug, codice lingua, titolo trimmed, lunghezza contenuto, lingue non duplicate |

Questo approccio riduce il rischio XSS e sovrascrittura indesiderata dei dati pur consentendo la modifica sicura del contenuto multilingua.
