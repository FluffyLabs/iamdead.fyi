//! Proof of Life recipients.

use serde::Serialize;

/// Piece recipient.
///
/// A definition of an entity that can be configured to receive a stored piece.
/// By default we start with collecting an e-mail address, but the recipient
/// may also configure additional [Adapter]s to be notified on.
///
/// It's up to the recipient to specify how they wish to receive the message.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Recipient {
  /// Unique `id` of the recipient.
  pub id: i32,
  /// The `user_id` of a user who this recipient is associated with.
  pub user_id: i32,
  /// The user-defined name of that recipient.
  pub name: String,
  /// The user-defined email of that recipient.
  pub email: String,
}
