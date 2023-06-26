BEGIN;
CREATE UNIQUE INDEX account_phone_key ON account(phone);
CREATE UNIQUE INDEX account_telegram_key ON account(telegram);
COMMIT;