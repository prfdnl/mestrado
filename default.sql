--- INSTITUIÇÃO DE ENSINO ----------------------------------------------------------------------------------------------

CREATE TABLE "instituicao" (
  "id"         UUID PRIMARY KEY DEFAULT uuidv7(),
  "nome"       VARCHAR(255) UNIQUE NOT NULL,
  "sigla"      VARCHAR(10) UNIQUE NOT NULL,
  "cnpj"       VARCHAR(14) UNIQUE NOT NULL,
  "endereco"   TEXT NOT NULL,
  "email"      VARCHAR(255) NOT NULL,
  "telefone"   VARCHAR(20) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--- insert instituicao

INSERT INTO "instituicao" (nome, sigla, cnpj, endereco, email, telefone) VALUES (
  'Universidade Federal do Rio Grande do Norte', 
  'UFRN', 
  '12345678901234',
  'Av. Senador Salgado Filho, 3000 - Lagoa Nova, Natal - RN, 59078-970', 
  'contato@ufrn.edu.br',
  '(84) 1234-5678'
);

INSERT INTO "instituicao" (nome, sigla, cnpj, endereco, email, telefone) VALUES (
  'Instituto Federal Catarinense', 
  'IFC', 
  '98765432109876',
  'Rua São Paulo, 285 - Centro, Blumenau - SC, 89010-000', 
  'contato@ifc.edu.br',
  '(47) 1234-5678'
);

INSERT INTO "instituicao" (nome, sigla, cnpj, endereco, email, telefone) VALUES (
  'Universidade Federal de Santa Catarina', 
  'UFSC', 
  '11223344556677',
  'Trindade, Florianópolis - SC, 88040-900', 
  'contato@ufsc.edu.br',
  '(48) 1234-5678'
);

--- CAMPUS -------------------------------------------------------------------------------------------------------------

CREATE TABLE "campus" (
  "id"             UUID PRIMARY KEY DEFAULT uuidv7(),
  "instituicao_id" UUID REFERENCES "instituicao"(id) ON DELETE CASCADE,
  "nome"           VARCHAR(255) NOT NULL,
  "sigla"          VARCHAR(10) NOT NULL,
  "cnpj"           VARCHAR(14) NOT NULL,
  "endereco"       TEXT NOT NULL,
  "email"          VARCHAR(255) NOT NULL,
  "telefone"       VARCHAR(20) NOT NULL,
  "created_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--- insert campus

INSERT INTO "campus" (instituicao_id, nome, sigla, cnpj, endereco, email, telefone) VALUES (
  (SELECT id FROM "instituicao" WHERE sigla = 'IFC'), 
  'Campus Camboriú', 
  'IFC-CAM', 
  '12345678901234',
  'Rua São Paulo, 285 - Centro, Camboriú - SC, 88330-000', 
  'contato@ifc.edu.br',
  '(47) 1234-5678'
);

INSERT INTO "campus" (instituicao_id, nome, sigla, cnpj, endereco, email, telefone) VALUES (
  (SELECT id FROM "instituicao" WHERE sigla = 'IFC'), 
  'Campus Blumenau (Sede)',
  'IFC-BNU', 
  '98765432109876',
  'Rua São Paulo, 285 - Centro, Blumenau - SC, 89010-000', 
  'contato@ifc.edu.br',
  '(47) 1234-5678'
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
  "delete_at"     TIMESTAMPTZ NULL,
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--- insert user

INSERT INTO "user" (username, password_hash, roles, active) VALUES (
  'admin', 
  '$argon2id$v=19$m=65536,p=2,t=3$pkLXYcAmdkgoMguxlTi04w$3ub93nO8CU9CghzvO/o7RT9tOi0orKUqjGXEgOlNryY', 
  ARRAY['admin','publisher'], 
  TRUE
);

--- PUBLICAÇÃO ---------------------------------------------------------------------------------------------------------

CREATE TABLE "publicacao" (
  "id"             UUID PRIMARY KEY DEFAULT uuidv7(),
  "user_id"        UUID REFERENCES "user"(id) ON DELETE CASCADE,
  "titulo"         VARCHAR(255) NOT NULL,
  "tipo"           VARCHAR(50),
  "resumo"         TEXT,
  "transcricao"    TEXT,
  "link"           VARCHAR(255) NOT NULL,
  "data"           DATE,
  "processamento"  BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);