//! Testament definition.

use serde::Serialize;

/// A testament definition.
///
/// Additional things associated with the testament are referenced by `testament_id`.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Testament {
  /// The unique `id` of this testament.
  pub id: i32,
  /// The owner of the testament.
  pub user_id: i32,
  /// Number of required chunks (`ChunksConfiguration`).
  pub required_chunks: u8,
  /// Number of spare chunks (`ChunksConfiguration`).
  pub spare_chunks: u8,
  /// Proof of Life grace period.
  pub grace_period: u8,
}

/// Sensitive data of the testament.
///
/// This may be either stored chunk data and also encrypted message parts (see [DataKind]).
/// The `data` is just a frontend-provided encoded string starting with a proper prefix.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TestamentSensitive {
  /// The testament this piece of data is associated with.
  pub testament_id: i32,
  /// The kind of the data stored.
  pub kind: DataKind,
  /// Index of the data.
  pub index: i32,
  /// The encoded string of the data.
  pub data: String,
  /// The recipient that shall receive this piece of data if PoL is triggered.
  pub recipient_id: Option<i32>,
}

/// The kind of the sensitive data stored.
#[derive(Clone, Copy, PartialEq, Eq, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum DataKind {
  /// Part of the encrypted message.
  Message,
  /// A Shamir Secret Sharing chunk.
  Chunk,
}
