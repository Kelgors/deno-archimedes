-- using "test" secret
-- user@mail : user
insert into "users" ("id", "email", "encrypted_password")
values
(
  '67558dc7-15a9-4ec7-baa4-43610a81d17a',
  'user@mail.io',
  '$argon2id$v=19$m=19456,t=2,p=1$VNwtk5sOaTY$M8dnDnplItHJtGSM9q4wNazZ4Jqpv6IK2aDuzxf0PNc'
),
(
  '492fb24a-d6a4-4fd9-96b6-0ec6ab0d7d9b',
  'other-user@mail.io',
  ''
);

insert into "auth_refresh_tokens"
("id", "user_id", "created_at", "expire_at")
values
(
  '0ec12949-da2e-47b8-9040-140f652781aa',
  '67558dc7-15a9-4ec7-baa4-43610a81d17a',
  '2024-10-21T04:05:02.463Z',
  '2038-01-01T03:00:00.000Z'
);
