use std::{future::Future, pin::Pin};

use serde::{Deserialize, Serialize};
use tide::{Next, Request};

use crate::State;

#[derive(Debug, Serialize)]
pub struct AuthResponse {
  pub token: String,
}

/// JWT claims object.
///
/// Keep the field names here small, since a serialized version of this
/// is passed with every request in the cookie as JWT token.
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
  /// Our own user id.
  pub uid: i32,
  /// Expiration claim (reserved), required by JWT.
  exp: usize,
}

// TODO [ToDr] Should be initialized with current date + session duration.
const EXPIRATION: usize = 10_000_000_000;

pub fn create_jwt(user_id: i32, secret: &str) -> Result<AuthResponse, anyhow::Error> {
  let claims = Claims {
    exp: EXPIRATION,
    uid: user_id,
  };

  let token = tide_jwt::jwtsign_secret(&claims, secret)?;
  Ok(AuthResponse { token })
}

pub fn require_authorization_middleware<'a>(
  req: Request<State>,
  next: Next<'a, State>,
) -> Pin<Box<dyn Future<Output = tide::Result> + Send + 'a>> {
  Box::pin(async {
    match req.ext::<Claims>() {
      None => Err(tide::Error::from_str(
        tide::StatusCode::Unauthorized,
        "log in required",
      )),
      Some(_claims) => Ok(next.run(req).await),
    }
  })
}
