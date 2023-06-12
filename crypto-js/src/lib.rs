use icod_crypto::encryption::{MessageEncryptionKey, Message};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn encrypt_message(key: String, msg: String) -> Vec<u8> {
    let key = MessageEncryptionKey::new([0u8; 32]);
    let nonce = b"TODO: nonce should be unique!";
    let msg = Message::new(msg.as_bytes().to_vec(), nonce.to_vec());

    let _encrypted = icod_crypto::encryption::encrypt_message(&key, &msg);

    unimplemented!()
}
