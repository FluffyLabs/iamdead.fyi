use icod_crypto::encryption::{Message, MessageEncryptionKey, NONCE_SIZE};
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

#[wasm_bindgen]
pub fn encrypt_message(key: Vec<u8>, msg: String) -> Result<JsValue, Error> {
  let key = crate::parse_key(key).map_err(|_| Error::InvalidKeySize)?;
  let key = MessageEncryptionKey::new(key);
  let msg = Message::from_str(&msg);

  let encrypted = icod_crypto::encryption::encrypt_message(&key, &msg)?;

  let (data, nonce) = encrypted.into_tuple();

  Ok(
    serde_wasm_bindgen::to_value(&EncryptedMessage {
      data: data.into(),
      nonce: nonce.into(),
    })
    .expect("EncryptedMessage serialization is infallible"),
  )
}

#[wasm_bindgen]
pub fn decrypt_message(key: Vec<u8>, data: Vec<u8>, nonce: Vec<u8>) -> Result<Vec<u8>, Error> {
  let nonce = {
    let mut n = [0u8; NONCE_SIZE];
    if nonce.len() != NONCE_SIZE {
        return Err(Error::InvalidNonceSize);
    }
    n.copy_from_slice(&nonce);
    n
  };
  let key = crate::parse_key(key).map_err(|_| Error::InvalidKeySize)?;
  let key = MessageEncryptionKey::new(key);
  let msg = icod_crypto::encryption::EncryptedMessage::new(data, nonce);

  let decrypted = icod_crypto::encryption::decrypt_message(&key, &msg)?;

  let (data, _nonce) = decrypted.into_tuple();
  Ok(data.into())
}
