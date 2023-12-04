use crate::schema::users;
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};

#[derive(Debug, Queryable, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
  pub id: i32,
  pub username: String,
  pub auth_provider: String,
  pub auth_provider_id: String,
  // TODO [ToDr] would be good to have at least an e-mail here.
  // pub email: Option<String>,
}

// TODO [ToDr] make it an enum instead of a string.
// #[derive(Debug, Serialize)]
// #[serde(rename_all = "camelCase")]
// pub enum AuthProviderId {
//   IndieAuth
// }

#[derive(Debug, Insertable, Deserialize)]
#[diesel(table_name = users)]
#[serde(rename_all = "camelCase")]
pub struct NewUser {
  pub username: String,
  pub auth_provider: String,
  pub auth_provider_id: String,
}
