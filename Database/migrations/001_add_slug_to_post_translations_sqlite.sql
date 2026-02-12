-- Migrazione: aggiunge slug a post_translations (SQLite)
-- Solo per DB già esistenti senza la colonna slug.
-- Uso: sqlite3 portfolio.db < migrations/001_add_slug_to_post_translations_sqlite.sql
--
-- Se parti da zero, usa direttamente schema_sqlite.sql (già con slug) e seed_sqlite.sql.

ALTER TABLE post_translations ADD COLUMN slug VARCHAR(255);

-- Popola slug per le righe esistenti (esempio: basato su locale + post_id, poi personalizza).
-- Esempio generico; adatta agli slug desiderati per ogni traduzione.
UPDATE post_translations SET slug = 'welcome-to-my-blog'   WHERE post_id = 1 AND locale = 'en';
UPDATE post_translations SET slug = 'benvenuto-nel-mio-blog' WHERE post_id = 1 AND locale = 'it';
UPDATE post_translations SET slug = 'bienvenido-a-mi-blog' WHERE post_id = 1 AND locale = 'es';
UPDATE post_translations SET slug = 'draft-article'       WHERE post_id = 2 AND locale = 'en';
UPDATE post_translations SET slug = 'articolo-in-bozza'   WHERE post_id = 2 AND locale = 'it';
UPDATE post_translations SET slug = 'articulo-en-borrador' WHERE post_id = 2 AND locale = 'es';
UPDATE post_translations SET slug = 'archived-article'    WHERE post_id = 3 AND locale = 'en';
UPDATE post_translations SET slug = 'articolo-archiviato' WHERE post_id = 3 AND locale = 'it';
UPDATE post_translations SET slug = 'articulo-archivado'  WHERE post_id = 3 AND locale = 'es';

-- In SQLite non si può aggiungere UNIQUE/NOT NULL dopo con ALTER.
-- Per vincoli stretti ricrea il DB da schema_sqlite.sql e seed_sqlite.sql.
