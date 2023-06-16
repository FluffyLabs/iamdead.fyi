//! A set of crypto primitives to be used as a library in the frontend.
//!
//! # TODO
//! 1. Avoid leaking secure data between JS<>WASM (avoiding intermediary results?)
//! 2. More docs & examples.
//! 3. Tests & fuzzing.

#![warn(missing_docs)]

use std::ops::Deref;

pub mod encryption;
pub mod shamir;


/// Byte size of the hash value.
pub(crate) const HASH_SIZE: usize = 64;

/// A representation of 64-bytes secure cryptographic hash output.
#[derive(Clone, PartialEq, Eq)]
pub struct Hash {
  data: [u8; HASH_SIZE],
}

impl Hash {
    /// Create a new [Hash] given the raw key.
    pub fn new(data: [u8; HASH_SIZE]) -> Self {
        Self { data }
    }

    /// Convert the slice into a [Hash].
    pub fn from_slice(data: &[u8]) -> Result<Self, ()> {
        if data.len() != HASH_SIZE {
            return Err(());
        }

        let mut out = [0u8; HASH_SIZE];
        out.copy_from_slice(&data);
        Ok(Self::new(out))
    }

    /// Copy the hash into raw [Bytes] structure.
    pub fn to_bytes(&self) -> Bytes {
        Bytes::from_slice(&self.data)
    }

    /// View the hash as raw bytes.
    pub(crate) fn as_slice(&self) -> &[u8] {
        &self.data
    }
}

pub(crate) fn blake2b512(input: &[u8]) -> Hash {
  use blake2::{Blake2b512, Digest};
  let mut hasher = Blake2b512::new();
  hasher.update(input);
  let arr = hasher.finalize();
  crate::Hash::from_slice(arr.as_slice()).expect("The blake2b512 output matches KEY_SIZE")
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

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn should_format_hash() {
    let hash = Hash { data: [0u8; HASH_SIZE] };
    assert_eq!(
      &format!("{:?}", hash),
      "Hash(\"00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000\")"
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

  #[test]
  fn should_fail_hash_from_slice_if_length_wrong() {
    assert!(Hash::from_slice(&[]).is_err());
  }
}
