BEGIN;
INSERT INTO 
	account(email, phone, password, name, level)
VALUES
	('admin@top.up', '-', '$2a$10$50EpXjF3sMHLwzWpAz/UEujOzjWwS6n8LIwnM3O./msaaqkeBC8M.', 'admin', 'ADMIN');
COMMIT;