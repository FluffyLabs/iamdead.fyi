//! User database interface.

use crate::db::DbConnection;
use crate::models;
use crate::models::user::User;
use diesel::associations::HasTable;
use diesel::result::Error;
use diesel::ExpressionMethods;
use diesel::OptionalExtension;
use diesel::QueryDsl;
use diesel::RunQueryDsl;

/// Insert a new user into the database.
///
/// TODO [ToDr] should probably return a `User` entity or at least an `id`.
pub fn insert(connection: &mut DbConnection, new_user: models::user::NewUser) -> Result<(), Error> {
  use crate::schema::users::dsl;

  diesel::insert_into(dsl::users::table())
    .values(&new_user)
    .execute(connection)
    .map(|_| ())
    .map_err(|e| {
      tracing::error!("Error saving user: {:?}", e);
      e
    })?;

  Ok(())
}

/// Query a user based on the auth provider and id.
pub fn query_by_auth_provider(
  connection: &mut DbConnection,
  auth_provider_val: &str,
  auth_provider_id_val: &str,
) -> Result<Option<User>, Error> {
  use crate::schema::users::dsl;

  let user = dsl::users
    .filter(dsl::auth_provider.eq(auth_provider_val))
    .filter(dsl::auth_provider_id.eq(auth_provider_id_val))
    .first(connection)
    .optional()?;

  Ok(user)
}

/// Query a user given an internal `id`.
pub fn query_by_id(connection: &mut DbConnection, user_id: i32) -> Result<User, Error> {
  use crate::schema::users::dsl;

  let user = dsl::users.filter(dsl::id.eq(user_id)).first(connection)?;
  Ok(user)
}
