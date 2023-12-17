//! User definitions.

use crate::schema::users;
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};

/// User of the service.
#[derive(Debug, Queryable, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
  /// Unique `id` of the user.
  pub id: i32,
  /// Username used for signing in.
  pub username: String,
  /// The auth provider kind.
  pub auth_provider: String,
  /// Id of the user as given by the `auth_provider`.
  pub auth_provider_id: String,
  // TODO [ToDr] would be good to have at least an e-mail here.
  // pub email: Option<String>,
}

/// New user definition.
#[derive(Debug, Insertable, Deserialize)]
#[diesel(table_name = users)]
#[serde(rename_all = "camelCase")]
pub struct NewUser {
  /// Username used for signing in.
  pub username: String,
  /// The auth provider kind.
  pub auth_provider: String,
  /// Id of the user as given by the `auth_provider`.
  pub auth_provider_id: String,
}
