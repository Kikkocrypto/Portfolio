-- Migrazione: aggiunge token_version a admin_users per revoca JWT al logout (SQLite)
-- Uso: sqlite3 portfolio.db < migrations/003_add_token_version_to_admin_users.sql

ALTER TABLE admin_users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0;
