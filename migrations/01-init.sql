create table "bookmarks" (
    id uuid primary key default gen_random_uuid(),
    name varchar not null,
    description text,
    url text not null
);

insert into "bookmarks"
    ("name", "description", "url")
    values
    (
        'How to power Raspberry PI Pico with Solar Cells',
        'Connect your Raspberry PI Pico and solar cell. Get your microcontroller powered in remote places, with TP4056 module and 18650 battery backup',
        'https://peppe8o.com/raspberry-pi-pico-solar-cells/amp'
    );
