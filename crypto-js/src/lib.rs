pub mod encryption;
pub mod shamir;

pub(crate) fn parse_key(key: Vec<u8>) -> Result<[u8; 32], ()> {
  let mut out = [0u8; 32];
  if key.len() != 32 {
    return Err(());
  }
  out.copy_from_slice(&key);
  Ok(out)
}

// TODO [ToDr] Add methods for:
// 1. Key generation
// 2. Do the whole flow without leaking the keys (i.e. generate key, encrypt, chunk-up etc)
