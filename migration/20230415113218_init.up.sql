BEGIN;

CREATE TYPE account_level AS ENUM ('NORMAL', 'RESELLER', 'ADMIN');
CREATE TABLE IF NOT EXISTS account (
    id SERIAL NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    telegram TEXT,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    level account_level NOT NULL DEFAULT 'NORMAL',
    balance INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT account_pkey PRIMARY KEY (id)
);

CREATE UNIQUE INDEX account_email_key ON account(email);
CREATE UNIQUE INDEX account_phone_key ON account(phone);
CREATE UNIQUE INDEX account_telegram_key ON account(telegram);
CREATE INDEX account_email_idx ON account(email);

CREATE TYPE pay_status AS ENUM ('UNPAID', 'PAID', 'EXPIRED', 'FAILED', 'REFUND');
CREATE TABLE IF NOT EXISTS invoice (
    id TEXT NOT NULL,
    transaction_id TEXT NOT NULL,
    method TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    telegram TEXT,
    pay_status pay_status NOT NULL DEFAULT 'UNPAID',
    amount INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- expired_at TIMESTAMP NOT NULL,
    pay_code TEXT,
    -- pay_url TEXT,
    -- checkout_url TEXT,
    -- qr_url TEXT,

    CONSTRAINT invoice_pkey PRIMARY KEY (id)
);
CREATE INDEX invoice_transactionId_updatedAt_version_idx ON invoice(transaction_id, updated_at);

CREATE TYPE process_status AS ENUM ('CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'RECREATED');
CREATE TABLE IF NOT EXISTS invoice_item (
    id SERIAL NOT NULL,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    brand TEXT DEFAULT 'unknown',
    category TEXT DEFAULT 'unknown',
    price INTEGER NOT NULL,
    price_real INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    customer_no TEXT NOT NULL,
    process_status process_status NOT NULL DEFAULT 'CREATED',
    invoice_id TEXT NOT NULL,
    sn TEXT,
    tele TEXT,
    wa TEXT,
    error TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT invoice_item_pkey PRIMARY KEY (id)
);
CREATE INDEX invoice_id_idx ON invoice_item(invoice_id);
CREATE INDEX name_game_category_idx ON invoice_item(name, brand, category);
CREATE INDEX process_status_idx ON invoice_item(process_status);
ALTER TABLE invoice_item ADD CONSTRAINT invoice_item_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoice(id) ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;