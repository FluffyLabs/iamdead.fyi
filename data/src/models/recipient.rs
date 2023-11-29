use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Recipient {
  pub user_id: i32,
  pub id: i32,
  pub name: String,
  pub email: String,
}
