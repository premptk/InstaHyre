CREATE TYPE is_registered_status AS ENUM ('YES', 'NO');
CREATE TYPE spam_status AS ENUM ('YES', 'NO');

CREATE TABLE users (
    "id" varchar(50) PRIMARY KEY,
    "name" varchar(50) NOT NULL,
    "number" varchar(50) NOT NULL,
    "password" varchar(100) NOT NULL,
    "createdAt" timestamptz NOT NULL DEFAULT NOW(),
    "updatedAt" timestamptz NOT NULL DEFAULT NOW(),
    UNIQUE ("number")
);

CREATE TABLE directory (
    "id" varchar(50) PRIMARY KEY,
    "name" varchar(50) NOT NULL,
    "number" varchar(50) NOT NULL,
    "email" varchar(100) UNIQUE,
    "isRegistered" is_registered_status,
    "isSpam" spam_status,
    "contactFrom" varchar(50),
    "createdAt" timestamptz NOT NULL DEFAULT NOW(),
    "updatedAt" timestamptz NOT NULL DEFAULT NOW(),
    FOREIGN KEY("contactFrom") REFERENCES users("id"),
    UNIQUE ("name", "number")
);