use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Adapter {
  pub kind: AdapterKind,
  pub user_id: Option<i32>,
  pub recipient_id: Option<i32>,
  // TODO [ToDr] In the future it might be good to have separate handles per testament.
  pub testament_id: Option<i32>,
  pub handle: String,
}

#[derive(Clone, Copy, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum AdapterKind {
  Email,
  Whatsapp,
  Telegram,
  X,
}
