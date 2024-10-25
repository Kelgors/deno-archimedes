-- name: findUserByEmail :one
SELECT id, email, encrypted_password
FROM users
WHERE email = $1
LIMIT 1;

-- name: createRefreshToken :one
INSERT INTO auth_refresh_tokens (created_at, expire_at, user_id)
VALUES ($1, $2, $3) RETURNING *;

-- name: isTokenPresent :one
SELECT COUNT(*) = 1 AS "present"
FROM auth_refresh_tokens
WHERE id = $1
  AND user_id = $2;
