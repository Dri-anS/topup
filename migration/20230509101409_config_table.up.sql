BEGIN;
CREATE TABLE IF NOT EXISTS config (
    id SERIAL NOT NULL,
    value TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMIT;