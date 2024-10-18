create table "bookmarks" (
    id uuid primary key default gen_random_uuid(),
    name varchar not null,
    description text,
    url text not null
);
