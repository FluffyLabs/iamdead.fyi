use crate::JsValueOrString;

#[derive(Debug)]
pub enum Error {
  ValueError,
  DecodingError,
  PrefixError,
}

/// We could consider using something like BASE40 to maximize size-efficiency,
/// but for now we're choosing BASE32 for simplicity.
fn encode(b: Vec<u8>) -> String {
  data_encoding::BASE32_DNSSEC.encode(&b)
}

fn decode(v: &str) -> Result<Vec<u8>, ()> {
  data_encoding::BASE32_DNSSEC
    .decode(v.as_bytes())
    .map_err(|_| ())
}

pub fn bytes_to_prefixed_str(prefix: &str, b: Vec<u8>) -> String {
  format!("{}{}", prefix, encode(b))
}

pub fn bytes_to_prefixed_str_js(prefix: &str, b: Vec<u8>) -> JsValueOrString {
  let result = bytes_to_prefixed_str(prefix, b);
  #[cfg(test)]
  return result;
  #[cfg(not(test))]
  return wasm_bindgen::JsValue::from_str(&result);
}

pub fn prefixed_str_js_to_bytes(prefix: &str, v: JsValueOrString) -> Result<Vec<u8>, Error> {
  #[cfg(not(test))]
  let v = v.as_string().ok_or(Error::ValueError)?;
  let s = v.strip_prefix(prefix).ok_or(Error::PrefixError)?;
  decode(&s).map_err(|_| Error::DecodingError)
}
