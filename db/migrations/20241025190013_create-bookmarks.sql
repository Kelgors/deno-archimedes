-- migrate:up
CREATE TABLE bookmarks (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR NOT NULL,
  "description" TEXT NOT NULL,
  "url" TEXT NOT NULL
);

CREATE TABLE bookmark_users (
  "user_id" uuid NOT NULL,
  "bookmark_id" uuid NOT NULL
);

ALTER TABLE bookmark_users
ADD CONSTRAINT pk_bookmark_user PRIMARY KEY ("user_id", "bookmark_id");

ALTER TABLE bookmark_users
ADD CONSTRAINT fk_user_id FOREIGN KEY ("user_id")
REFERENCES users ("id")
ON DELETE CASCADE;

ALTER TABLE bookmark_users
ADD CONSTRAINT fk_bookmark_id FOREIGN KEY ("bookmark_id")
REFERENCES bookmarks ("id")
ON DELETE CASCADE;

-- migrate:down
DROP TABLE bookmark_users;
DROP TABLE bookmarks;
