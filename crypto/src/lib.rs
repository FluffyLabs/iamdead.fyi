#![warn(missing_docs)]

pub struct Hash {
    data: [u8; 32]
}

pub struct Bytes {
    data: Vec<u8>,
}

pub struct MessageEncryptionKey {
}

pub struct Message {
}

pub struct EncryptedMessage {
    key_hash: Hash,
}

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

pub fn encrypt_message(_key: MessageEncryptionKey, _msg: Message) -> EncryptedMessage {
    unimplemented!()
}

pub fn decrypt_message(_key: MessageEncryptionKey, _msg: EncryptedMessage) -> Result<Message, ()> {
    unimplemented!()
}

pub fn split_into_chunks(_key: MessageEncryptionKey, _chunks: ChunksConfiguration) -> Vec<Chunk> {
    unimplemented!()
}

pub fn restore_key(_chunks: Vec<Chunk>) -> Result<MessageEncryptionKey, ()> {
    unimplemented!()
}
