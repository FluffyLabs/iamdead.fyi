use icod_crypto::encryption::{Message, MessageEncryptionKey};
use wasm_bindgen::prelude::*;

pub const MSG_PREFIX: &'static str = "icod-msg:";

#[wasm_bindgen]
#[derive(Debug)]
pub enum Error {
  InvalidKeySize,
  InvalidNonceSize,
  VersionError,
  CryptoError,
  DataTooBig,
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

impl From<icod_crypto::encryption::EncryptedMessageError> for Error {
  fn from(_value: icod_crypto::encryption::EncryptedMessageError) -> Self {
    Self::DataTooBig
  }
}
#[wasm_bindgen]
pub fn encrypt_message(
  key: Vec<u8>,
  msg: String,
  split: Option<usize>,
) -> Result<Vec<JsValue>, Error> {
  let key = crate::parse_key(key).map_err(|_| Error::InvalidKeySize)?;
  let key = MessageEncryptionKey::new(key);
  let msg = Message::from_str(&msg);

  let encrypted = icod_crypto::encryption::encrypt_message(&key, &msg)?;

  let encoded = encrypted.encode(split);
  Ok(
    encoded
      .into_iter()
      .map(|msg| crate::conv::bytes_to_prefixed_str_js(MSG_PREFIX, msg.into()))
      .collect(),
  )
}

#[wasm_bindgen]
pub fn decrypt_message(key: Vec<u8>, data: Vec<u8>, nonce: Vec<u8>) -> Result<Vec<u8>, Error> {
  let key = crate::parse_key(key).map_err(|_| Error::InvalidKeySize)?;
  let key = MessageEncryptionKey::new(key);
  let nonce = crate::parse_nonce(nonce).map_err(|_| Error::InvalidNonceSize)?;
  let msg = icod_crypto::encryption::EncryptedMessage::new(data, nonce)?;

  let decrypted = icod_crypto::encryption::decrypt_message(&key, &msg)?;

  let (data, _nonce) = decrypted.into_tuple();
  Ok(data.into())
}

#[cfg(test)]
mod tests {
  #[test]
  fn should_format_encrypted_message() {
    // TODO [ToDr] Write tests for encrypted messages encoding
    // and chunks after switching to BASE64.
    assert_eq!(true, false)
  }
}
