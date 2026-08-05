--- INSTITUIÇÃO DE ENSINO ----------------------------------------------------------------------------------------------

CREATE TABLE "instituicao" (
  "id"          UUID PRIMARY KEY DEFAULT uuidv7(),
  "nome"        VARCHAR(255) UNIQUE NOT NULL,
  "sigla"       VARCHAR(10) UNIQUE NOT NULL,
  "cnpj"        VARCHAR(14) UNIQUE NOT NULL,
  "endereco"    TEXT NOT NULL,
  "email"       VARCHAR(255) NOT NULL,
  "telefone"    VARCHAR(20) NOT NULL,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--- CAMPUS -------------------------------------------------------------------------------------------------------------

CREATE TABLE "campus" (
  "id"              UUID PRIMARY KEY DEFAULT uuidv7(),
  "instituicao_id"  UUID REFERENCES "instituicao"(id) ON DELETE CASCADE,
  "nome"            VARCHAR(255) NOT NULL,
  "sigla"           VARCHAR(10) NOT NULL,
  "cnpj"            VARCHAR(14) NOT NULL,
  "endereco"        TEXT NOT NULL,
  "email"           VARCHAR(255) NOT NULL,
  "telefone"        VARCHAR(20) NOT NULL,
  "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--- USER ---------------------------------------------------------------------------------------------------------------

CREATE TABLE "user" (
  "id"            UUID PRIMARY KEY DEFAULT uuidv7(),
  "username"      VARCHAR(255) UNIQUE NOT NULL,
  "password_hash" VARCHAR NOT NULL,
  "roles"         VARCHAR[] NOT NULL DEFAULT ARRAY['user'],
  "active"        BOOLEAN NOT NULL DEFAULT FALSE,

  "campus_id"     UUID NULL REFERENCES "campus"(id) ON DELETE CASCADE,
  "nome"          VARCHAR(255) NULL,
  "email"         VARCHAR(255) NULL,
  "telefone"      VARCHAR(20) NULL,
  "descricao"     TEXT NULL,
  "delete_at"     

  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--- PUBLICAÇÃO ---------------------------------------------------------------------------------------------------------

CREATE TABLE "publicacao" (
  "id"            UUID PRIMARY KEY DEFAULT uuidv7(),
  "user_id"       UUID REFERENCES "user"(id) ON DELETE CASCADE,
  "titulo"        VARCHAR(255) NOT NULL,
  "tipo"          VARCHAR(50) NOT NULL,
  "resumo"        TEXT NOT NULL,
  "transcricao"   TEXT NOT NULL,
  "link"          VARCHAR(255) NOT NULL,
  "data"          DATE NOT NULL,
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);