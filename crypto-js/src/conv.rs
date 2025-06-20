use crate::JsValueOrString;

#[derive(Debug)]
pub enum Error {
  ValueError,
  DecodingError,
  PrefixError,
}

/// We could consider using something like BASE40 to maximize size-efficiency,
/// but for now we're choosing BASE32 for simplicity.
pub(crate) fn encode(b: &[u8]) -> String {
  data_encoding::BASE32_DNSSEC.encode(b)
}

pub(crate) fn decode(v: &str) -> Result<Vec<u8>, ()> {
  data_encoding::BASE32_DNSSEC
    .decode(v.as_bytes())
    .map_err(|_| ())
}

pub fn bytes_to_prefixed_str(prefix: &str, b: &[u8]) -> String {
  format!("{}{}", prefix, encode(b))
}

pub fn bytes_to_prefixed_str_js(prefix: &str, b: &[u8]) -> JsValueOrString {
  let result = bytes_to_prefixed_str(prefix, b);
  js_value_or_string(result)
}

pub fn prefixed_str_js_to_bytes(
  prefix: &str,
  v: JsValueOrString,
  strip_to_next_colon: bool,
) -> Result<Vec<u8>, Error> {
  #[cfg(not(test))]
  let v = v.as_string().ok_or(Error::ValueError)?;
  let s = v.strip_prefix(prefix).ok_or(Error::PrefixError)?;
  let s = if strip_to_next_colon {
    if let Some(idx) = s.find(":") {
      s.split_at(idx + 1).1
    } else {
      s
    }
  } else {
    s
  };
  decode(&s).map_err(|_| Error::DecodingError)
}

pub fn js_value_or_string(s: String) -> JsValueOrString {
  #[cfg(test)]
  return s;
  #[cfg(not(test))]
  return wasm_bindgen::JsValue::from_str(&s);
}
