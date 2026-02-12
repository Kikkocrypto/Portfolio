-- ============================================================
-- Migrazione SQLite: INTEGER id → UUID (TEXT)
-- Esegui su un DB con schema precedente (id INTEGER AUTOINCREMENT).
-- post_translations deve già avere la colonna slug (esegui 001 prima se serve).
-- ============================================================
-- Uso: sqlite3 portfolio.db < migrations/002_sqlite_int_to_uuid.sql
-- Consigliato: copia di backup di portfolio.db prima.
-- ============================================================
-- SQLite non permette ALTER tipo colonna: creiamo tabelle nuove,
-- copiamo i dati con UUID generati, poi sostituiamo le tabelle.
-- ============================================================

PRAGMA foreign_keys = OFF;

-- Helper: genera un UUID v4 (una riga per volta, randomblob per chiamata)
-- Usiamo una view/subquery per generare un UUID per riga.

-- ------------------------------------------------------------
-- 1. CONTACTS
-- ------------------------------------------------------------
CREATE TABLE contacts_new (
    id          TEXT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    message     TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO contacts_new (id, name, email, message, created_at)
SELECT
    lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random())%4+1,1) || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6))),
    name, email, message, created_at
FROM contacts;

DROP TABLE contacts;
ALTER TABLE contacts_new RENAME TO contacts;

-- ------------------------------------------------------------
-- 2. POSTS (con old_id per mappare post_translations)
-- ------------------------------------------------------------
CREATE TABLE posts_new (
    id          TEXT PRIMARY KEY,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status      VARCHAR(20) NOT NULL DEFAULT 'draft',
    old_id      INTEGER,
    CHECK (status IN ('published', 'draft', 'archived'))
);

INSERT INTO posts_new (id, slug, created_at, status, old_id)
SELECT
    lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random())%4+1,1) || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6))),
    slug, created_at, status, id
FROM posts;

-- Tabella posts definitiva (senza old_id) per avere FK da post_translations
CREATE TABLE posts_uuid (
    id          TEXT PRIMARY KEY,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status      VARCHAR(20) NOT NULL DEFAULT 'draft',
    CHECK (status IN ('published', 'draft', 'archived'))
);
INSERT INTO posts_uuid (id, slug, created_at, status)
SELECT id, slug, created_at, status FROM posts_new;

DROP TABLE posts;
ALTER TABLE posts_uuid RENAME TO posts;

-- ------------------------------------------------------------
-- 3. POST_TRANSLATIONS (post_id = UUID da posts_new tramite old_id)
-- ------------------------------------------------------------
CREATE TABLE post_translations_new (
    id          TEXT PRIMARY KEY,
    post_id     TEXT NOT NULL,
    locale      VARCHAR(5) NOT NULL,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    title       VARCHAR(500) NOT NULL,
    content     TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
    CHECK (locale IN ('en', 'it', 'es')),
    UNIQUE (post_id, locale)
);

INSERT INTO post_translations_new (id, post_id, locale, slug, title, content)
SELECT
    lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random())%4+1,1) || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6))),
    p.id,
    t.locale,
    COALESCE(NULLIF(trim(t.slug), ''), t.locale || '-' || t.post_id),
    t.title,
    t.content
FROM post_translations t
JOIN posts_new p ON p.old_id = t.post_id;

DROP TABLE post_translations;
ALTER TABLE post_translations_new RENAME TO post_translations;
DROP TABLE posts_new;

-- ------------------------------------------------------------
-- 4. ADMIN_USERS
-- ------------------------------------------------------------
CREATE TABLE admin_users_new (
    id            TEXT PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admin_users_new (id, username, email, password_hash, created_at)
SELECT
    lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random())%4+1,1) || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6))),
    username, email, password_hash, created_at
FROM admin_users;

DROP TABLE admin_users;
ALTER TABLE admin_users_new RENAME TO admin_users;

-- ------------------------------------------------------------
-- 5. INDICI
-- ------------------------------------------------------------
CREATE INDEX idx_posts_slug ON posts (slug);
CREATE INDEX idx_posts_status ON posts (status);
CREATE INDEX idx_post_translations_post_id ON post_translations (post_id);
CREATE INDEX idx_post_translations_locale ON post_translations (locale);
CREATE INDEX idx_post_translations_slug ON post_translations (slug);
CREATE INDEX idx_admin_users_username ON admin_users (username);
CREATE INDEX idx_admin_users_email ON admin_users (email);

PRAGMA foreign_keys = ON;

-- ============================================================
-- FINE MIGRAZIONE
-- ============================================================
