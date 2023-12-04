use serde::Serialize;

use super::adapter::AdapterKind;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProofOfLife {
  pub id: i32,
  pub testament_id: i32,
  pub months: u32,
  pub group: u32,
  pub kind: AdapterKind,
}
