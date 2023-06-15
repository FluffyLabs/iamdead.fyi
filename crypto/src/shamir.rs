//! Shamir Secret Sharing.
//!
//! The crate wraps a Shamir Secret Sharing library into an
//! ICOD-specific API.
//!
//! The idea is to split the [MessageEncryptionKey] into multiple
//! chunks represented as [Chunk] type. The premise of SSS
//! is that you need at least `N` required chunks out of all `N+S`
//! generated chunks to restore the original key. None of
//! the chunks should leak any information on it's own, also any
//! combination of `N-1` chunks should not leak any information.
//!
//! Every [Chunk] is versioned to provide backward-compatibility
//! in case of any changes. Also we bundle a bunch of additional
//! information with the chunk to improve User Experience.

use crate::{Bytes, Hash};
use crate::encryption::MessageEncryptionKey;

/// A configuration of the Shamir Secret Sharing split.
///
/// A total number of chunks is equal to `required + spare`
/// and any `required` number of chunks is sufficient to
/// restore the original key.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ChunksConfiguration {
    /// Number of chunks required to restore the key.
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
    pub fn new(
        required: u8,
        spare: u8,
    ) -> Result<Self, ()> {
        if required == 0 || required + spare >= 255 {
            Err(())
        } else {
            Ok(Self {
                required, spare
            })
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
/// The chunks represents one piece that can be used to restore the
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
}

/// Split given key into a series of SSS chunks according to given [ChunksConfiguration].
///
/// This method returns a vector of [Chunk] objects. The number of elements
/// equals the total of `required` and `spare` chunks from the configuration.
///
/// The chunks can later be used to restore the original key
/// using [restore_key] function.
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
    let chunks = gf256::shamir::shamir::generate(
        &payload,
        shares,
        required
    );

    chunks
        .into_iter()
        .enumerate()
        .map(|(idx, x)| Chunk::new(
                idx as u8,
                x,
                chunks_configuration,
                key_hash.clone(),
        ))
        .collect()
}

pub fn restore_key(
    chunks: &[Chunk]
) -> Result<MessageEncryptionKey, ()> {
    let raw_chunks = {
        let mut raw_chunks = Vec::with_capacity(chunks.len());
        raw_chunks.extend(
            chunks
                .iter()
                .map(|c| &*c.chunk_data)
        );
        raw_chunks
    };
    // TODO [ToDr] Verify that we actually have enough chunks!
    let key = gf256::shamir::shamir::reconstruct(&raw_chunks);

    // TODO [ToDr] verify the key integrity
    Ok(MessageEncryptionKey::decode(&key).unwrap())
}   


#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn should_produce_chunks_and_restore_the_key() {
        let raw_key = [1u8; 32];
        let encoded = MessageEncryptionKey::new(raw_key.clone()).encode();
        let key = MessageEncryptionKey::new(raw_key);
        let chunks = ChunksConfiguration::new(4, 3).unwrap();

        // when
        let chunks = split_into_chunks(key, chunks);
        let restored_key = restore_key(&chunks[0..4]).unwrap();

        // then
        assert_eq!(encoded, Bytes::from(restored_key.encode()));
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
            spare: 1
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
}
