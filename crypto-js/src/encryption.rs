use icod_crypto::encryption::{Message, MessageEncryptionKey};
use serde::Serialize;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Debug)]
pub enum Error {
  InvalidKeySize,
  InvalidNonceSize,
  VersionError,
  CryptoError,
}

impl From<Error> for JsValue {
  fn from(value: Error) -> Self {
    JsValue::from_str(&format!("{:?}", value))
  }
}

impl From<icod_crypto::encryption::Error> for Error {
  fn from(value: icod_crypto::encryption::Error) -> Self {
    match value {
      icod_crypto::encryption::Error::UnsupportedVersion => Self::VersionError,
      icod_crypto::encryption::Error::EncryptionError => Self::CryptoError,
    }
  }
}

#[derive(Serialize)]
pub struct EncryptedMessage {
  pub data: Vec<u8>,
  pub nonce: Vec<u8>,
}

impl From<icod_crypto::encryption::EncryptedMessage> for EncryptedMessage {
  fn from(value: icod_crypto::encryption::EncryptedMessage) -> Self {
    let (data, nonce) = value.into_tuple();
    Self {
      data: data.into(),
      nonce: nonce.into(),
    }
  }
}

pub(crate) fn encrypted_message_to_js(
  encrypted: icod_crypto::encryption::EncryptedMessage,
) -> JsValue {
  serde_wasm_bindgen::to_value(&EncryptedMessage::from(encrypted))
    .expect("EncryptedMessage serialization is infallible")
}

#[wasm_bindgen]
pub fn encrypt_message(key: Vec<u8>, msg: String) -> Result<JsValue, Error> {
  let key = crate::parse_key(key).map_err(|_| Error::InvalidKeySize)?;
  let key = MessageEncryptionKey::new(key);
  let msg = Message::from_str(&msg);

  let encrypted = icod_crypto::encryption::encrypt_message(&key, &msg)?;

  Ok(encrypted_message_to_js(encrypted))
}

#[wasm_bindgen]
pub fn decrypt_message(key: Vec<u8>, data: Vec<u8>, nonce: Vec<u8>) -> Result<Vec<u8>, Error> {
  let key = crate::parse_key(key).map_err(|_| Error::InvalidKeySize)?;
  let key = MessageEncryptionKey::new(key);
  let nonce = crate::parse_nonce(nonce).map_err(|_| Error::InvalidNonceSize)?;
  let msg = icod_crypto::encryption::EncryptedMessage::new(data, nonce);

  let decrypted = icod_crypto::encryption::decrypt_message(&key, &msg)?;

  let (data, _nonce) = decrypted.into_tuple();
  Ok(data.into())
}
