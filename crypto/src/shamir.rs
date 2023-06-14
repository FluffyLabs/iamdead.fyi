use crate::{Bytes, Hash};
use crate::encryption::MessageEncryptionKey;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
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

impl Chunk {
    pub fn new(
        chunk_index: u8,
        chunk_data: impl Into<Bytes>,
        chunks_configuration: ChunksConfiguration,
        key_hash: Hash,
    ) -> Self {
        Self {
            key_hash,
            chunks_configuration,
            chunk_index,
            chunk_data: chunk_data.into(),
        }
    }
}

pub fn split_into_chunks(
    key: MessageEncryptionKey,
    chunks_configuration: ChunksConfiguration,
) -> Vec<Chunk> {
    let shares = chunks_configuration.required + chunks_configuration.spare;
    let required = chunks_configuration.required as usize;
    let payload = key.encode();
    let key_hash = crate::blake2b512(&payload);
    let chunks = gf256::shamir::shamir::generate(
        &payload,
        shares as usize,
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


mod tests {
    use super::*;
    
    #[test]
    fn should_produce_chunks_and_restore_the_key() {
        let raw_key = [1u8; 32];
        let encoded = MessageEncryptionKey::new(raw_key.clone()).encode();
        let key = MessageEncryptionKey::new(raw_key);
        let chunks = ChunksConfiguration {
            required: 4,
            spare: 3
        };
        // when
        let chunks = split_into_chunks(key, chunks);
        let restored_key = restore_key(&chunks[0..4]).unwrap();

        // then
        assert_eq!(Bytes::from(encoded), Bytes::from(restored_key.encode()));
    }
}
