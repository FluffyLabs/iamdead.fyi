//! Proof of Life definition.

use serde::Serialize;

use super::adapter::AdapterKind;

/// Proof of life entry definition.
///
/// Entries are organized into groups.
/// Elements within the same `group` need all to be triggered in order for the group to be satisfied.
/// Satisfying any `group` is sufficient to trigger the PoL for the `testament_id` they items are assigned to.
///
/// ## Example:
/// ```js
/// [
///   [Email (months: 2), Whatsapp (months: 1)], // group 0
///   [Twitter (months: 5)]                      // group 1
/// ]
/// ```
///
/// In the above example, the PoL is triggered either if:
/// 1. The user is not active on `Twitter` for 5 months (`group 1`),
/// 2. OR the user does not respond on `Whatsapp` for 1 month AND `Email` for 2 months.
///
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProofOfLife {
  /// Testament for which the PoL is for.
  pub testament_id: i32,
  /// Number of months of inactivity for given adapter.
  pub months: u32,
  /// Group this adapter is assigned to.
  pub group: u32,
  /// The kind of the adapter.
  pub kind: AdapterKind,
}
