-- migrate:up
CREATE TABLE auth_refresh_tokens (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL,
  "expire_at" TIMESTAMPTZ NOT NULL
);

ALTER TABLE auth_refresh_tokens
ADD CONSTRAINT fk_user_id FOREIGN KEY ("user_id")
REFERENCES users ("id")
ON DELETE CASCADE;

-- migrate:down
DROP TABLE auth_refresh_tokens;
