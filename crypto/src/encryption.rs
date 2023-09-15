//! Message encryption.
//!
//! Encrypting the message is versioned (see [EncryptionKeyVersion]),
//! only to maintain backward compatibility in case things are required
//! to be changed in the future.
//!
//! The `V0` version is using `AES-GCM-SIV` with `256b` key size.

use std::collections::BTreeMap;

use aes_gcm_siv::{
  aead::{Aead, OsRng, Payload},
  Aes256GcmSiv, KeyInit, Nonce,
};

use crate::Bytes;

/// An error that may occur during encryption.
#[derive(Debug, Clone, Copy, PartialEq, Eq, thiserror::Error)]
pub enum Error {
  /// The [MessageEncryptionKey] given has unsupported version.
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

/// An error which may occur during decoding of the [MessageEncryptionKey].
#[derive(Debug, Clone, Copy, PartialEq, Eq, thiserror::Error)]
pub enum KeyDecodingError {
  /// The byte input is missing [KEY_ENCODING_MAGIC_SEQUENCE] prefix.
  #[error("Given data does not look like a key.")]
  MissingMagicBytes,
  /// The byte input has invalid version identifier.
  #[error("The version of the key is invalid.")]
  InvalidVersion,
  /// The remaining byte data has invalid length.
  #[error("The key length is invalid.")]
  InvalidKeySize,
}

/// Encryption key version.
///
/// The version describes the scheme used for encryption
/// and may be changed at any point in time.
#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub(crate) enum EncryptionKeyVersion {
  /// A version only used for testing. It will never decode.
  #[cfg(test)]
  Test,
  /// AES-GCM-SIV with 256b key.
  V0,
}

/// The byte size of the current version key.
pub const KEY_SIZE: usize = 32;

/// A key to encrypt/decrypt the message.
///
/// The key is versioned in case there is a need to change
/// the encryption scheme at some point.
///
/// Note the key should NEVER be used twice. Instead of re-using
/// the key, we should be generating a new one and using to encrypt
/// the message.
#[cfg_attr(test, derive(Debug, PartialEq, Eq))]
pub struct MessageEncryptionKey {
  #[cfg(test)]
  pub(crate) version: EncryptionKeyVersion,
  #[cfg(not(test))]
  version: EncryptionKeyVersion,
  key: [u8; KEY_SIZE],
}

/// A specific byte sequence used to identify the encoding of [MessageEncryptionKey].
///
/// The encoding of [MessageEncryptionKey] is simply a concatenation of:
/// 1. The magic sequence.
/// 2. The version byte.
/// 3. The 32-bytes of the key.
///
/// The key size might change with versions, but currently it's fixed-size with version `V0`.
pub const KEY_ENCODING_MAGIC_SEQUENCE: &'static [u8] = b"icodk";

impl MessageEncryptionKey {
  /// Wrap an externally-generated 32-bytes encryption key.
  pub fn new(key: [u8; KEY_SIZE]) -> Self {
    Self {
      version: EncryptionKeyVersion::V0,
      key,
    }
  }

  /// Generate a new encryption key using default entropy source (`OsRng`).
  pub fn generate() -> Self {
    let key = Aes256GcmSiv::generate_key(&mut OsRng);
    let key = <[u8; KEY_SIZE]>::try_from(key.as_slice())
      .expect("The key generate by `Aes256GcmSiv` has the correct size");
    Self::new(key)
  }

  /// Clear out the data of the key from stack.
  ///
  /// Note this method is best-effort prevention of leaking the key
  /// on stack or in memory.
  pub fn wipe(&mut self) {
    crate::wipe(&mut self.key);
  }

  /// Encode the key into a vector of bytes.
  ///
  /// The key encoding has a magic sequence prepended and a byte representing the version.
  ///
  /// ```markdown
  /// +--------------------------------+
  /// | magic byte sequence (5 bytes)  |
  /// | (b"icodk")                     |
  /// +--------------------------------+
  /// | version (1 byte)               |
  /// +--------------------------------+
  /// | key (32 bytes for version 0)   |
  /// +--------------------------------+
  /// ```
  pub fn encode(mut self) -> Bytes {
    let version = match self.version {
      #[cfg(test)]
      EncryptionKeyVersion::Test => 255u8,
      EncryptionKeyVersion::V0 => 0u8,
    };
    let mut out = vec![];
    out.extend_from_slice(KEY_ENCODING_MAGIC_SEQUENCE);
    out.push(version);
    out.extend_from_slice(&self.key);
    self.wipe();

    Bytes::from(out)
  }

  /// Attempt to decode the [MessageEncryptionKey] from given byte slices.
  pub fn decode(data: &[u8]) -> Result<Self, KeyDecodingError> {
    let data = data
      .strip_prefix(KEY_ENCODING_MAGIC_SEQUENCE)
      .ok_or(KeyDecodingError::MissingMagicBytes)?;
    let version = [0u8];
    let key = data
      .strip_prefix(&version)
      .ok_or(KeyDecodingError::InvalidVersion)?;

    if key.len() != KEY_SIZE {
      return Err(KeyDecodingError::InvalidKeySize);
    }

    let mut out = [0u8; KEY_SIZE];
    out.copy_from_slice(key);
    Ok(MessageEncryptionKey::new(out))
  }
}

impl Drop for MessageEncryptionKey {
  fn drop(&mut self) {
    self.wipe()
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
  /// The nonce must be [NONCE_SIZE] bytes!
  nonce: Bytes,
}

impl Message {
  /// Wrap a pre-generated `data` and `nonce` into [Message] type.
  ///
  /// The `nonce` must be unique for every `data`.
  pub fn new<A>(data: A, nonce: [u8; NONCE_SIZE]) -> Self
  where
    A: Into<Bytes>,
  {
    Self {
      data: data.into(),
      nonce: Bytes::from_slice(nonce.as_slice()),
    }
  }

  /// Copy given string into the `Message` type and compute nonce on the flight.
  ///
  /// The nonce is derived from the message using BLAKE2b512 hash function
  pub fn from_str(message: &str) -> Self {
    let hash = crate::blake2b512(message.as_bytes());
    Self {
      data: Bytes::from_slice(message.as_bytes()),
      nonce: Bytes::from_slice(&hash.as_slice()[0..NONCE_SIZE]),
    }
  }

  /// Convert the message into the underlying `data` and `nonce`.
  pub fn into_tuple(self) -> (Bytes, Bytes) {
    (self.data, self.nonce)
  }

  /// Clear out the message to prevent it from leaking the values on the heap.
  pub fn wipe(&mut self) {
    self.data.wipe();
    self.nonce.wipe();
  }
}

/// The size of the required nonce.
pub const NONCE_SIZE: usize = 12;

/// Error which can occur during [EncryptedMessage] instantiation.
#[derive(Debug, Clone, Copy, PartialEq, Eq, thiserror::Error)]
pub enum EncryptedMessageError {
  /// The `data` length can't be encoded into 3 bytes.
  #[error("Given data exceeds maximum of 16MBs.")]
  DataTooBig,
  /// The decoded version of message is invalid.
  #[error("Given message seems to use unsupported crypto.")]
  InvalidVersion,
  /// We failed to fully decode message parts or found some inconsistencies.
  #[error("The message parts are malformed or incorrect.")]
  MalformedData(&'static str),
  /// Some parts of the message were not passed.
  #[error("There is not enough parts of the encrypted message.")]
  MissingParts,
}

/// An encrypted payload of the message and the `nonce` which was used.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct EncryptedMessage {
  /// The version of encrypted message is currently matching the encryption key version.
  version: EncryptionKeyVersion,
  /// The nonce must be [NONCE_SIZE] bytes!
  nonce: Bytes,
  /// Arbitrary-length data.
  data: Bytes,
}

impl EncryptedMessage {
  /// Wrap externally received `data` and `nonce` into [EncryptedMessage] type.
  pub fn new<A>(data: A, nonce: [u8; NONCE_SIZE]) -> Result<Self, EncryptedMessageError>
  where
    A: Into<Bytes>,
  {
    let data = data.into();
    // Validate that data length can be encoded into 3-bytes.
    if data.len() > 2usize.pow(8 * BYTES_PER_ID_PART as u32) {
      return Err(EncryptedMessageError::DataTooBig);
    }

    Ok(Self {
      version: EncryptionKeyVersion::V0,
      data: data.into(),
      nonce: Bytes::from_slice(nonce.as_slice()),
    })
  }

  /// Restore the [EncryptedMessage] from multiple parts coming from [split_and_encode] method.
  ///
  /// Note that you need to provide all `parts` to fully restore the message.
  /// Restoration DOES NOT guarantee that the message is consistent,
  /// it might just happen the consistency checks will pass, but
  /// the parts are not part of the same original message and you will just get
  /// garbage.
  pub fn collate_from_parts(parts: Vec<Bytes>) -> Result<Self, EncryptedMessageError> {
    let mut nonce = [0u8; NONCE_SIZE];
    let mut message_parts = BTreeMap::<u32, Vec<u8>>::new();
    let mut expected_parts = 0u32;
    let version = [0u8];

    for part in parts {
      let part = part
        .strip_prefix(&version)
        .ok_or(EncryptedMessageError::InvalidVersion)?;
      let (part_id, part) = EncryptedMessagePartId::read_from(&part)
        .ok_or(EncryptedMessageError::MalformedData("Cannot read part id."))?;
      // Check number of expected parts
      if expected_parts != part_id.all {
        if expected_parts == 0 {
          expected_parts = part_id.all;
        } else {
          return Err(EncryptedMessageError::MalformedData(
            "Number of parts mismatch.",
          ));
        }
      }
      // read nonce first for the first part
      let part = if part_id.idx == 0 {
        if part.len() < NONCE_SIZE {
          return Err(EncryptedMessageError::MalformedData(
            "Not enough bytes to read NONCE.",
          ));
        }
        nonce.copy_from_slice(&part[0..NONCE_SIZE]);
        &part[NONCE_SIZE..]
      } else {
        part
      };
      // now rest of the data
      // TODO [ToDr] Avoid alloc? Use split_off just calculate where.
      message_parts.insert(part_id.idx, part.to_vec());
    }

    if expected_parts as usize != message_parts.len() {
      return Err(EncryptedMessageError::MissingParts);
    }

    let mut message = Vec::with_capacity(
      expected_parts as usize
        * message_parts
          .first_key_value()
          .map(|(_, v)| v.len() + NONCE_SIZE)
          .unwrap_or(0),
    );

    for (_, part) in message_parts.into_iter() {
      message.extend(part);
    }

    Ok(Self {
      version: EncryptionKeyVersion::V0,
      data: message.into(),
      nonce: Bytes::from_slice(&nonce),
    })
  }

  /// Encode the encrypted message into multiple vectors of bytes.
  ///
  /// Since the encrypted message may be quite long, the message
  /// may be split into multiple PARTS, each part having less than
  /// `split` bytes on top of the required bytes (version
  /// + identification). Note that since `split` values of
  /// less than `NONCE_SIZE` are not practical, the `nonce`
  /// is never split, so the first part might be bigger than
  /// others.
  ///
  /// Each part will have the version and the part identification prepended.
  /// Unlike [MessageEncryptionKey] and [Chunk] we don't prepend any magic
  /// sequence to save off these bytes, since message encoding may be quite
  /// long.
  ///
  /// ```markdown
  /// +--------------------------------+
  /// | version (1 byte)               |
  /// +--------------------------------+
  /// | part id (3 bytes)              | // Big Endian
  /// +--------------------------------+
  /// | total parts (3 bytes)          | // Big Endian
  /// +--------------------------------+
  /// | nonce (12 bytes)               | // only in the first part
  /// +--------------------------------+
  /// | data (variable length)         |
  /// +--------------------------------+
  /// ```
  pub fn split_and_encode(self, split_arg: Option<usize>) -> Vec<Bytes> {
    let version = match self.version {
      #[cfg(test)]
      EncryptionKeyVersion::Test => 255u8,
      EncryptionKeyVersion::V0 => 0u8,
    };

    let data_len = self.data.len();
    let total_len = data_len + NONCE_SIZE;
    let split = split_arg.unwrap_or(total_len).min(total_len).max(1);
    let capacity = if split_arg.is_none() {
      // special case if we are not planning to do any splitting.
      1
    } else if split < NONCE_SIZE {
      // add one extra chunk just for nonce
      (data_len + split - 1) / split + 1
    } else {
      // treat nonce as regular data
      (data_len + NONCE_SIZE + split - 1) / split
    };
    let mut output = Vec::with_capacity(capacity);

    let mut data = &self.data[..];
    let mut part_id = EncryptedMessagePartId {
      idx: 0,
      all: capacity as u32,
    };
    loop {
      let mut out = vec![];
      out.push(version);
      out.extend_from_slice(&part_id.index_bytes());
      // TODO [ToDr] We might consider dropping this and version from
      // every chunk. Not sure if it adds anything.
      out.extend_from_slice(&part_id.all_bytes());

      let mut split_point = data.len().min(split);
      // The first chunk always contains the nonce.
      if part_id.idx == 0 {
        out.extend_from_slice(&self.nonce);
        // we subtract the nonce size from the chunk size
        // to keep the chunks consistent
        if capacity > 1 {
          split_point = split_point.saturating_sub(NONCE_SIZE);
        }
      }
      let (slice, rest) = data.split_at(split_point);
      data = rest;
      out.extend_from_slice(&slice);
      output.push(Bytes::from(out));
      part_id.idx += 1;

      if data.is_empty() || part_id.idx > part_id.all {
        break;
      }
    }

    output
  }
}

/// Number of bytes used to encode each field of [EncryptedMessagePartId].
///
/// We use 3 bytes, which allows us to store up to: 2**24 bytes (~16MB)
pub const BYTES_PER_ID_PART: usize = 3;

/// A location of part within the original [EncryptedMessage].
#[derive(Debug)]
pub struct EncryptedMessagePartId {
  /// Current part index (0-based).
  idx: u32,
  /// Total number of all parts.
  all: u32,
}

impl EncryptedMessagePartId {
  /// Create a new [EncryptedMessagePartId] given 3-byte big endian encoding
  /// of it's components.
  pub fn new(idx: &[u8; BYTES_PER_ID_PART], all: &[u8; BYTES_PER_ID_PART]) -> Self {
    Self {
      idx: Self::bytes_to_u32(idx),
      all: Self::bytes_to_u32(all),
    }
  }

  fn read_from(part: &[u8]) -> Option<(Self, &[u8])> {
    if part.len() < BYTES_PER_ID_PART * 2 {
      return None;
    }

    let idx = Self::slice_to_u32(&part[0..3]);
    let all = Self::slice_to_u32(&part[3..6]);

    if idx >= all {
      return None;
    }

    Some((Self { idx, all }, &part[6..]))
  }

  fn u32_to_bytes(val: u32) -> [u8; BYTES_PER_ID_PART] {
    let mut out = [0u8; BYTES_PER_ID_PART];
    out.copy_from_slice(&val.to_be_bytes()[1..]);
    out
  }

  fn bytes_to_u32(bytes: &[u8; BYTES_PER_ID_PART]) -> u32 {
    Self::slice_to_u32(&*bytes)
  }

  fn slice_to_u32(bytes: &[u8]) -> u32 {
    assert_eq!(bytes.len(), 3);
    let mut out = [0u8; 4];
    out[1..].copy_from_slice(bytes);
    u32::from_be_bytes(out)
  }

  /// Return 3-byte big endian encoding of part index.
  pub fn index_bytes(&self) -> [u8; BYTES_PER_ID_PART] {
    Self::u32_to_bytes(self.idx)
  }

  /// Return 3-byte big endian encoding of total number of parts.
  pub fn all_bytes(&self) -> [u8; BYTES_PER_ID_PART] {
    Self::u32_to_bytes(self.all)
  }
}

/// This is AEAD "Additional Authenticated Data".
///
/// The string is used to verify integrity of the encrypted payload when decrypting it.
const AAD: &'static [u8] = b"ICOD-Crypto library of ICOD project. Non omnis moriar.";

/// Encrypt given message using provided [MessageEncryptionKey].
pub fn encrypt_message(
  key: &MessageEncryptionKey,
  msg: &Message,
) -> Result<EncryptedMessage, Error> {
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
        version: key.version,
        nonce: msg.nonce.clone(),
        data: encrypted.into(),
      })
    }
    #[allow(unreachable_patterns)]
    _ => Err(Error::UnsupportedVersion),
  }
}

/// Decrypt given [EncryptedMessage] using provided [MessageEncryptionKey].
pub fn decrypt_message(
  key: &MessageEncryptionKey,
  msg: &EncryptedMessage,
) -> Result<Message, Error> {
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
    }
    #[allow(unreachable_patterns)]
    _ => Err(Error::UnsupportedVersion),
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use pretty_assertions::assert_eq;

  #[test]
  fn should_format_message() {
    let nonce = {
      let mut nonce = [0u8; 12];
      nonce.copy_from_slice(b"unique nonce");
      nonce
    };
    let msg = Message::new(Bytes::from_slice(b"This is a message to encrypt."), nonce);

    assert_eq!(
      &format!("{:?}", msg),
      r#"Message { data: String("This is a message to encrypt.") == Bytes("546869732069732061206d65737361676520746f20656e63727970742e"), nonce: String("unique nonce") == Bytes("756e69717565206e6f6e6365") }"#,
    );
  }

  #[test]
  fn should_generate_unique_nonce_for_string_message() {
    let msg = Message::from_str("This is a message to encrypt.");

    assert_eq!(
      &format!("{:?}", msg),
      r#"Message { data: String("This is a message to encrypt.") == Bytes("546869732069732061206d65737361676520746f20656e63727970742e"), nonce: Bytes("b058b8dcc94c1828d5e47d7d") }"#,
    );
  }

  #[test]
  fn should_format_encrypted_message() {
    let msg = EncryptedMessage {
      version: EncryptionKeyVersion::V0,
      data: Bytes::from_slice(b"This is an encrypted message."),
      nonce: Bytes::from_slice(b"This is a unique nonce"),
    };

    assert_eq!(
      &format!("{:?}", msg),
      r#"EncryptedMessage { version: V0, nonce: String("This is a unique nonce") == Bytes("54686973206973206120756e69717565206e6f6e6365"), data: String("This is an encrypted message.") == Bytes("5468697320697320616e20656e63727970746564206d6573736167652e") }"#,
    );
  }

  #[test]
  fn should_encrypt_and_decrypt_a_message() {
    // given
    let message = "Hello World!";
    let key = [0u8; 32];
    let key = MessageEncryptionKey::new(key);
    let nonce = {
      let mut nonce = [0u8; 12];
      nonce.copy_from_slice(b"unique nonce");
      nonce
    };
    let message = Message::new(message.as_bytes().to_vec(), nonce);

    // when
    let encrypted = encrypt_message(&key, &message).unwrap();
    let decrypted = decrypt_message(&key, &encrypted).unwrap();

    // then
    assert_eq!(
      &format!("{:?}", encrypted),
      r#"EncryptedMessage { version: V0, nonce: String("unique nonce") == Bytes("756e69717565206e6f6e6365"), data: Bytes("2a1ca7857f89ad9fbc02dadff3e9dddd174e85777a478fe316e361ff") }"#
    );
    assert_eq!(decrypted, message);
  }

  #[test]
  fn should_encode_and_decode_the_key() {
    // given
    let raw_key = [1u8; KEY_SIZE];
    let key = MessageEncryptionKey::new(raw_key.clone());

    let encoded = key.encode();

    assert_eq!(
      format!("{:?}", encoded),
      r#"String("icodk\0\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}\u{1}") == Bytes("69636f646b000101010101010101010101010101010101010101010101010101010101010101")"#
    );

    let key = MessageEncryptionKey::new(raw_key);
    let decoded = MessageEncryptionKey::decode(&*encoded).unwrap();

    assert_eq!(key, decoded);
  }

  #[test]
  fn should_encode_encrypted_message() {
    // given
    let message = EncryptedMessage::new(b"Test Data".to_vec(), b"test nonce x".to_owned()).unwrap();

    // when
    let encoded = message.split_and_encode(Some(4));

    // then
    assert_eq!(encoded.len(), 4);
    assert_eq!(
        format!("{:?}", encoded[0]),
        "String(\"\\0\\0\\0\\0\\0\\0\\u{4}test nonce x\") == Bytes(\"0000000000000474657374206e6f6e63652078\")"
    );
    assert_eq!(
      format!("{:?}", encoded[1]),
      "String(\"\\0\\0\\0\\u{1}\\0\\0\\u{4}Test\") == Bytes(\"0000000100000454657374\")"
    );
    assert_eq!(
      format!("{:?}", encoded[2]),
      "String(\"\\0\\0\\0\\u{2}\\0\\0\\u{4} Dat\") == Bytes(\"0000000200000420446174\")"
    );
    assert_eq!(
      format!("{:?}", encoded[3]),
      "String(\"\\0\\0\\0\\u{3}\\0\\0\\u{4}a\") == Bytes(\"0000000300000461\")"
    );
  }

  #[test]
  fn should_encode_when_split_is_none() {
    // given
    let message = EncryptedMessage::new(b"Test Data".to_vec(), b"test nonce x".to_owned()).unwrap();

    // when
    let encoded = message.split_and_encode(None);

    // then
    assert_eq!(encoded.len(), 1);
    assert_eq!(
        format!("{:?}", encoded[0]),
        "String(\"\\0\\0\\0\\0\\0\\0\\u{1}test nonce xTest Data\") == Bytes(\"0000000000000174657374206e6f6e63652078546573742044617461\")"
    );
  }

  #[test]
  fn should_encode_when_split_is_zero() {
    // given
    let message = EncryptedMessage::new(b"Test Data".to_vec(), b"test nonce x".to_owned()).unwrap();

    // when
    let encoded = message.split_and_encode(Some(0));

    // then
    // Assuming nonce has length 12 and data has length 9.
    // Every chunk will have 1 byte of data + first chunk will contain the nonce.
    assert_eq!(encoded.len(), 10);
  }

  #[test]
  fn should_encode_large_data() {
    // given
    let large_data: Vec<u8> = (0..1000).map(|x| (x % 256) as u8).collect();
    let message = EncryptedMessage::new(large_data, b"test nonce x".to_owned()).unwrap();

    // when
    let encoded = message.split_and_encode(Some(200));

    // then
    assert_eq!(encoded.len(), 1 + 5); // The large_data with size 1000 will be split into 5 parts each of size 200.
  }

  #[test]
  fn should_fail_encoding_too_large_message() {
    // given
    let mut large_data: Vec<u8> = (0..2usize.pow(8 * BYTES_PER_ID_PART as u32))
      .map(|x| (x % 256) as u8)
      .collect();
    let message = EncryptedMessage::new(large_data.clone(), b"test nonce x".to_owned()).unwrap();
    let encoded = message.split_and_encode(Some(200));
    // with 60 QR codes a second, this would take ~23 mins to fully scan (0.o)!
    assert_eq!(encoded.len(), 1 + 83886);

    // when
    large_data.push(1);
    let message = EncryptedMessage::new(large_data.clone(), b"test nonce x".to_owned());

    // then
    assert_eq!(message, Err(EncryptedMessageError::DataTooBig));
  }

  #[test]
  fn should_validate_what_it_decodes() {
    let too_short = MessageEncryptionKey::decode(&[]).unwrap_err();
    assert_eq!(too_short, KeyDecodingError::MissingMagicBytes);
    let no_prefix = MessageEncryptionKey::decode(&[1, 2, 3, 4, 5, 6]).unwrap_err();
    assert_eq!(no_prefix, KeyDecodingError::MissingMagicBytes);
    let mut out = vec![];
    out.extend_from_slice(KEY_ENCODING_MAGIC_SEQUENCE);
    {
      let mut o = out.clone();
      o.push(1);
      let invalid_version = MessageEncryptionKey::decode(&o).unwrap_err();
      assert_eq!(invalid_version, KeyDecodingError::InvalidVersion);
    }

    out.push(0);
    {
      let mut o = out.clone();
      o.extend_from_slice(&[1, 2, 3, 4]);
      let key_to_short = MessageEncryptionKey::decode(&o).unwrap_err();
      assert_eq!(key_to_short, KeyDecodingError::InvalidKeySize);
    }

    out.extend_from_slice(&[2u8; KEY_SIZE]);

    let _ok = MessageEncryptionKey::decode(&out).unwrap();
  }

  #[test]
  fn should_generate_a_random_key() {
    let _key = MessageEncryptionKey::generate();
  }
}
