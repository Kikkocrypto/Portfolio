-- ============================================================
-- Portfolio Database Schema - PostgreSQL
-- Chiavi primarie: UUID come VARCHAR(36) (compatibile con UuidToStringConverter)
-- ============================================================

-- ------------------------------------------------------------
-- 1. CONTATTI (form contatti)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
    id          VARCHAR(36) PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    message     TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 2. POST / ARTICLES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
    id          VARCHAR(36) PRIMARY KEY,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status      VARCHAR(20) NOT NULL DEFAULT 'draft',
    CONSTRAINT uq_posts_slug UNIQUE (slug),
    CONSTRAINT chk_posts_status CHECK (status IN ('published', 'draft', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts (status);

-- ------------------------------------------------------------
-- 2b. TRADUZIONI POST (en, it, es)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_translations (
    id          VARCHAR(36) PRIMARY KEY,
    post_id     VARCHAR(36) NOT NULL,
    locale      VARCHAR(5) NOT NULL,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    title       VARCHAR(500) NOT NULL,
    content     TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
    CONSTRAINT chk_post_translations_locale CHECK (locale IN ('en', 'it', 'es')),
    UNIQUE (post_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_post_translations_post_id ON post_translations (post_id);
CREATE INDEX IF NOT EXISTS idx_post_translations_locale ON post_translations (locale);
CREATE INDEX IF NOT EXISTS idx_post_translations_slug ON post_translations (slug);

-- ------------------------------------------------------------
-- 3. ADMIN USERS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
    id            VARCHAR(36) PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    token_version INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT uq_admin_users_username UNIQUE (username),
    CONSTRAINT uq_admin_users_email UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users (username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users (email);

-- ============================================================
-- Le tabelle password_reset_tokens e audit_logs sono create
-- da JPA/Hibernate (ddl-auto: update) all'avvio del backend.
-- Per creazione manuale vedi Backend/scripts/create-audit-logs.sql
-- e le entity PasswordResetToken, AuditLog.
-- ============================================================
