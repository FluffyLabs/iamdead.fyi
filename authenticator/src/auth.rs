use serde::{Deserialize, Serialize};
use tide_jwt;

#[derive(Debug, Serialize)]
pub struct AuthResponse {
  pub token: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
  id: i32,
  exp: u64,
}

const EXP: u64 = 10000000000;

pub fn create_jwt(id: i32) -> AuthResponse {
  let secret = std::env::var("SESSION_SECRET").unwrap();
  let claims = Claims { exp: EXP, id };

  let token = tide_jwt::jwtsign_secret(&claims, &secret).unwrap();
  AuthResponse { token }
}
