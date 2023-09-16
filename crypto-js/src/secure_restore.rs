//! High-level secure & restore message functions.

use crate::encryption::{self, MSG_PREFIX};
use crate::shamir::{self, CHUNK_PREFIX};
use crate::JsValueOrString;
#[cfg(not(test))]
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;

/// A tuple containing the encrypted message splitted into parts and Shamir's
/// chunks of the key used for encryption.
///
/// Both the message parts and chunks are prefixed with a human-readable
/// sequence and the bytes are encoded using `BASE32_DNSSEC` encoding.
#[derive(serde::Serialize)]
pub struct MessageAndChunks {
  /// The parts of the encrypted message.
  pub encrypted_message: Vec<String>,
  /// The SSS chunks.
  pub chunks: Vec<String>,
}

/// An error occuring during securing the message.
#[derive(Debug)]
pub enum SecuringError {
  /// The chunks configuration is invalid.
  InvalidChunksConfiguration,
  /// The encryption was unsuccessful.
  Encryption(encryption::Error),
}

impl From<encryption::Error> for SecuringError {
  fn from(value: encryption::Error) -> Self {
    Self::Encryption(value)
  }
}

impl From<SecuringError> for JsValue {
  fn from(value: SecuringError) -> Self {
    JsValue::from_str(&format!("{:?}", value))
  }
}

/// `MessageAndChunks` serde-encoded `JsValue` object.
#[cfg(not(test))]
pub type SecureMessageResult = JsValue;
/// Regular `MessageAndChunks` type for tests.
#[cfg(test)]
pub type SecureMessageResult = MessageAndChunks;

/// Secure given message by randomly selecting an encryption key,
/// encrypting the message and splitting the key using Shamir Secret Sharing
/// scheme with given configuration.
///
/// The resulting encrypted message may also be split into multiple parts
/// using `split` parameter to make sure it can fit into QR codes.
#[cfg_attr(not(test), wasm_bindgen)]
pub fn secure_message(
  msg: String,
  split: Option<usize>,
  chunks_configuration: shamir::ChunksConfiguration,
) -> Result<SecureMessageResult, SecuringError> {
  let msg = icod_crypto::encryption::Message::from_str(&msg);
  let chunks_configuration = chunks_configuration
    .to_icod()
    .map_err(|_| SecuringError::InvalidChunksConfiguration)?;
  let (encrypted_message, chunks) =
    icod_crypto::secure_message(msg, chunks_configuration).map_err(encryption::Error::from)?;

  let chunks = chunks
    .into_iter()
    .map(|chunk| crate::conv::bytes_to_prefixed_str(CHUNK_PREFIX, chunk.encode().into()))
    .collect();

  let encrypted_message = encrypted_message.split_and_encode(split);
  let encrypted_message = encrypted_message
    .into_iter()
    .map(|msg| crate::conv::bytes_to_prefixed_str(MSG_PREFIX, msg.into()))
    .collect();
  let result = MessageAndChunks {
    encrypted_message,
    chunks,
  };
  #[cfg(not(test))]
  return Ok(
    serde_wasm_bindgen::to_value(&result).expect("MessageAndChunks serialization is infallible"),
  );
  #[cfg(test)]
  Ok(result)
}

/// An error occuring during restoration process.
#[derive(Debug)]
pub enum RestorationError {
  /// The SSS key-recovery error.
  Recovery(shamir::RecoveryError),
  /// Error during decryption process.
  Decryption(encryption::Error),
}

impl From<shamir::RecoveryError> for RestorationError {
  fn from(value: shamir::RecoveryError) -> Self {
    Self::Recovery(value)
  }
}

impl From<icod_crypto::RestorationError> for RestorationError {
  fn from(value: icod_crypto::RestorationError) -> Self {
    match value {
      icod_crypto::RestorationError::Recovery(err) => Self::Recovery(err.into()),
      icod_crypto::RestorationError::Decryption(err) => Self::Decryption(err.into()),
    }
  }
}

impl From<encryption::Error> for RestorationError {
  fn from(value: encryption::Error) -> Self {
    Self::Decryption(value)
  }
}

impl From<RestorationError> for JsValue {
  fn from(value: RestorationError) -> Self {
    JsValue::from_str(&format!("{:?}", value))
  }
}

/// Restore the original message given parts of the encrypted message and SSS chunks.
#[cfg_attr(not(test), wasm_bindgen)]
pub fn restore_message(
  message: Vec<JsValueOrString>,
  chunks: Vec<JsValueOrString>,
) -> Result<String, RestorationError> {
  let message = encryption::conv::js_to_msg_parts(message).map_err(encryption::Error::from)?;
  let encrypted_message = icod_crypto::encryption::EncryptedMessage::collate_from_parts(message)
    .map_err(encryption::Error::from)?;
  let chunks = shamir::conv::js_to_chunks(chunks)?;
  let message = icod_crypto::restore_message(encrypted_message, chunks)?;
  let (message, _) = message.into_tuple();
  Ok(String::from_utf8_lossy(&message).to_string())
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::shamir::ChunksConfiguration;
  use pretty_assertions::assert_eq;

  #[test]
  fn should_secore_and_restore_message() {
    let msg = "This is a secret message";
    let split = Some(368);
    let chunks_configuration = ChunksConfiguration {
      required: 1,
      spare: 1,
    };
    let result = secure_message(msg.to_owned(), split, chunks_configuration).unwrap();

    assert_eq!(result.encrypted_message.len(), 1);
    assert_eq!(
      &result.encrypted_message[0][..39],
      "icod-msg:00000000000r1acbsgf0rctmnne11a"
    );

    assert_eq!(result.chunks.len(), 2);
    assert_eq!(&result.chunks[0][..20], "icod-chunk:d5hmup330");

    let mut result = result;
    let restored = restore_message(result.encrypted_message, result.chunks.split_off(0)).unwrap();

    assert_eq!(restored, msg);
  }
}
