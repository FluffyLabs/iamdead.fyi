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
#[wasm_bindgen]
#[derive(Debug)]
pub enum Error {
  /// The provided `key` has incorrect byte length.
  InvalidKeySize,
  /// The message could not be decoded.
  MessageDecodingError,
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
    match value {
      encryption::EncryptedMessageError::DataTooBig => Self::DataTooBig,
      // TODO [ToDr] Better errors
      encryption::EncryptedMessageError::MissingParts => Self::MessageDecodingError,
      encryption::EncryptedMessageError::MalformedData => Self::MessageDecodingError,
      encryption::EncryptedMessageError::InvalidVersion => Self::MessageDecodingError,
    }
  }
}

impl From<crate::conv::Error> for Error {
  fn from(_: crate::conv::Error) -> Self {
    // TODO [ToDr] Pass more useful info somehow.
    Self::MessageDecodingError
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
pub fn decrypt_message(
  key: Vec<u8>,
  message_parts: Vec<JsValueOrString>,
) -> Result<JsValueOrString, Error> {
  let key = crate::parse_key(key).map_err(|_| Error::InvalidKeySize)?;
  let key = MessageEncryptionKey::new(key);
  let parts = conv::js_to_msg_parts(message_parts)?;
  let msg = encryption::EncryptedMessage::collate_from_parts(parts)?;
  let decrypted = encryption::decrypt_message(&key, &msg)?;

  let (data, _nonce) = decrypted.into_tuple();
  Ok(crate::conv::bytes_to_str_js(data.into()))
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
    let message = "This is an secret message.".to_owned();
    let encrypted = encrypt_message(key, message, Some(20)).unwrap();
    assert_eq!(encrypted.len(), 3);
    assert_eq!(
      &encrypted[0],
      "icod-msg:00000000001feorqc9gbe9fpouedo17cbpeg1vmvmb00"
    );
    assert_eq!(
      &encrypted[1],
      "icod-msg:0000008000179aortamitnj1fjta1udqp6dipsc5c2l0"
    );
    assert_eq!(&encrypted[2], "icod-msg:000000g0001222nonhbn1fdmo2nsvann6s");

    // TODO [ToDr] add test for decrypting the message
    assert_eq!(true, false)
  }
}
