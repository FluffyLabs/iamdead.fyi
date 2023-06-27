pub mod encryption;
pub mod shamir;

use icod_crypto::encryption::{NONCE_SIZE, KEY_SIZE};

pub(crate) fn parse_key(key: Vec<u8>) -> Result<[u8; KEY_SIZE], ()> {
  let mut out = [0u8; KEY_SIZE];
  if key.len() != KEY_SIZE {
    return Err(());
  }
  out.copy_from_slice(&key);
  Ok(out)
}

pub(crate) fn parse_nonce(nonce: Vec<u8>) -> Result<[u8; NONCE_SIZE], ()> {
    let mut n = [0u8; NONCE_SIZE];
    if nonce.len() != NONCE_SIZE {
        return Err(());
    }
    n.copy_from_slice(&nonce);
    Ok(n)
}
