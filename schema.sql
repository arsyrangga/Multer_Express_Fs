-- SQLite
CREATE TABLE users(
id integer PRIMARY KEY,
username varchar NOT NULL UNIQUE,
password varchar NOT null,
avatar varchar NOT NULL,
created_at CURRENT_TIMESTAMP

)