//! Shamir Secret Sharing.
//!
//! The crate wraps a Shamir Secret Sharing library into an
//! ICOD-specific API.
//!
//! The idea is to split the [MessageEncryptionKey] into multiple
//! chunks represented as [Chunk] type. The premise of SSS
//! is that you need at least `N` required chunks out of all `N+S`
//! generated chunks to recover the original key. None of
//! the chunks should leak any information on it's own, also any
//! combination of `N-1` chunks should not leak any information.
//!
//! Every [Chunk] is versioned to provide backward-compatibility
//! in case of any changes. Also we bundle a bunch of additional
//! information with the chunk to improve User Experience.

use crate::encryption::MessageEncryptionKey;
use crate::{blake2b512, encryption, Bytes, Hash, HASH_SIZE};

/// A configuration of the Shamir Secret Sharing split.
///
/// A total number of chunks is equal to `required + spare`
/// and any `required` number of chunks is sufficient to
/// recover the original key.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ChunksConfiguration {
  /// Number of chunks required to recover the key.
  required: u8,
  /// Number of additional chunks that we generate.
  spare: u8,
}

impl ChunksConfiguration {
  /// Creates a new [ChunksConfiguration].
  ///
  /// The method will return a `()` error in case `required` is `0` or
  /// when total number of shares exceeds 255.
  ///
  /// NOTE That in case `required == 1` the chunks will contain the private key
  /// directly.
  pub fn new(required: u8, spare: u8) -> Result<Self, ()> {
    if required == 0 || required + spare >= 255 {
      Err(())
    } else {
      Ok(Self { required, spare })
    }
  }

  /// Returns required number of generated chunks.
  pub fn required(&self) -> usize {
    self.required as usize
  }

  /// Returns total number of generated chunks.
  ///
  /// The method returns `usize` type to avoid overflows.
  pub fn total(&self) -> usize {
    self.required as usize + self.spare as usize
  }
}

/// A representation of chunk versioning.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ChunkVersion {
  /// Version V0 - SSS using `gf256` library.
  V0,
}

/// A single [Chunk] obtained from [split_into_chunks] function.
///
/// The chunks represents one piece that can be used to recover the
/// original key, provided there is sufficient chunks.
///
/// There is additional information attached to every chunk to allow
/// simpler identification of encoded chunks seen in the wild.
///
/// Particularly the goal is:
/// 1. To identify if the chunks are parts of the same key.
/// 2. To identify individual chunks (mapping to recipients).
/// 3. To identify the number of required chunks to attempt restoration.
#[derive(Debug)]
pub struct Chunk {
  version: ChunkVersion,
  key_hash: Hash,
  chunks_configuration: ChunksConfiguration,
  chunk_index: u8,
  chunk_data: Bytes,
}

/// A specific byte sequence used to identify the encoding of [Chunk].
///
/// The encoding of [Chunk] is simply a concatentaion of the magic sequence and the rest
/// of the fields of [Chunk] struct in the order they are declared.
pub const CHUNK_ENCODING_MAGIC_SEQUENCE: &'static [u8] = b"icod-chunk:";

impl Chunk {
  /// Create a new [Chunk] providing it's index, data configuration and hash of the key.
  pub fn new(
    chunk_index: u8,
    chunk_data: impl Into<Bytes>,
    chunks_configuration: ChunksConfiguration,
    key_hash: Hash,
  ) -> Self {
    Self {
      version: ChunkVersion::V0,
      key_hash,
      chunks_configuration,
      chunk_index,
      chunk_data: chunk_data.into(),
    }
  }

  /// Attempt to decode a [Chunk] from given bytes slice.
  pub fn decode(data: &[u8]) -> Result<Self, ChunkDecodingError> {
    fn split_at(s: &[u8], at: usize) -> Result<(&[u8], &[u8]), ChunkDecodingError> {
      if s.len() < at {
        Err(ChunkDecodingError::NotEnoughData)
      } else {
        Ok(s.split_at(at))
      }
    }

    let data = data
      .strip_prefix(CHUNK_ENCODING_MAGIC_SEQUENCE)
      .ok_or(ChunkDecodingError::MissingMagicBytes)?;
    let version = [0u8];
    let data = data
      .strip_prefix(&version)
      .ok_or(ChunkDecodingError::InvalidVersion)?;
    let (key, data) = split_at(&data, HASH_SIZE)?;
    let key_hash = Hash::from_slice(&key).map_err(|_| ChunkDecodingError::NotEnoughData)?;
    let (conf, data) = split_at(data, 2)?;
    let chunks_configuration = ChunksConfiguration::new(conf[0], conf[1])
      .map_err(|_| ChunkDecodingError::InvalidConfiguration)?;

    let (&chunk_index, data) = data
      .split_first()
      .ok_or(ChunkDecodingError::NotEnoughData)?;
    let chunk_data = Bytes::from_slice(data);
    if chunk_data.is_empty() {
      return Err(ChunkDecodingError::NotEnoughData);
    }

    Ok(Self {
      version: ChunkVersion::V0,
      key_hash,
      chunk_index,
      chunk_data,
      chunks_configuration,
    })
  }

  /// Encode the key into a vector of bytes.
  ///
  /// The encoding has a magic sequence prepended for identification.
  pub fn encode(&self) -> Bytes {
    let version = match self.version {
      ChunkVersion::V0 => 0u8,
    };
    let mut out = vec![];
    out.extend_from_slice(CHUNK_ENCODING_MAGIC_SEQUENCE);
    out.push(version);
    out.extend_from_slice(self.key_hash.as_slice());
    out.push(self.chunks_configuration.required);
    out.push(self.chunks_configuration.spare);
    out.push(self.chunk_index);
    out.extend_from_slice(&*self.chunk_data);
    Bytes::from(out)
  }

  /// Return the hash of the key the chunk is for.
  pub fn key_hash(&self) -> &Hash {
    &self.key_hash
  }

  /// Return the configuration of the splitting setup.
  pub fn configuration(&self) -> ChunksConfiguration {
    self.chunks_configuration
  }

  /// Return this chunk index.
  pub fn index(&self) -> u8 {
    self.chunk_index
  }

  /// Return the chunk data.
  pub fn data(&self) -> &Bytes {
    &self.chunk_data
  }
}

/// Split given key into a series of SSS chunks according to given [ChunksConfiguration].
///
/// This method returns a vector of [Chunk] objects. The number of elements
/// equals the total of `required` and `spare` chunks from the configuration.
///
/// The chunks can later be used to recover the original key
/// using [recover_key] function.
///
/// NOTE in case the number of `required` chunks is `1` the [Chunk] data will
/// simply be the key!
pub fn split_into_chunks(
  key: MessageEncryptionKey,
  chunks_configuration: ChunksConfiguration,
) -> Vec<Chunk> {
  let shares = chunks_configuration.total();
  let required = chunks_configuration.required();
  if required == 0 {
    panic!("Invalid number of required shares!");
  }

  let payload = key.encode();
  let key_hash = crate::blake2b512(&payload);
  let chunks = gf256::shamir::shamir::generate(&payload, shares, required);

  chunks
    .into_iter()
    .enumerate()
    .map(|(idx, x)| Chunk::new(idx as u8, x, chunks_configuration, key_hash.clone()))
    .collect()
}

/// The error which may occur during key restoration.
#[derive(Debug, Clone, Copy, PartialEq, Eq, thiserror::Error)]
pub enum KeyRecoveryError {
  /// The chunks are does not have the same `key_hash`.
  #[error("The chunks can't be used to recover one key.")]
  InconsistentChunks,

  /// The chunks have inconsistent configuration.
  ///
  /// This should not happen if the `key_hash` is the same,
  /// since we recommend generating unique key, but we still
  /// need to check that.
  #[error("The chunks have incosistent configurations.")]
  InconsistentConfiguration,

  /// We have less chunks than the configuration states is `required`.
  #[error("Not enough chunks to recover the key.")]
  NotEnoughChunks,

  /// We recovered something, but the key hash does not match the expected one.
  #[error("The recovered key is not the one expected.")]
  UnexpectedKey,

  /// The key was recovered successfuly and matched the expected hash, but the
  /// payload couldn't be decoded into [MessageEncryptionKey] structure.
  ///
  /// This should rather never happen in reality, but we still perform t.unwrap(he checks.
  #[error("The recovered key is not usable.")]
  KeyDecodingError,
}

impl From<encryption::KeyDecodingError> for KeyRecoveryError {
  fn from(_value: encryption::KeyDecodingError) -> Self {
    #[cfg(feature = "tracing")]
    tracing::error!("Cannot decode recovered key: {:?}", _value);
    Self::KeyDecodingError
  }
}

/// The error which may occur during chunk restoration.
#[derive(Debug, Clone, Copy, PartialEq, Eq, thiserror::Error)]
pub enum ChunkDecodingError {
  /// The byte input is missing [CHUNK_ENCODING_MAGIC_SEQUENCE] prefix.
  #[error("Given data does not look like a chunk.")]
  MissingMagicBytes,

  /// The byte input has invalid version identifier.
  #[error("The version of the chunk is invalid.")]
  InvalidVersion,

  /// The chunk does not have enough bytes to complete decoding.
  #[error("The chunk has not enough data.")]
  NotEnoughData,

  /// The configuration stored in the chunk is not correct.
  #[error("The chunk configuration is incorrect.")]
  InvalidConfiguration,
}

/// Given a slice of [Chunk]s recover the original key.
///
/// Note that it's enough to provide at least `required` number of chunks
/// to recover the key. The chunks order also does not matter.
///
/// We do check however if all of the chunks have the same configuration
/// and claim to be part of the same key recovery chunks (via `key_hash`).
///
/// Obviously these [Chunk]s are easy to spoof (via decoding mechanism),
/// but the checks are there mostly to improve the user experience in the happy case.
pub fn recover_key(chunks: &[Chunk]) -> Result<MessageEncryptionKey, KeyRecoveryError> {
  let first = chunks.first().ok_or(KeyRecoveryError::NotEnoughChunks)?;
  let configuration = first.configuration();

  // First let's make sure that the chunks are coming from the same set
  // and we have enough of them.
  for chunk in &chunks[1..] {
    if configuration != chunk.configuration() {
      return Err(KeyRecoveryError::InconsistentConfiguration);
    }
    if first.key_hash() != chunk.key_hash() {
      return Err(KeyRecoveryError::InconsistentChunks);
    }
  }

  if chunks.len() < configuration.required() {
    return Err(KeyRecoveryError::NotEnoughChunks);
  }

  let raw_chunks = {
    let mut raw_chunks = Vec::with_capacity(chunks.len());
    raw_chunks.extend(chunks.iter().map(|c| &**c.data()));
    raw_chunks
  };

  let key = gf256::shamir::shamir::reconstruct(&raw_chunks);
  let key_hash = blake2b512(&*key);

  if &key_hash != first.key_hash() {
    return Err(KeyRecoveryError::UnexpectedKey);
  }

  Ok(MessageEncryptionKey::decode(&key)?)
}

#[cfg(test)]
mod tests {
  use crate::encryption::EncryptionKeyVersion;

  use super::*;

  #[test]
  fn should_produce_chunks_and_recover_the_key() {
    let raw_key = [1u8; 32];
    let encoded = MessageEncryptionKey::new(raw_key.clone()).encode();
    let key = MessageEncryptionKey::new(raw_key);
    let chunks = ChunksConfiguration::new(4, 3).unwrap();

    // when
    let chunks = split_into_chunks(key, chunks);
    let recovered_key = recover_key(&chunks[0..4]).unwrap();

    // then
    assert_eq!(encoded, Bytes::from(recovered_key.encode()));
  }

  #[test]
  fn split_into_chunks_extreme_values() {
    let raw_key = [1u8; 32];
    {
      let key1 = MessageEncryptionKey::new(raw_key.clone());
      let conf1 = ChunksConfiguration {
        required: 1,
        spare: 0,
      };
      let chunks1 = split_into_chunks(key1, conf1);
      assert_eq!(chunks1.len(), 1);
      assert_eq!(
        format!("{:?}", chunks1[0]),
        r#"Chunk { version: V0, key_hash: Hash("aaf784588d21f3be1a1c4992766dd27a35baf6b09828b44ea99627eac8a1e7304acf64f2a6d458a1fcef30bdba88f54d05cddbc614fc2c4b4e03cb15f54070b2"), chunks_configuration: ChunksConfiguration { required: 1, spare: 0 }, chunk_index: 0, chunk_data: String("\u{1}icod-key:\0\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}") == Bytes("0169636f642d6b65793a000101010101010101010101010101010101010101010101010101010101010101") }"#
      );
    }

    {
      let key1 = MessageEncryptionKey::new(raw_key.clone());
      let conf1 = ChunksConfiguration {
        required: 1,
        spare: 1,
      };
      let chunks1 = split_into_chunks(key1, conf1);
      assert_eq!(chunks1.len(), 2);
      assert_eq!(
        format!("{:?}", chunks1[0]),
        r#"Chunk { version: V0, key_hash: Hash("aaf784588d21f3be1a1c4992766dd27a35baf6b09828b44ea99627eac8a1e7304acf64f2a6d458a1fcef30bdba88f54d05cddbc614fc2c4b4e03cb15f54070b2"), chunks_configuration: ChunksConfiguration { required: 1, spare: 1 }, chunk_index: 0, chunk_data: String("\u{1}icod-key:\0\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}") == Bytes("0169636f642d6b65793a000101010101010101010101010101010101010101010101010101010101010101") }"#
      );
      assert_eq!(
        format!("{:?}", chunks1[1]),
        r#"Chunk { version: V0, key_hash: Hash("aaf784588d21f3be1a1c4992766dd27a35baf6b09828b44ea99627eac8a1e7304acf64f2a6d458a1fcef30bdba88f54d05cddbc614fc2c4b4e03cb15f54070b2"), chunks_configuration: ChunksConfiguration { required: 1, spare: 1 }, chunk_index: 1, chunk_data: String("\u{2}icod-key:\0\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}") == Bytes("0269636f642d6b65793a000101010101010101010101010101010101010101010101010101010101010101") }"#
      );
    }
  }

  #[test]
  #[should_panic]
  fn should_panic_in_case_of_required_0() {
    let raw_key = [1u8; 32];
    let key2 = MessageEncryptionKey::new(raw_key);
    let conf2 = ChunksConfiguration {
      required: 0,
      spare: 0,
    };
    let chunks2 = split_into_chunks(key2, conf2);
    assert_eq!(chunks2.len(), 0);
  }

  #[test]
  #[should_panic]
  fn should_panic_in_case_of_total_over_255() {
    let raw_key = [1u8; 32];
    let key3 = MessageEncryptionKey::new(raw_key);
    let conf3 = ChunksConfiguration {
      required: 255,
      spare: 255,
    };
    let chunks3 = split_into_chunks(key3, conf3);
    assert_eq!(chunks3.len(), 255 + 255);
  }

  #[test]
  fn chunk_encoding_and_decoding() {
    // given
    let raw_key = [1u8; 32];
    let key = MessageEncryptionKey::new(raw_key);
    let conf = ChunksConfiguration {
      required: 2,
      spare: 1,
    };
    // when
    let chunks = split_into_chunks(key, conf);

    // then
    assert_eq!(chunks.len(), 3);
    let chunk = format!("{:?}", chunks[0].encode());
    assert!(
            chunk.starts_with( r#"Bytes("69636f642d6368756e6b3a00aaf784588d21f3be1a1c4992766dd27a35baf6b09828b44ea99627eac8a1e7304acf64f2a6d458a1fcef30bdba88f54d05cddbc614fc2c4b4e03cb15f54070b202010001"#
        ), "Expected chunk prefix not found in: {}", chunk);
    let chunk = format!("{:?}", chunks[1].encode());
    assert!(
            chunk.starts_with( r#"Bytes("69636f642d6368756e6b3a00aaf784588d21f3be1a1c4992766dd27a35baf6b09828b44ea99627eac8a1e7304acf64f2a6d458a1fcef30bdba88f54d05cddbc614fc2c4b4e03cb15f54070b202010102"#
        ), "Expected chunk prefix not found in: {}", chunk);
    let chunk = format!("{:?}", chunks[2].encode());
    assert!(
            chunk.starts_with( r#"Bytes("69636f642d6368756e6b3a00aaf784588d21f3be1a1c4992766dd27a35baf6b09828b44ea99627eac8a1e7304acf64f2a6d458a1fcef30bdba88f54d05cddbc614fc2c4b4e03cb15f54070b202010203"#
        ), "Expected chunk prefix not found in: {}", chunk);
  }

  #[test]
  fn should_fail_restoring_if_no_chunks() {
    assert_eq!(
      recover_key(&[]).unwrap_err(),
      KeyRecoveryError::NotEnoughChunks
    );
  }

  #[test]
  fn should_fail_restoring_if_chunks_have_inconsistent_configuration() {
    let key1 = MessageEncryptionKey::new([1u8; 32]);
    let key2 = MessageEncryptionKey::new([1u8; 32]);
    let conf1 = ChunksConfiguration::new(2, 0).unwrap();
    let conf2 = ChunksConfiguration::new(1, 0).unwrap();

    let mut chunks1 = split_into_chunks(key1, conf1);
    let mut chunks2 = split_into_chunks(key2, conf2);

    // when
    let recovered = recover_key(&[chunks1.pop().unwrap(), chunks2.pop().unwrap()]);

    // then
    assert_eq!(recovered, Err(KeyRecoveryError::InconsistentConfiguration));
  }

  #[test]
  fn should_fail_restoring_if_chunks_have_inconsistent_key_hash() {
    let key1 = MessageEncryptionKey::new([1u8; 32]);
    let key2 = MessageEncryptionKey::new([2u8; 32]);
    let conf1 = ChunksConfiguration::new(2, 0).unwrap();
    let conf2 = ChunksConfiguration::new(2, 0).unwrap();

    let mut chunks1 = split_into_chunks(key1, conf1);
    let mut chunks2 = split_into_chunks(key2, conf2);

    // when
    let recovered = recover_key(&[chunks1.pop().unwrap(), chunks2.pop().unwrap()]);

    // then
    assert_eq!(recovered, Err(KeyRecoveryError::InconsistentChunks));
  }

  #[test]
  fn should_fail_restoring_if_key_hash_does_not_match() {
    let key1 = MessageEncryptionKey::new([1u8; 32]);
    let conf1 = ChunksConfiguration::new(2, 0).unwrap();
    let mut chunks1 = split_into_chunks(key1, conf1);

    let mut chunk_a = chunks1.pop().unwrap();
    let mut chunk_b = chunks1.pop().unwrap();

    chunk_a.key_hash = Hash::new([1u8; crate::HASH_SIZE]);
    chunk_b.key_hash = Hash::new([1u8; crate::HASH_SIZE]);

    // when
    let recovered = recover_key(&[chunk_a, chunk_b]);

    // then
    assert_eq!(recovered, Err(KeyRecoveryError::UnexpectedKey));
  }

  #[test]
  fn should_fail_restoring_if_key_does_not_decode_correctly() {
    let mut key1 = MessageEncryptionKey::new([1u8; 32]);
    key1.version = EncryptionKeyVersion::Test;
    let conf1 = ChunksConfiguration::new(2, 0).unwrap();
    let mut chunks1 = split_into_chunks(key1, conf1);

    let chunk_a = chunks1.pop().unwrap();
    let chunk_b = chunks1.pop().unwrap();

    // when
    let recovered = recover_key(&[chunk_a, chunk_b]);

    // then
    assert_eq!(recovered, Err(KeyRecoveryError::KeyDecodingError));
  }

  #[test]
  fn should_decode_chunk() {
    let err = Chunk::decode(&[]).unwrap_err();
    assert_eq!(err, ChunkDecodingError::MissingMagicBytes);

    let mut out = CHUNK_ENCODING_MAGIC_SEQUENCE.to_vec();
    {
      let mut out = out.clone();
      let err = Chunk::decode(&out).unwrap_err();
      assert_eq!(err, ChunkDecodingError::InvalidVersion);
      out.push(1);
      let err = Chunk::decode(&out).unwrap_err();
      assert_eq!(err, ChunkDecodingError::InvalidVersion);
    }
    // version
    out.push(0);
    {
      // missing hash
      let err = Chunk::decode(&out).unwrap_err();
      assert_eq!(err, ChunkDecodingError::NotEnoughData);
    }
    // hash
    out.extend_from_slice(&[1u8; HASH_SIZE]);
    {
      let mut out = out.clone();
      out.push(0);
      out.push(1);
      let err = Chunk::decode(&out).unwrap_err();
      assert_eq!(err, ChunkDecodingError::InvalidConfiguration);
    }
    // configuration
    out.push(2);
    out.push(0);
    {
      // missing index
      let err = Chunk::decode(&out).unwrap_err();
      assert_eq!(err, ChunkDecodingError::NotEnoughData);
    }
    // chunk_index
    out.push(0);
    {
      // missing data
      let err = Chunk::decode(&out).unwrap_err();
      assert_eq!(err, ChunkDecodingError::NotEnoughData);
    }
    out.extend_from_slice(&[1, 2, 3, 4]);
    let ok = Chunk::decode(&out).unwrap();
    assert_eq!(
            format!("{:?}", ok),
            "Chunk { version: V0, key_hash: Hash(\"01010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101\"), chunks_configuration: ChunksConfiguration { required: 2, spare: 0 }, chunk_index: 0, chunk_data: String(\"\\u{1}\\u{2}\\u{3}\\u{4}\") == Bytes(\"01020304\") }",
        );
  }
}
