-- ============================================================
-- Portfolio Database Schema - SQLite
-- Chiavi primarie: UUID (TEXT 36 caratteri)
-- ============================================================

-- ------------------------------------------------------------
-- 1. CONTATTI (form contatti)
-- ------------------------------------------------------------
CREATE TABLE contacts (
    id          TEXT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    message     TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 2. POST / ARTICLES
-- ------------------------------------------------------------
CREATE TABLE posts (
    id          TEXT PRIMARY KEY,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status      VARCHAR(20) NOT NULL DEFAULT 'draft',
    CONSTRAINT uq_posts_slug UNIQUE (slug),
    CHECK (status IN ('published', 'draft', 'archived'))
);

CREATE INDEX idx_posts_slug ON posts (slug);
CREATE INDEX idx_posts_status ON posts (status);

-- ------------------------------------------------------------
-- 2b. TRADUZIONI POST (en, it, es)
-- ------------------------------------------------------------
CREATE TABLE post_translations (
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

CREATE INDEX idx_post_translations_post_id ON post_translations (post_id);
CREATE INDEX idx_post_translations_locale ON post_translations (locale);
CREATE INDEX idx_post_translations_slug ON post_translations (slug);

-- ------------------------------------------------------------
-- 3. ADMIN USERS
-- ------------------------------------------------------------
CREATE TABLE admin_users (
    id            TEXT PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    token_version INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT uq_admin_users_username UNIQUE (username),
    CONSTRAINT uq_admin_users_email UNIQUE (email)
);

CREATE INDEX idx_admin_users_username ON admin_users (username);
CREATE INDEX idx_admin_users_email ON admin_users (email);

-- ============================================================
-- FINE SCHEMA SQLite
-- ============================================================
