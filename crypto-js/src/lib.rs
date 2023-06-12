use icod_crypto::encryption::{MessageEncryptionKey, Message};
use serde::Serialize;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Debug)]
pub enum Error {
    InvalidKeySize,
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
    let key = {
        let mut out = [0u8; 32];
        if key.len() != 32 {
            return Err(Error::InvalidKeySize)
        }
        out.copy_from_slice(&key);
        out
    };
    let key = MessageEncryptionKey::new(key);
    let msg = Message::from_str(&msg);

    let encrypted = icod_crypto::encryption::encrypt_message(&key, &msg)?;

    let (data, nonce) = encrypted.into_tuple();

    Ok(serde_wasm_bindgen::to_value(&EncryptedMessage {
        data: data.into(),
        nonce: nonce.into(),
    }).expect("EncryptedMessage serialization is infallible"))
}
