-- migrate:up
CREATE TABLE users (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR NOT NULL,
  "encrypted_password" VARCHAR NOT NULL
);

-- migrate:down
DROP TABLE "users";
