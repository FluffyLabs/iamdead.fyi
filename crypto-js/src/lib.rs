use icod_crypto::{MessageEncryptionKey, Message};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn encrypt_message(_key: String, _msg: String) -> Vec<u8> {
    let key = MessageEncryptionKey {
    };
    let msg = Message {  };

    let _encrypted = icod_crypto::encrypt_message(key, msg);

    unimplemented!()
}
