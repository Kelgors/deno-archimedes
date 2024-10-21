## Preparing development environment

```sh
# prepare db
docker compose up -d
psql -U postgres -h localhost < db/migrations/*
# initialize .env file
echo "APP_SECRET_PATH=dev.key" > .env
# running tests
deno test --allow-all
# starting backend
deno task start
```
