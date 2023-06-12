//! Message encryption.
//!
//! Encrypting the message is versioned (see [EncryptionKeyVersion]),
//! only to maintain backward compatibility in case things are required
//! to be changed in the future.
//!
//! The `V0` version is using `AES-GCM-SIV` with `256b` key size.

use aes_gcm_siv::{Aes256GcmSiv, KeyInit, Nonce, aead::{Aead, Payload}};

use crate::Bytes;

/// An error that may occur during encryption.
#[derive(Debug, Clone, Copy, PartialEq, Eq, thiserror::Error)]
pub enum Error {
    /// The [EncryptionKey] given has unsupported version.
    #[error("Given encryption version is unsupported.")]
    UnsupportedVersion,
    /// Opaque encryption error.
    #[error("Opaque AES encryption error")]
    EncryptionError,
}

impl From<aes_gcm_siv::Error> for Error {
    fn from(_: aes_gcm_siv::Error) -> Self {
        Error::EncryptionError
    }
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
    /// Wrap an externally-generated 32 bytes encryption key.
    pub fn new(key: [u8; 32]) -> Self {
        Self {
            version: EncryptionKeyVersion::V0,
            key,
        }
    }
}

/// A representation of the message to be encrypted.
///
/// The message consists of the actual `data` to be encrypted
/// and additionally the `nonce`, which is derived from the `data`
/// and MUST be unique for every `data`.
#[derive(Debug, PartialEq, Eq)]
pub struct Message {
    data: Bytes,
    nonce: Bytes,
}

impl Message {
    /// Wrap a pre-generated `data` and `nonce` into [Message] type.
    ///
    /// The `nonce` must be unique for every `data`.
    pub fn new<A, B>(data: A, nonce: B) -> Self where
        A: Into<Bytes>,
        B: Into<Bytes>,
    {
        Self {
            data: data.into(),
            nonce: nonce.into(),
        }
    }

    /// Copy given string into the `Message` type and compute nonce on the flight.
    ///
    /// The nonce is derived from the message using BLAKE2s256 hash function.
    pub fn from_str(message: &str) -> Self {
        Self {
            data: Bytes::from_slice(message.as_bytes()),
            nonce: blake2b512(message.as_bytes()),
        }
    }
}

fn blake2b512(input: &[u8]) -> Bytes {
    use blake2::{Blake2b512, Digest};
    let mut hasher = Blake2b512::new();
    hasher.update(input);
    Bytes::from_slice(hasher.finalize().as_slice())
}

/// An encrypted payload of the message and the `nonce` which was used.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct EncryptedMessage {
    data: Bytes,
    nonce: Bytes,
}

impl EncryptedMessage {
    /// Convert the encrypted message into the underlying `data` and `nonce`.
    pub fn into_tuple(self) -> (Bytes, Bytes) {
        (self.data, self.nonce)
    }
}

/// This is AEAD "Additional Authenticated Data".
///
/// The string is used to verify integrity of the encrypted payload when decrypting it.
const AAD: &'static [u8] = b"ICOD-Crypto library of ICOD project. Non omnis moriar.";

/// Encrypt given message using provided [MessageEncryptionKey].
pub fn encrypt_message(key: &MessageEncryptionKey, msg: &Message) -> Result<EncryptedMessage, Error> {
    match key.version {
        EncryptionKeyVersion::V0 => {
            let k = key.key.into();
            let cipher = Aes256GcmSiv::new(&k);
            let nonce = Nonce::from_slice(&msg.nonce.data);
            let payload = Payload {
                msg: &*msg.data,
                aad: AAD,
            };
            let encrypted = cipher.encrypt(nonce, payload)?;
            Ok(EncryptedMessage {
                nonce: msg.nonce.clone(),
                data: encrypted.into(),
            })
        },
        #[allow(unreachable_patterns)]
        _ => Err(Error::UnsupportedVersion),
    }
}

/// Decrypt given [EncryptedMessage] using provided [MessageEncryptionKey].
pub fn decrypt_message(key: &MessageEncryptionKey, msg: &EncryptedMessage) -> Result<Message, Error> {
    match key.version {
        EncryptionKeyVersion::V0 => {
            let k = key.key.into();
            let cipher = Aes256GcmSiv::new(&k);
            let nonce = Nonce::from_slice(&msg.nonce.data);
            let payload = Payload {
                msg: &*msg.data,
                aad: AAD,
            };
            let decrypted = cipher.decrypt(nonce, payload)?;
            Ok(Message {
                nonce: msg.nonce.clone(),
                data: decrypted.into(),
            })
        },
        #[allow(unreachable_patterns)]
        _ => Err(Error::UnsupportedVersion),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn should_format_message() {
        let msg = Message::new(
            Bytes::from_slice(b"This is a message to encrypt."),
            Bytes::from_slice(b"This is a unique nonce")
        );

        assert_eq!(
            &format!("{:?}", msg),
            r#"Message { data: String("This is a message to encrypt.") == Bytes("546869732069732061206d65737361676520746f20656e63727970742e"), nonce: String("This is a unique nonce") == Bytes("54686973206973206120756e69717565206e6f6e6365") }"#,
        );
    }

    #[test]
    fn should_generate_unique_nonce_for_string_message() {
        let msg = Message::from_str("This is a message to encrypt.");

        assert_eq!(
            &format!("{:?}", msg),
            r#"Message { data: String("This is a message to encrypt.") == Bytes("546869732069732061206d65737361676520746f20656e63727970742e"), nonce: Bytes("b058b8dcc94c1828d5e47d7d3a089d99f1d02a55ca40d5cc818c083e74595d65ac5df326718a8ff3583bb1f50a454611757aa9f0c4b8398905d4b1e842289370") }"#,
        );
    }

    #[test]
    fn should_format_encrypted_message() {
        let msg = EncryptedMessage {
            data: Bytes::from_slice(b"This is an encrypted message."),
            nonce: Bytes::from_slice(b"This is a unique nonce"),
        };

        assert_eq!(
            &format!("{:?}", msg),
            r#"EncryptedMessage { data: String("This is an encrypted message.") == Bytes("5468697320697320616e20656e63727970746564206d6573736167652e"), nonce: String("This is a unique nonce") == Bytes("54686973206973206120756e69717565206e6f6e6365") }"#,
        );
    }

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
        assert_eq!(
            &format!("{:?}", encrypted),
            r#"EncryptedMessage { data: Bytes("2a1ca7857f89ad9fbc02dadff3e9dddd174e85777a478fe316e361ff"), nonce: String("unique nonce") == Bytes("756e69717565206e6f6e6365") }"#
        );
        assert_eq!(decrypted, message);
    }
}
