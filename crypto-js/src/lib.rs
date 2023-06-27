pub mod encryption;
pub mod shamir;

use icod_crypto::encryption::{NONCE_SIZE, KEY_SIZE};
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
    pub encrypted_message: encryption::EncryptedMessage,
    pub chunks: Vec<String>,
}

#[wasm_bindgen]
pub fn secure_message(
    msg: String,
    chunks_configuration: shamir::ChunksConfiguration,
) -> Result<JsValue, encryption::Error> {
    let msg = icod_crypto::encryption::Message::from_str(&msg);
    let chunks_configuration = chunks_configuration.to_icod()
        // TODO [ToDr] PRoper error here
        .map_err(|_| encryption::Error::CryptoError)?;
    let (encrypted_message, chunks) = icod_crypto::secure_message(msg, chunks_configuration)?;

    let chunks = chunks
        .into_iter()
        .map(|chunk| shamir::conv::bytes_to_str(shamir::CHUNK_PREFIX, chunk.encode().into()))
        .collect();
    Ok(serde_wasm_bindgen::to_value(&MessageAndChunks {
        encrypted_message: encrypted_message.into(),
        chunks,
    }).expect("MessageAndChunks serialization is infallible"))
}

#[wasm_bindgen]
pub fn restore_message(
    data: Vec<u8>,
    nonce: Vec<u8>,
    chunks: Vec<JsValue>,
) -> Result<Vec<u8>, shamir::RecoveryError> {
    let nonce = parse_nonce(nonce)
        // TODO [ToDr] PRoper error here
        .map_err(|_| shamir::RecoveryError::ChunkDecodingError)?;
    let encrypted_message = icod_crypto::encryption::EncryptedMessage::new(
        data,
        nonce,
    );
    let chunks = shamir::js_to_chunks(chunks)?;
    let message = icod_crypto::restore_message(encrypted_message, chunks)
        // TODO [ToDr] Proper error conversion here
        .map_err(|_| shamir::RecoveryError::InconsistentChunks)?;
    let (message, _) = message.into_tuple();
    Ok(message.into())
}
