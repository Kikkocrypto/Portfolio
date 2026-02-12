-- =============================================================================
-- Script per creare la tabella audit_logs (SQLite)
-- Utilizzo: apri il file .db del backend in DB Browser for SQLite,
--           poi Esegui SQL (Execute SQL) e incolla/ carica questo script.
-- Il file DB è quello indicato da DB_URL (es. jdbc:sqlite:data/portfolio.db).
-- =============================================================================

-- Tabella audit_logs (ip_address e user_agent contengono hash SHA-256 in hex, 64 caratteri)
CREATE TABLE IF NOT EXISTS audit_logs (
    id             TEXT NOT NULL PRIMARY KEY,
    actor          TEXT NOT NULL,
    action         TEXT NOT NULL,
    resource_type  TEXT,
    resource_id    TEXT,
    details        TEXT,
    ip_address     TEXT,
    user_agent     TEXT,
    created_at     TIMESTAMP NOT NULL
);

-- Indici per query e filtri
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
