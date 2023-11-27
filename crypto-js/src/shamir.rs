//! Shamir Secret Sharing related functions exposed to JS.

use crate::JsValueOrString;
use icod_crypto::encryption::MessageEncryptionKey;
use icod_crypto::shamir::KeyRecoveryError;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;

/// An error occuring while splitting the key into SSS chunks.
#[derive(Debug)]
pub enum SplittingError {
  /// Provided `key` has invalid byte length.
  InvalidKeySize,
  /// The chunk configuration is incorrect.
  ConfigurationError,
}

impl From<SplittingError> for JsValue {
  fn from(value: SplittingError) -> Self {
    JsValue::from_str(&format!("{:?}", value))
  }
}

/// An error occuring during key recovery from chunks.
#[derive(Debug)]
pub enum RecoveryError {
  /// Cannot decode the chunk.
  ChunkDecodingError(String),
  /// The chunks are not part of the same set.
  InconsistentChunks,
  /// The configuration is not matching between chunks.
  InconsistentConfiguration,
  /// There is not enough chunks to recover the key.
  NotEnoughChunks,
  /// The key does not match the expected hash.
  UnexpectedKey,
  /// The key could not be decoded.
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

impl From<crate::conv::Error> for RecoveryError {
  fn from(e: crate::conv::Error) -> Self {
    Self::ChunkDecodingError(format!("{:?}", e))
  }
}

/// WASM-compatible SSS chunks configuration.
#[wasm_bindgen]
pub struct ChunksConfiguration {
  /// Number of chunks required for recovery.
  pub required: u8,
  /// Number of extra chunks.
  pub spare: u8,
}

#[wasm_bindgen]
impl ChunksConfiguration {
  /// Create new [ChunksConfiguration].
  #[wasm_bindgen(constructor)]
  pub fn new(required: u8, spare: u8) -> Self {
    Self { required, spare }
  }
}

impl ChunksConfiguration {
  pub(crate) fn to_icod(self) -> Result<icod_crypto::shamir::ChunksConfiguration, ()> {
    icod_crypto::shamir::ChunksConfiguration::new(self.required, self.spare)
  }
}

/// Human readable prefix of every chunk.
///
/// Used to identify the string typically obtained by scanning a QR code.
pub const CHUNK_PREFIX: &'static str = "icod-chunk:";

/// Split given `key` into SSS chunks according to `configuration`.
///
/// The `key` should be raw, 32-bytes key. The magic sequence and version
/// will be prepended internally.
#[cfg_attr(not(test), wasm_bindgen)]
pub fn split_into_chunks(
  key: Vec<u8>,
  configuration: ChunksConfiguration,
) -> Result<Vec<JsValueOrString>, SplittingError> {
  let key = crate::parse_key(key).map_err(|_| SplittingError::InvalidKeySize)?;
  let key = MessageEncryptionKey::new(key);
  let chunks_configuration = configuration
    .to_icod()
    .map_err(|_| SplittingError::ConfigurationError)?;
  let chunks = icod_crypto::shamir::split_into_chunks(key, chunks_configuration);

  Ok(conv::chunks_to_js(chunks))
}

/// Recover key given enough SSS chunks.
///
/// The recovered key will be byte-encoded, i.e. it will
/// be prepended with magic sequence and version information.
#[cfg_attr(not(test), wasm_bindgen)]
pub fn recover_key(chunks: Vec<JsValueOrString>) -> Result<Vec<u8>, RecoveryError> {
  let chunks = conv::js_to_chunks(chunks)?;
  let key = icod_crypto::shamir::recover_key(&chunks)?;

  Ok(key.encode().into())
}

pub(crate) mod conv {
  use super::{RecoveryError, CHUNK_PREFIX};
  use crate::JsValueOrString;

  pub fn chunks_to_js(chunks: Vec<icod_crypto::shamir::Chunk>) -> Vec<JsValueOrString> {
    chunks
      .into_iter()
      .map(|chunk| crate::conv::bytes_to_prefixed_str_js(CHUNK_PREFIX, &chunk.encode()))
      .collect()
  }

  pub fn js_to_chunks(
    chunks: Vec<JsValueOrString>,
  ) -> Result<Vec<icod_crypto::shamir::Chunk>, RecoveryError> {
    chunks
      .into_iter()
      .map(|val| {
        crate::conv::prefixed_str_js_to_bytes(CHUNK_PREFIX, val, true)
          .map_err(RecoveryError::from)
          .and_then(|v| {
            icod_crypto::shamir::Chunk::decode(&v)
              .map_err(|e| RecoveryError::ChunkDecodingError(format!("{:?}", e)))
          })
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
  fn should_split_key_into_chunks() {
    let key = [1u8; KEY_SIZE].to_vec();
    let configuration = ChunksConfiguration {
      required: 1,
      spare: 1,
    };

    let chunks = split_into_chunks(key.clone(), configuration).unwrap();

    assert_eq!(chunks.len(), 2);
    assert_eq!(&chunks[0], "icod-chunk:d5hmup3301bt435o7vhlrc2poim1l1dcldpq3b010f8jg34bhm8co8h1rb89iml9htpfhcmtogogifj9ou8k4mve23a63s038ht0uvuafefqkr8l040g00b9cdnm8qo0040g2081040g2081040g2081040g2081040g2081040g2081040g");
    assert_eq!(&chunks[1], "icod-chunk:d5hmup3301bt435o7vhlrc2poim1l1dcldpq3b010f8jg34bhm8co8h1rb89iml9htpfhcmtogogifj9ou8k4mve23a63s038ht0uvuafefqkr8l040g20j9cdnm8qo0040g2081040g2081040g2081040g2081040g2081040g2081040g");

    let mut chunks = chunks;
    let recovered = recover_key(chunks.split_off(1)).unwrap();

    let recovered_no_prefix = recovered.strip_prefix(b"icodk").unwrap();
    let recovered_no_version = &recovered_no_prefix[1..];
    assert_eq!(recovered_no_version, &key);
  }
}
