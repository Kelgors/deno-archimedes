create table "bookmarks" (
    id uuid primary key default gen_random_uuid(),
    name varchar not null,
    description text,
    url text not null
);

create table "bookmark_users" (
    user_id uuid not null,
    bookmark_id uuid not null
);

alter table "bookmark_users"
add constraint bookmark_users_pk primary key ("user_id", "bookmark_id");

alter table "bookmark_users"
add constraint fk_user_id foreign key ("user_id")
references "users" ("id")
on delete cascade;

alter table "bookmark_users"
add constraint fk_bookmark_id foreign key ("bookmark_id")
references "bookmarks" ("id")
on delete cascade;
