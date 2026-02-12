-- ============================================================
-- Seed dati di prova - SQLite (UUID)
-- Inserisce solo: contacts, posts, post_translations
-- NON modifica admin_users
-- Ogni traduzione ha il proprio slug (es. it=programmare-in-c, en=programming-in-c)
-- ============================================================
-- Uso: sqlite3 portfolio.db < seed_sqlite.sql
-- Schema: sqlite3 portfolio.db < schema_sqlite.sql
-- ============================================================

-- UUID fissi per i post (usati in post_translations.post_id)
-- post 1 = benvenuto-nel-mio-blog
-- post 2 = articolo-in-bozza
-- post 3 = vecchio-articolo-archiviato
-- post 4 = programmare-in-c

-- ------------------------------------------------------------
-- CONTATTI (messaggi di esempio)
-- ------------------------------------------------------------
INSERT INTO contacts (id, name, email, message) VALUES
('a1111111-1111-1111-1111-111111111101', 'Mario Rossi', 'mario.rossi@example.com', 'Ciao, vorrei maggiori informazioni sui tuoi servizi.'),
('a1111111-1111-1111-1111-111111111102', 'Laura Bianchi', 'laura.b@example.com', 'Salve, ho visto il tuo portfolio e mi piacerebbe contattarti per un progetto.'),
('a1111111-1111-1111-1111-111111111103', 'John Smith', 'john.smith@example.com', 'Hello, I would like to discuss a collaboration opportunity.');

-- ------------------------------------------------------------
-- POST (articoli di esempio: 1 published, 1 draft, 1 archived, 1 published "Programmare in C")
-- ------------------------------------------------------------
INSERT INTO posts (id, slug, status) VALUES
('b1111111-1111-1111-1111-111111111101', 'benvenuto-nel-mio-blog', 'published'),
('b1111111-1111-1111-1111-111111111102', 'articolo-in-bozza', 'draft'),
('b1111111-1111-1111-1111-111111111103', 'vecchio-articolo-archiviato', 'archived'),
('b1111111-1111-1111-1111-111111111104', 'programmare-in-c', 'published');

-- ------------------------------------------------------------
-- TRADUZIONI POST (en, it, es) – ogni traduzione ha id UUID e slug
-- ------------------------------------------------------------
INSERT INTO post_translations (id, post_id, locale, slug, title, content) VALUES
('c1111111-1111-1111-1111-111111111101', 'b1111111-1111-1111-1111-111111111101', 'en', 'welcome-to-my-blog', 'Welcome to my blog', 'This is the first published article. Here you can share your thoughts and updates.'),
('c1111111-1111-1111-1111-111111111102', 'b1111111-1111-1111-1111-111111111101', 'it', 'benvenuto-nel-mio-blog', 'Benvenuto nel mio blog', 'Questo è il primo articolo pubblicato. Qui puoi condividere pensieri e aggiornamenti.'),
('c1111111-1111-1111-1111-111111111103', 'b1111111-1111-1111-1111-111111111101', 'es', 'bienvenido-a-mi-blog', 'Bienvenido a mi blog', 'Este es el primer artículo publicado. Aquí puedes compartir ideas y novedades.');

INSERT INTO post_translations (id, post_id, locale, slug, title, content) VALUES
('c1111111-1111-1111-1111-111111111104', 'b1111111-1111-1111-1111-111111111102', 'en', 'draft-article', 'Draft article', 'This article is still a draft and is not visible to the public.'),
('c1111111-1111-1111-1111-111111111105', 'b1111111-1111-1111-1111-111111111102', 'it', 'articolo-in-bozza', 'Articolo in bozza', 'Questo articolo è ancora in bozza e non è visibile al pubblico.'),
('c1111111-1111-1111-1111-111111111106', 'b1111111-1111-1111-1111-111111111102', 'es', 'articulo-en-borrador', 'Artículo en borrador', 'Este artículo sigue en borrador y no es visible para el público.');

INSERT INTO post_translations (id, post_id, locale, slug, title, content) VALUES
('c1111111-1111-1111-1111-111111111107', 'b1111111-1111-1111-1111-111111111103', 'en', 'archived-article', 'Archived article', 'This is an old archived article.'),
('c1111111-1111-1111-1111-111111111108', 'b1111111-1111-1111-1111-111111111103', 'it', 'articolo-archiviato', 'Articolo archiviato', 'Questo è un vecchio articolo archiviato.'),
('c1111111-1111-1111-1111-111111111109', 'b1111111-1111-1111-1111-111111111103', 'es', 'articulo-archivado', 'Artículo archivado', 'Este es un artículo antiguo archivado.');

INSERT INTO post_translations (id, post_id, locale, slug, title, content) VALUES
('c1111111-1111-1111-1111-11111111110a', 'b1111111-1111-1111-1111-111111111104', 'en', 'programming-in-c', 'Programming in C', 'An introduction to programming in the C language.'),
('c1111111-1111-1111-1111-11111111110b', 'b1111111-1111-1111-1111-111111111104', 'it', 'programmare-in-c', 'Programmare in C', 'Introduzione alla programmazione in linguaggio C.'),
('c1111111-1111-1111-1111-11111111110c', 'b1111111-1111-1111-1111-111111111104', 'es', 'programar-en-c', 'Programar en C', 'Introducción a la programación en lenguaje C.');

-- ============================================================
-- FINE SEED
-- ============================================================
