DROP TABLE IF EXISTS todo;

-- better-auth tables
DROP TABLE IF EXISTS "verification";
DROP TABLE IF EXISTS "account";
DROP TABLE IF EXISTS "session";
DROP TABLE IF EXISTS "user";

CREATE TABLE IF NOT EXISTS "user" (
	"id" TEXT NOT NULL PRIMARY KEY,
	"name" TEXT NOT NULL,
	"email" TEXT NOT NULL UNIQUE,
	"emailVerified" BOOLEAN NOT NULL,
	"image" TEXT,
	"createdAt" TIMESTAMP NOT NULL,
	"updatedAt" TIMESTAMP NOT NULL
);
CREATE TABLE IF NOT EXISTS "session" (
	"id" TEXT NOT NULL PRIMARY KEY,
	"expiresAt" TIMESTAMP NOT NULL,
	"token" TEXT NOT NULL UNIQUE,
	"createdAt" TIMESTAMP NOT NULL,
	"updatedAt" TIMESTAMP NOT NULL,
	"ipAddress" TEXT,
	"userAgent" TEXT,
	"userId" TEXT NOT NULL REFERENCES "user" ("id")
);
CREATE TABLE IF NOT EXISTS "account" (
	"id" TEXT NOT NULL PRIMARY KEY,
	"accountId" TEXT NOT NULL,
	"providerId" TEXT NOT NULL,
	"userId" TEXT NOT NULL REFERENCES "user" ("id"),
	"accessToken" TEXT,
	"refreshToken" TEXT,
	"idToken" TEXT,
	"accessTokenExpiresAt" TIMESTAMP,
	"refreshTokenExpiresAt" TIMESTAMP,
	"scope" TEXT,
	"password" TEXT,
	"createdAt" TIMESTAMP NOT NULL,
	"updatedAt" TIMESTAMP NOT NULL
);
CREATE TABLE IF NOT EXISTS "verification" (
	"id" TEXT NOT NULL PRIMARY KEY,
	"identifier" TEXT NOT NULL,
	"value" TEXT NOT NULL,
	"expiresAt" TIMESTAMP NOT NULL,
	"createdAt" TIMESTAMP,
	"updatedAt" TIMESTAMP
);


-- my tables
CREATE TABLE IF NOT EXISTS todo (
	id SERIAL PRIMARY KEY UNIQUE,
	headline VARCHAR(50) NOT NULL,
	description VARCHAR(300) NOT NULL,
	done BOOLEAN NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT now (),
	position SERIAL NOT NULL,
	UNIQUE (position) DEFERRABLE INITIALLY DEFERRED
);