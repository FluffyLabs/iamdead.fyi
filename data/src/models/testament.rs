use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Testament {
  pub id: i32,
  pub user_id: i32,
  pub required_chunks: u8,
  pub spare_chunks: u8,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TestamentSensitive {
  pub testament_id: i32,
  pub kind: DataKind,
  pub index: i32,
  pub data: String,
  pub recipient_id: Option<i32>,
}

#[derive(Clone, Copy, PartialEq, Eq, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum DataKind {
  Message,
  Chunk,
}
