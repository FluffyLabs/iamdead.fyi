pub mod encryption;
pub mod shamir;

use icod_crypto::encryption::{KEY_SIZE, NONCE_SIZE};
use wasm_bindgen::{prelude::*, JsValue};

pub(crate) fn parse_key(key: Vec<u8>) -> Result<[u8; KEY_SIZE], ()> {
  let mut out = [0u8; KEY_SIZE];
  if key.len() != KEY_SIZE {
    return Err(());
  }
  out.copy_from_slice(&key);
  Ok(out)
}

pub(crate) fn parse_nonce(nonce: Vec<u8>) -> Result<[u8; NONCE_SIZE], ()> {
  let mut n = [0u8; NONCE_SIZE];
  if nonce.len() != NONCE_SIZE {
    return Err(());
  }
  n.copy_from_slice(&nonce);
  Ok(n)
}

#[derive(serde::Serialize)]
pub struct MessageAndChunks {
  pub encrypted_message: Vec<String>,
  pub chunks: Vec<String>,
}

#[derive(Debug)]
pub enum SecuringError {
  InvalidChunksConfiguration,
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

#[wasm_bindgen]
pub fn secure_message(
  msg: String,
  chunks_configuration: shamir::ChunksConfiguration,
) -> Result<JsValue, SecuringError> {
  let msg = icod_crypto::encryption::Message::from_str(&msg);
  let chunks_configuration = chunks_configuration
    .to_icod()
    .map_err(|_| SecuringError::InvalidChunksConfiguration)?;
  let (encrypted_message, chunks) =
    icod_crypto::secure_message(msg, chunks_configuration).map_err(encryption::Error::from)?;

  let chunks = chunks
    .into_iter()
    .map(|chunk| conv::bytes_to_hex_str(chunk.encode().into()))
    .collect();

  // TODO [ToDr] make it a parameter.
  let split = None;
  let encrypted_message = encrypted_message.encode(split);
  let encrypted_message = encrypted_message
    .into_iter()
    .map(|x| crate::conv::bytes_to_hex_str(x.into()))
    .collect();
  Ok(
    serde_wasm_bindgen::to_value(&MessageAndChunks {
      encrypted_message,
      chunks,
    })
    .expect("MessageAndChunks serialization is infallible"),
  )
}

#[derive(Debug)]
pub enum RestorationError {
  InvalidNonceSize,
  Recovery(shamir::RecoveryError),
  Decryption(encryption::Error),
  DataTooBig,
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

impl From<icod_crypto::encryption::EncryptedMessageError> for RestorationError {
  fn from(_value: icod_crypto::encryption::EncryptedMessageError) -> Self {
    Self::DataTooBig
  }
}

impl From<RestorationError> for JsValue {
  fn from(value: RestorationError) -> Self {
    JsValue::from_str(&format!("{:?}", value))
  }
}

#[wasm_bindgen]
pub fn restore_message(
  data: Vec<u8>,
  nonce: Vec<u8>,
  chunks: Vec<JsValue>,
) -> Result<Vec<u8>, RestorationError> {
  let nonce = parse_nonce(nonce).map_err(|_| RestorationError::InvalidNonceSize)?;
  let encrypted_message = icod_crypto::encryption::EncryptedMessage::new(data, nonce)?;
  let chunks = shamir::conv::js_to_chunks(chunks)?;
  let message = icod_crypto::restore_message(encrypted_message, chunks)?;
  let (message, _) = message.into_tuple();
  Ok(message.into())
}

pub(crate) mod conv {
  use super::JsValue;

  #[derive(Debug)]
  pub enum Error {
    ValueError,
    HexError,
  }

  // TODO [ToDr] how to keep the original byte prefix readable instead of hex-encoded?
  // We would like all the parts to have `icod-xxx:` human-readable prefix,
  // instead of having it attached during `encode` process.
  // Perhaps `encode` could return a tuple?
  pub fn bytes_to_hex_str(b: Vec<u8>) -> String {
    hex::encode(b)
  }

  pub fn bytes_to_hex_js(b: Vec<u8>) -> JsValue {
    JsValue::from_str(&bytes_to_hex_str(b))
  }

  pub fn hex_js_to_bytes(v: JsValue) -> Result<Vec<u8>, Error> {
    let s = v.as_string().ok_or(Error::ValueError)?;
    hex::decode(&s).map_err(|_| Error::HexError)
  }
}
