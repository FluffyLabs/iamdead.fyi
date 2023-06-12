use aes_gcm_siv::{Aes256GcmSiv, KeyInit, Nonce, aead::Aead};

use crate::{Bytes, Hash};

/// An error that may occur during encryption.
#[derive(Debug, Clone, Copy, PartialEq, Eq, thiserror::Error)]
pub enum Error {
    /// The [EncryptionKey] given has unsupported version.
    #[error("Given encryption version is unsupported.")]
    UnsupportedVersion,
}

/// Encryption key version.
///
/// The version describes the scheme used for encryption
/// and may be changed at any point in time.
enum EncryptionKeyVersion {
    /// AES-GCM-SIV with 256b key.
    V0,
}

/// A key to encrypt/decrypt the message.
///
/// - The key is versioned in case there is a need to change
///   the encryption scheme at some point.
pub struct MessageEncryptionKey {
    version: EncryptionKeyVersion,
    key: [u8; 32],
}

impl MessageEncryptionKey {
    // TODO
    pub fn new(key: [u8; 32]) -> Self {
        Self {
            version: EncryptionKeyVersion::V0,
            key,
        }
    }
}

#[derive(Debug, PartialEq, Eq)]
pub struct Message {
    data: Bytes,
    nonce: Bytes,
}

impl Message {
    pub fn new<A, B>(data: A, nonce: B) -> Self where
        A: Into<Bytes>,
        B: Into<Bytes>,
    {
        Self {
            data: data.into(),
            nonce: nonce.into(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct EncryptedMessage {
    nonce: Bytes,
    data: Bytes,
}

pub fn encrypt_message(key: &MessageEncryptionKey, msg: &Message) -> Result<EncryptedMessage, Error> {
    match key.version {
        EncryptionKeyVersion::V0 => {
            let k = key.key.into();
            let cipher = Aes256GcmSiv::new(&k);
            let nonce = Nonce::from_slice(&msg.nonce.data);
            // TODO [Unwrap]
            // TODO Use separate AAD (create Payload manually instead of passing a slice)
            let encrypted = cipher.encrypt(nonce, &*msg.data).unwrap();
            Ok(EncryptedMessage {
                nonce: msg.nonce.clone(),
                data: encrypted.into(),
            })
        },
        _ => Err(Error::UnsupportedVersion),
    }
}

pub fn decrypt_message(key: &MessageEncryptionKey, msg: &EncryptedMessage) -> Result<Message, Error> {
    match key.version {
        EncryptionKeyVersion::V0 => {
            let k = key.key.into();
            let cipher = Aes256GcmSiv::new(&k);
            let nonce = Nonce::from_slice(&msg.nonce.data);
            // TODO [Unwrap]
            // TODO Use separate AAD (create Payload manually instead of passing a slice)
            let decrypted = cipher.decrypt(nonce, &*msg.data).unwrap();
            Ok(Message {
                nonce: msg.nonce.clone(),
                data: decrypted.into(),
            })
        },
        _ => Err(Error::UnsupportedVersion),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn should_encrypt_and_decrypt_a_message() {
        // given
        let message = "Hello World!";
        let key = [0u8; 32];
        let key = MessageEncryptionKey::new(key);
        let message = Message::new(
            message.as_bytes().to_vec(),
            b"unique nonce".to_vec(),
        );

        // when
        let encrypted = encrypt_message(&key, &message).unwrap();
        let decrypted = decrypt_message(&key, &encrypted).unwrap();

        // then
        assert_eq!(&format!("{:?}", encrypted), "EncryptedMessage");
        assert_eq!(decrypted, message);
    }
}
