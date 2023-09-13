//! A set of crypto primitives to be used as a library in the frontend.

#![warn(missing_docs)]

use std::ops::Deref;

use encryption::EncryptedMessage;

pub mod encryption;
pub mod shamir;

/// A top-level purpose of the crate: encrypt given message and apply given SSS configuration
/// to split the key into chunks.
///
/// The method will do the following:
/// 1. Generate a random encryption key.
/// 2. Encrypt given message with the freshly generated key.
/// 3. Split the key into chunks according to given configuration.
/// 4. Return the encrypted message and a vector of resulting chunks.
pub fn secure_message(
  mut message: encryption::Message,
  chunks_configuration: shamir::ChunksConfiguration,
) -> Result<(EncryptedMessage, Vec<shamir::Chunk>), encryption::Error> {
  let key = encryption::MessageEncryptionKey::generate();
  let encrypted = encryption::encrypt_message(&key, &message)?;
  message.wipe();
  let chunks = shamir::split_into_chunks(key, chunks_configuration);

  Ok((encrypted, chunks))
}

/// An error during message restoration process.
#[derive(Debug, Clone, Copy, PartialEq, Eq, thiserror::Error)]
pub enum RestorationError {
  /// Key recovery error.
  #[error("The could not be recovered from given chunks.")]
  Recovery(#[from] shamir::KeyRecoveryError),
  /// Message decryption error.
  #[error("The message could not have been decrypted.")]
  Decryption(#[from] encryption::Error),
}

/// Restoring a message given the encrypted bytes and chunks required to recover the key.
///
/// The method will do the following:
/// 1. Attempt to recover the key from given chunks.
/// 2. Use the key to decrypt the provided encrypted message.
pub fn restore_message(
  encrypted_message: encryption::EncryptedMessage,
  chunks: Vec<shamir::Chunk>,
) -> Result<encryption::Message, RestorationError> {
  let key = shamir::recover_key(&chunks)?;
  let message = encryption::decrypt_message(&key, &encrypted_message)?;

  Ok(message)
}

/// Write zeros into given slice to wipe out the previous content.
///
/// TODO [ToDr] use zeroize crate and copy the notes from there.
pub(crate) fn wipe(slice: &mut [u8]) {
  slice.fill(0)
}

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

  /// Wipe out the data.
  ///
  /// The `Bytes` struct will end up holding a vector of zeroes that
  /// has the same lenght as the original vector.
  pub(crate) fn wipe(&mut self) {
    wipe(&mut self.data)
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
  use pretty_assertions::assert_eq;

  #[test]
  fn should_format_hash() {
    let hash = Hash {
      data: [0u8; HASH_SIZE],
    };
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

  #[test]
  fn should_secure_the_message() {
    let str_message = "Hello World!";
    let message = encryption::Message::from_str(str_message);
    let chunks_configuration = shamir::ChunksConfiguration::new(3, 2).unwrap();
    let (encrypted, mut chunks) = secure_message(message, chunks_configuration).unwrap();

    assert_eq!(chunks.len(), 5);

    // attempt to decrypt
    chunks.truncate(3);
    let restored = restore_message(encrypted, chunks).unwrap();

    assert_eq!(restored, encryption::Message::from_str(str_message));
  }
}
