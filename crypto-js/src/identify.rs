//! Functions used to identify & decode icod-produced strings.

use icod_crypto::{encryption::EncryptedMessagePart, shamir::Chunk};
#[cfg(not(test))]
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;

use crate::{conv, encryption::MSG_PREFIX, shamir::CHUNK_PREFIX, JsValueOrString};

/// Error occuring during identification.
#[derive(Debug)]
#[cfg_attr(test, derive(Eq, PartialEq))]
pub enum Error {
  /// The string is missing a known prefix.
  MissingPrefix,
  /// We could not decode the raw bytes.
  DecodingError,
  /// Error during type-specific decoding.
  Other(String),
}

impl From<Error> for JsValue {
  fn from(value: Error) -> Self {
    JsValue::from_str(&format!("{:?}", value))
  }
}

/// Result of identifiation of the string.
#[derive(Debug, PartialEq, Eq, serde::Serialize)]
pub enum Identification {
  /// The string is a message part.
  MessagePart {
    /// Version byte.
    version: u8,
    /// Part index.
    part_index: u32,
    /// Number of all parts.
    parts_total: u32,
    /// Nonce, only part of `part_index = 0`.
    nonce: Option<String>,
    /// Data piece of that message part.
    data: String,
  },
  /// The string is a SSS chunk.
  Chunk {
    /// Name of the chunk.
    name: String,
    /// Version byte.
    version: u8,
    /// Hash of the key the chunk is for.
    key_hash: String,
    /// Number of required chunks.
    required_chunks: u8,
    /// Number of spare chunks.
    spare_chunks: u8,
    /// Index of the chunk.
    chunk_index: u8,
    /// Data piece of the chunk.
    data: String,
  },
}

fn serialize(id: Identification) -> IdentificationOrJsValue {
  #[cfg(test)]
  return id;
  #[cfg(not(test))]
  serde_wasm_bindgen::to_value(&id).expect("Identification serialization is infallible")
}

/// A type returned by [identify] function.
#[cfg(test)]
pub type IdentificationOrJsValue = Identification;
/// A type returned by [identify] function.
#[cfg(not(test))]
pub type IdentificationOrJsValue = JsValue;

fn identify_chunk(item: &str) -> Option<(Option<&str>, &str)> {
  if let Some(chunk) = item.strip_prefix(CHUNK_PREFIX) {
    Some(if let Some(index) = chunk.find(':') {
      let (name, rest) = chunk.split_at(index);
      (Some(name), &rest[1..])
    } else {
      (None, chunk)
    })
  } else {
    None
  }
}

/// Given a string attempts to identify and decode the details
/// of encoded value.
#[cfg_attr(not(test), wasm_bindgen)]
pub fn identify(item: String) -> Result<IdentificationOrJsValue, Error> {
  if let Some((name, chunk)) = identify_chunk(&item) {
    let bytes = crate::conv::decode(&chunk).map_err(|_| Error::DecodingError)?;
    let chunk = Chunk::decode(&bytes).map_err(|e| Error::Other(format!("{}", e)))?;
    let total_chunks = chunk.configuration().total();

    return Ok(serialize(Identification::Chunk {
      name: name
        .map(Into::into)
        .unwrap_or_else(|| format!("Restoration Piece {}/{}", chunk.index() + 1, total_chunks)),
      version: chunk.version(),
      key_hash: crate::conv::encode(&chunk.key_hash().to_bytes()),
      required_chunks: chunk.configuration().required() as u8,
      spare_chunks: chunk.configuration().spare() as u8,
      chunk_index: chunk.index(),
      data: crate::conv::encode(&chunk.data()),
    }));
  }

  if let Some(msg) = item.strip_prefix(MSG_PREFIX) {
    let bytes = crate::conv::decode(&msg).map_err(|_| Error::DecodingError)?;
    let part = EncryptedMessagePart::decode(&bytes).map_err(|e| Error::Other(format!("{}", e)))?;
    return Ok(serialize(Identification::MessagePart {
      version: part.version(),
      part_index: part.part_index(),
      parts_total: part.parts_total(),
      nonce: part.nonce().map(|n| crate::conv::encode(n)),
      data: crate::conv::encode(part.data()),
    }));
  }

  return Err(Error::MissingPrefix);
}

const MAX_CHUNKS_NAME_LEN: usize = 16;

/// Given an encoded chunk (potentially with a name) and new name, alters the
/// chunk to have given name.
#[cfg_attr(not(test), wasm_bindgen)]
pub fn alter_chunks_name(
  chunk: String,
  new_name: String,
) -> Result<JsValueOrString, AlterChunksNameError> {
  if let Some((_name, chunk)) = identify_chunk(&chunk) {
    if new_name.find(":").is_some() {
      return Err(AlterChunksNameError::InvalidCharacters);
    }

    if new_name.len() > MAX_CHUNKS_NAME_LEN {
      return Err(AlterChunksNameError::NameTooLong);
    }

    Ok(conv::js_value_or_string(format!(
      "{}{}:{}",
      CHUNK_PREFIX, new_name, chunk
    )))
  } else {
    Err(AlterChunksNameError::NotAChunk)
  }
}

/// Error occuring during chunk name alteration.
#[derive(Debug)]
#[cfg_attr(test, derive(Eq, PartialEq))]
pub enum AlterChunksNameError {
  /// The value is not a chunk.
  NotAChunk,
  /// The chunk contains invalid characters.
  InvalidCharacters,
  /// The name is too long.
  NameTooLong,
}

impl From<AlterChunksNameError> for JsValue {
  fn from(value: AlterChunksNameError) -> Self {
    use AlterChunksNameError::*;
    let r = match value {
      NotAChunk => "Given string does not look like encoded piece.".into(),
      NameTooLong => format!(
        "The name has too many characters. Max: {}",
        MAX_CHUNKS_NAME_LEN
      ),
      InvalidCharacters => "The name cannot contain `:`.".into(),
    };
    JsValue::from_str(&r)
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use icod_crypto::encryption::KEY_SIZE;
  use pretty_assertions::assert_eq;

  #[test]
  fn should_identify_chunk() {
    // given
    let key = [1u8; KEY_SIZE].to_vec();
    let conf = crate::shamir::ChunksConfiguration {
      required: 2,
      spare: 3,
    };
    let parts = crate::shamir::split_into_chunks(key, conf).unwrap();
    assert_eq!(parts.len(), 5);

    // when
    let result = identify(parts[1].clone()).unwrap();

    // then
    // since data is random, we extract it first.
    let data = match result {
      Identification::Chunk { ref data, .. } => data.clone(),
      _ => "".into(),
    };
    assert_eq!(result, Identification::Chunk {
      name: "Restoration Piece 2/5".into(),
      version:0,
      key_hash: "av90pe1vsder0me4lgd8bb5beegqo083q4s0p2sdi36248eqq2cllacfebsb5ne4644jsqe7i515nrggqhgv00q4f87nvijrjul6q58".into(),
      required_chunks: 2,
      spare_chunks: 3,
      chunk_index: 1,
      data,
    });
  }

  #[test]
  fn should_identify_message() {
    // given
    let key = [1u8; KEY_SIZE].to_vec();
    let message = "This is my secret message xD";
    let split = None;
    let parts = crate::encryption::encrypt_message(key, message.to_owned(), split).unwrap();
    assert_eq!(parts.len(), 1);

    // when
    let result = identify(parts[0].clone()).unwrap();

    // then
    assert_eq!(
      result,
      Identification::MessagePart {
        version: 0,
        part_index: 0,
        parts_total: 1,
        nonce: Some("nf47ekohh9ci20bdnrjg".into()),
        data: "0r7rf3m80rr69ic6ktsbkr3k4bcdo86618411joljt9kbvp7f4qst8kpkc3vjl9s1tfdph0".into(),
      }
    );
  }

  #[test]
  fn should_support_named_chunks() {
    // given
    let chunk = "icod-chunk:my chunk 1:d5hmup3301bt435o7vhlrc2poim1l1dcldpq3b010f8jg34bhm8co8h1rb89iml9htpfhcmtogogifj9ou8k4mve23a63s038ht0uvuafefqkr8l040g20j9cdnm8qo0040g2081040g2081040g2081040g2081040g2081040g2081040g";

    // when
    let result = identify(chunk.to_owned()).unwrap();

    // then
    assert_eq!(
      result,
      Identification::Chunk {
        name: "my chunk 1".into(),
        version: 0,
        key_hash: "av90pe1vsder0me4lgd8bb5beegqo083q4s0p2sdi36248eqq2cllacfebsb5ne4644jsqe7i515nrggqhgv00q4f87nvijrjul6q58".into(),
        required_chunks: 1,
        spare_chunks: 1,
        chunk_index: 1,
        data: "09km6rr4dc002081040g2081040g2081040g2081040g2081040g2081040g208".into(),
      }
    );
  }

  #[test]
  fn should_alter_chunks_name() {
    // given
    let chunk1 = "icod-chunk:d5hmup3301bt435o7vhlrc2poim1l1dcldpq3b010f8jg34bhm8co8h1rb89iml9htpfhcmtogogifj9ou8k4mve23a63s038ht0uvuafefqkr8l040g20j9cdnm8qo0040g2081040g2081040g2081040g2081040g2081040g2081040g";
    let chunk2 = "icod-chunk:my chunk 1:d5hmup3301bt435o7vhlrc2poim1l1dcldpq3b010f8jg34bhm8co8h1rb89iml9htpfhcmtogogifj9ou8k4mve23a63s038ht0uvuafefqkr8l040g20j9cdnm8qo0040g2081040g2081040g2081040g2081040g2081040g2081040g";
    let chunk3 = "icod-msg:d5hmup3301bt435o7vhlrc2poim1l1dcldpq3b010f8jg34bhm8co8h1rb89iml9htpfhcmtogogifj9ou8k4mve23a63s038ht0uvuafefqkr8l040g20j9cdnm8qo0040g2081040g2081040g2081040g2081040g2081040g2081040g";

    // when
    let res1 = alter_chunks_name(chunk1.into(), "new name".into());
    let res2 = alter_chunks_name(chunk2.into(), "new name".into());
    let res3 = alter_chunks_name(chunk3.into(), "new name".into());
    let res4 = alter_chunks_name(chunk1.into(), "new:name".into());
    let res5 = alter_chunks_name(chunk1.into(), "new name is way too long".into());

    // then
    let res = "icod-chunk:new name:d5hmup3301bt435o7vhlrc2poim1l1dcldpq3b010f8jg34bhm8co8h1rb89iml9htpfhcmtogogifj9ou8k4mve23a63s038ht0uvuafefqkr8l040g20j9cdnm8qo0040g2081040g2081040g2081040g2081040g2081040g2081040g";
    assert_eq!(res1, Ok(res.into()));
    assert_eq!(res2, Ok(res.into()));
    assert_eq!(res3, Err(AlterChunksNameError::NotAChunk));
    assert_eq!(res4, Err(AlterChunksNameError::InvalidCharacters));
    assert_eq!(res5, Err(AlterChunksNameError::NameTooLong));
  }
}
