//! Proof of Life adapters.

use serde::{Deserialize, Serialize};

/// A single adapter defition that can be used for Proof Of Life or for testament recipient.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Adapter {
  /// Kind of the adapter.
  pub kind: AdapterKind,
  /// User associated with that adapter.
  ///
  /// Can be `None` in case it's associated with a recipient instead.
  pub user_id: Option<i32>,
  /// The recipient id that this adapter is configured for.
  ///
  /// Can be `None` in case the adapter is for the user.
  pub recipient_id: Option<i32>,
  /// Testament id if the adapter is specific for a particular testament.
  ///
  /// Usually `None` here, since the adapters are universal.
  pub testament_id: Option<i32>,
  /// Adapter handle.
  ///
  /// Whatever handle, address is associated with that adapter. Depends on the `kind`.
  pub handle: String,
}

/// The kind of the adapter.
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum AdapterKind {
  /// E-mail adapter.
  Email,
  /// Whatsapp adapter.
  Whatsapp,
  /// Telegram adapter.
  Telegram,
  /// X / Twitter adpater.
  X,
}
