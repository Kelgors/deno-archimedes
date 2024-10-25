-- name: findAllBookmarks :many
SELECT b.*
FROM
  bookmarks b
  INNER JOIN bookmark_users bu ON bu.bookmark_id = b.id
WHERE
  bu.user_id = $1;

-- name: findBookmarkById :one
SELECT b.*
FROM
  bookmarks b
  INNER JOIN bookmark_users bu ON bu.bookmark_id = b.id
WHERE
  bu.bookmark_id = $1
  AND bu.user_id = $2
LIMIT 1;

-- name: createBookmark :one
INSERT INTO bookmarks (name, url, description)
VALUES ($1, $2, $3)
RETURNING *;

-- name: createBookmarkUserJoin :exec
INSERT INTO bookmark_users (bookmark_id, user_id)
VALUES ($1, $2);

-- name: updateBookmark :one
UPDATE bookmarks
SET
  name = $1,
  url = $2,
  description = $3
WHERE
  id = $4
RETURNING *;

-- name: deleteBookmark :exec
DELETE FROM bookmarks
WHERE id = $1;
