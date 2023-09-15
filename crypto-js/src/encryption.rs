//! Encryption-related functions exposed to JS.

use crate::JsValueOrString;
use icod_crypto::encryption::{self, Message, MessageEncryptionKey};
use wasm_bindgen::prelude::*;

/// A prefix of every part of the encrypted message.
///
/// The prefix should be human readable and allows the user
/// to identify what the rest of the string is for.
/// Typically this will be obtained by scanning a QR code.
pub const MSG_PREFIX: &'static str = "icod-msg:";

/// An error that happened during encryption or decryption.
#[derive(Debug)]
pub enum Error {
  /// The provided `key` has incorrect byte length.
  InvalidKeySize,
  /// The message could not be decoded.
  MessageDecodingError(String),
  /// The version is invalid.
  VersionError,
  /// Opaque cryptographic error.
  CryptoError,
  /// The data exceeds the maximal supported size.
  DataTooBig,
}

impl From<Error> for JsValue {
  fn from(value: Error) -> Self {
    JsValue::from_str(&format!("{:?}", value))
  }
}

impl From<encryption::Error> for Error {
  fn from(value: encryption::Error) -> Self {
    match value {
      encryption::Error::UnsupportedVersion => Self::VersionError,
      encryption::Error::EncryptionError => Self::CryptoError,
    }
  }
}

impl From<encryption::EncryptedMessageError> for Error {
  fn from(value: encryption::EncryptedMessageError) -> Self {
    use encryption::EncryptedMessageError::*;
    match value {
      DataTooBig => Self::DataTooBig,
      MissingParts | MalformedData(_) | InvalidVersion => {
        Self::MessageDecodingError(format!("{:?}", value))
      }
    }
  }
}

impl From<crate::conv::Error> for Error {
  fn from(e: crate::conv::Error) -> Self {
    Self::MessageDecodingError(format!("{:?}", e))
  }
}

/// Encrypt given `message` using provided `key`.
///
/// The `key` must be a vector containing exactly
/// [KEY_SIZE] bytes (32-bytes for V0).
///
/// The result will be a vector of string `JsValue`s, each
/// containing an encoded part of encrypted message, no
/// longer than given `split` value.
///
/// If `None` for `split` is provided, the result will be single
/// `JsValue` string, containing the entire encrypted message.
#[cfg_attr(not(test), wasm_bindgen)]
pub fn encrypt_message(
  key: Vec<u8>,
  message: String,
  split: Option<usize>,
) -> Result<Vec<JsValueOrString>, Error> {
  let key = crate::parse_key(key).map_err(|_| Error::InvalidKeySize)?;
  let key = MessageEncryptionKey::new(key);
  let message = Message::from_str(&message);

  let encrypted = encryption::encrypt_message(&key, &message)?;
  let encoded = encrypted.split_and_encode(split);
  Ok(conv::msg_parts_to_js(encoded))
}

/// Decrypt given `data` using provided `key`.
///
/// - `key` must be exactly [KEY_SIZE] bytes (32-bytes for V0).
/// - `data` is arbitrary length encrypted message.
/// - `nonce` must be exactly [NONCE_SIZE] bytes (12-bytes).
///
/// The result will be the decrypted message as a string `JsValue`.
#[cfg_attr(not(test), wasm_bindgen)]
pub fn decrypt_message(key: Vec<u8>, message_parts: Vec<JsValueOrString>) -> Result<String, Error> {
  let key = crate::parse_key(key).map_err(|_| Error::InvalidKeySize)?;
  let key = MessageEncryptionKey::new(key);
  let parts = conv::js_to_msg_parts(message_parts)?;
  let msg = encryption::EncryptedMessage::collate_from_parts(parts)?;
  let decrypted = encryption::decrypt_message(&key, &msg)?;
  let (data, _nonce) = decrypted.into_tuple();
  Ok(String::from_utf8_lossy(&data).to_string())
}

mod conv {
  use super::*;

  pub(crate) fn msg_parts_to_js(encoded: Vec<icod_crypto::Bytes>) -> Vec<JsValueOrString> {
    encoded
      .into_iter()
      .map(|msg| crate::conv::bytes_to_prefixed_str_js(MSG_PREFIX, msg.into()))
      .collect()
  }

  pub(crate) fn js_to_msg_parts(
    parts: Vec<JsValueOrString>,
  ) -> Result<Vec<icod_crypto::Bytes>, crate::conv::Error> {
    parts
      .into_iter()
      .map(|part| {
        crate::conv::prefixed_str_js_to_bytes(MSG_PREFIX, part).map(icod_crypto::Bytes::from)
      })
      .collect()
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use icod_crypto::encryption::KEY_SIZE;
  use pretty_assertions::assert_eq;

  #[test]
  fn should_encrypt_and_decrypt_a_message() {
    let key = [1u8; KEY_SIZE].to_vec();
    let message = "This is a secret message.";
    let encrypted = encrypt_message(key.clone(), message.to_owned(), Some(20)).unwrap();
    assert_eq!(encrypted.len(), 3);
    assert_eq!(
      &encrypted[0],
      "icod-msg:00000000001htf0sd658f3aqpvsfa8fkjuu573u45re0"
    );
    assert_eq!(
      &encrypted[1],
      "icod-msg:00000080001tbm5l7hd2ki6scpjo5sg21q44vp8n7vk0"
    );
    assert_eq!(&encrypted[2], "icod-msg:000000g0001sh18v1ft00a9c3lerflva");

    let original = decrypt_message(key, encrypted).unwrap();
    assert_eq!(original, message);
  }
}
