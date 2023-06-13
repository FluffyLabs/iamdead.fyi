//! A set of crypto primitives to be used as a library in the frontend.
//!
//! # TODO
//! 1. Avoid leaking secure data between JS<>WASM (avoiding intermediary results?)
//! 2. More docs & examples.
//! 3. Tests & fuzzing.
//! 4. Help with nonce prepation?

#![warn(missing_docs)]

use std::ops::Deref;

pub mod encryption;

/// A representation of 32-bytes secure cryptographic hash output.
#[derive(PartialEq, Eq)]
pub struct Hash {
  data: [u8; 32],
}

impl std::fmt::Debug for Hash {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    f.debug_tuple("Hash")
      .field(&hex::encode(&self.data))
      .finish()
  }
}

/// A raw vector of arbitrary-length bytes with additional formatting.
#[derive(Clone, PartialEq, Eq)]
pub struct Bytes {
  data: Vec<u8>,
}

impl Bytes {
  /// Create a new [Bytes] struct by copying bytes from the slice.
  pub fn from_slice(bytes: &[u8]) -> Self {
    Self {
      data: bytes.to_vec(),
    }
  }
}

impl Deref for Bytes {
  type Target = [u8];

  fn deref(&self) -> &Self::Target {
    &*self.data
  }
}

impl From<Vec<u8>> for Bytes {
  fn from(data: Vec<u8>) -> Self {
    Self { data }
  }
}

impl From<Bytes> for Vec<u8> {
  fn from(value: Bytes) -> Self {
    value.data
  }
}

impl std::fmt::Debug for Bytes {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    let hex = hex::encode(&self.data);
    match std::str::from_utf8(&self.data) {
      Ok(s) => write!(f, "String({:?}) == Bytes({:?})", s, hex),
      Err(_) => write!(f, "Bytes({:?})", hex),
    }
  }
}

/*
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ChunksConfiguration {
    pub required: u8,
    pub spare: u8,
}

pub struct Chunk {
    key_hash: Hash,
    chunks_configuration: ChunksConfiguration,
    chunk_index: u8,
    chunk_data: Bytes,
}

pub fn split_into_chunks(_key: MessageEncryptionKey, _chunks: ChunksConfiguration) -> Vec<Chunk> {
    unimplemented!()
}

pub fn restore_key(_chunks: Vec<Chunk>) -> Result<MessageEncryptionKey, ()> {
    unimplemented!()
}
*/

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn should_format_hash() {
    let hash = Hash { data: [0u8; 32] };
    assert_eq!(
      &format!("{:?}", hash),
      "Hash(\"0000000000000000000000000000000000000000000000000000000000000000\")"
    );
  }

  #[test]
  fn should_format_bytes() {
    let bytes = Bytes::from_slice(b"these are str bytes");

    assert_eq!(
      &format!("{:?}", bytes),
      r#"String("these are str bytes") == Bytes("74686573652061726520737472206279746573")"#,
    );
  }
}
