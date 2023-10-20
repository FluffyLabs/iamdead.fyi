//! `icod_crypto` library functions exposed to JS.

#![warn(missing_docs)]

pub mod encryption;
pub mod identify;
pub mod secure_restore;
pub mod shamir;

pub(crate) mod conv;

use icod_crypto::encryption::KEY_SIZE;
pub use identify::{identify, alter_chunks_name};
pub use secure_restore::{restore_message, secure_message};

pub(crate) fn parse_key(key: Vec<u8>) -> Result<[u8; KEY_SIZE], ()> {
  let mut out = [0u8; KEY_SIZE];
  if key.len() != KEY_SIZE {
    return Err(());
  }
  out.copy_from_slice(&key);
  Ok(out)
}

/// Regular `String` for tests.
#[cfg(test)]
pub type JsValueOrString = String;
/// String `JsValue` for WASM-bindgen compatibility.
#[cfg(not(test))]
pub type JsValueOrString = wasm_bindgen::JsValue;
