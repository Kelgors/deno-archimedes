create table "users" (
    id uuid primary key default gen_random_uuid(),
    email varchar not null,
    encrypted_password varchar not null
);

create table "auth_refresh_tokens" (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    created_at timestamp with time zone,
    expire_at timestamp with time zone
);

alter table "auth_refresh_tokens"
add constraint fk_user_id foreign key ("user_id")
references "users" ("id")
on delete cascade;
