CREATE TABLE users (
  id INTEGER NOT NULL PRIMARY KEY,
  username VARCHAR NOT NULL,
  auth_provider VARCHAR NOT NULL,
  auth_provider_id VARCHAR NOT NULL
)