# Archimedes API

Bookmarking backend application (wip)

## Development environment

You will need [docker](https://docs.docker.com/engine/install/) and
[sqlc](https://docs.sqlc.dev/en/latest/overview/install.html)

```sh
# initialize .env file
echo -e "APP_SECRET_PATH=dev.key\nDATABASE_URL=postgres://archi:medes@localhost:5432/bookmarks?sslmode=disable" | tee .env
# start postgres
docker compose -f docker-compose.dev.yml up -d

# run db migration
deno run migrate up
# generate db repositories
sqlc generate
# running tests
deno run test
# starting backend
deno run start
```
