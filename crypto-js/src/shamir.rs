use icod_crypto::encryption::MessageEncryptionKey;
use icod_crypto::shamir::KeyRecoveryError;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;

#[wasm_bindgen]
#[derive(Debug)]
pub enum SplittingError {
  InvalidKeySize,
  ConfigurationError,
}

impl From<SplittingError> for JsValue {
  fn from(value: SplittingError) -> Self {
    JsValue::from_str(&format!("{:?}", value))
  }
}

#[wasm_bindgen]
#[derive(Debug)]
pub enum RecoveryError {
  ChunkDecodingError,
  InconsistentChunks,
  InconsistentConfiguration,
  NotEnoughChunks,
  UnexpectedKey,
  KeyDecodingError,
}

impl From<RecoveryError> for JsValue {
  fn from(value: RecoveryError) -> Self {
    JsValue::from_str(&format!("{:?}", value))
  }
}

impl From<KeyRecoveryError> for RecoveryError {
  fn from(value: KeyRecoveryError) -> Self {
    match value {
      KeyRecoveryError::InconsistentChunks => Self::InconsistentChunks,
      KeyRecoveryError::InconsistentConfiguration => Self::InconsistentConfiguration,
      KeyRecoveryError::NotEnoughChunks => Self::NotEnoughChunks,
      KeyRecoveryError::UnexpectedKey => Self::UnexpectedKey,
      KeyRecoveryError::KeyDecodingError => Self::KeyDecodingError,
    }
  }
}

impl From<conv::Error> for RecoveryError {
  fn from(_: conv::Error) -> Self {
    Self::ChunkDecodingError
  }
}

#[wasm_bindgen]
pub struct ChunksConfiguration {
  pub required: u8,
  pub spare: u8,
}

impl ChunksConfiguration {
    pub(crate) fn to_icod(self) -> Result<
        icod_crypto::shamir::ChunksConfiguration,
        (),
    > {
        icod_crypto::shamir::ChunksConfiguration::new(
            self.required,
            self.spare,
        )
    }
}

#[wasm_bindgen]
pub fn split_into_chunks(
  key: Vec<u8>,
  configuration: ChunksConfiguration,
) -> Result<Vec<JsValue>, SplittingError> {
  let key = crate::parse_key(key)
      .map_err(|_| SplittingError::InvalidKeySize)?;
  let key = MessageEncryptionKey::new(key);
  let chunks_configuration = configuration.to_icod()
      .map_err(|_| SplittingError::ConfigurationError)?;
  let chunks = icod_crypto::shamir::split_into_chunks(key, chunks_configuration);

  Ok(conv::chunks_to_js(chunks))
}

pub const CHUNK_PREFIX: &'static str = "icod-chunk:";

pub(crate) mod conv {
  #[derive(Debug)]
  pub enum Error {
    ValueError,
    HexError,
    PrefixError,
  }

  use super::{JsValue, CHUNK_PREFIX, RecoveryError};

  pub fn bytes_to_str(prefix: &'static str, b: Vec<u8>) -> String {
      format!("{}{}", prefix, hex::encode(b))
  }

  pub fn bytes_to_js(prefix: &'static str, b: Vec<u8>) -> JsValue {
    JsValue::from_str(&bytes_to_str(prefix, b))
  }

  pub fn js_to_bytes(prefix: &'static str, v: JsValue) -> Result<Vec<u8>, Error> {
    let s = v.as_string().ok_or(Error::ValueError)?;
    let rest = s.strip_prefix(prefix).ok_or(Error::PrefixError)?;
    hex::decode(&rest).map_err(|_| Error::HexError)
  }

    pub fn chunks_to_js(chunks: Vec<icod_crypto::shamir::Chunk>) -> Vec<JsValue> {
        chunks
            .into_iter()
            .map(|chunk| bytes_to_js(CHUNK_PREFIX, chunk.encode().into()))
            .collect()
    }

    pub fn js_to_chunks(chunks: Vec<JsValue>) -> Result<
        Vec<icod_crypto::shamir::Chunk>,
        RecoveryError,
    > {
        chunks
        .into_iter()
        .map(|val| {
          js_to_bytes(CHUNK_PREFIX, val)
            .map_err(RecoveryError::from)
            .and_then(|v| {
              icod_crypto::shamir::Chunk::decode(&v).map_err(|_| RecoveryError::ChunkDecodingError)
            })
        })
        .collect()
    }

}

#[wasm_bindgen]
pub fn recover_key(chunks: Vec<JsValue>) -> Result<Vec<u8>, RecoveryError> {
  let chunks = conv::js_to_chunks(chunks)?;
  let key = icod_crypto::shamir::recover_key(&chunks)?;

  Ok(key.encode().into())
}
