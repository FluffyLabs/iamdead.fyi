use std::{future::Future, pin::Pin};

use serde::{Deserialize, Serialize};
use tide::{Next, Request, Response, Result};

use crate::state::State;

#[derive(Debug, Serialize)]
pub struct AuthResponse {
  pub token: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
  pub id: i32,
  exp: u64,
}

const EXP: u64 = 10000000000;

pub fn create_jwt(id: i32) -> AuthResponse {
  let secret = std::env::var("SESSION_SECRET").unwrap();
  println!("secret: {:?}", secret);
  let claims = Claims { exp: EXP, id };

  let token = tide_jwt::jwtsign_secret(&claims, &secret).unwrap();
  AuthResponse { token }
}

pub fn require_authorization_middleware<'a>(
  req: Request<State>,
  next: Next<'a, State>,
) -> Pin<Box<dyn Future<Output = Result> + Send + 'a>> {
  Box::pin(async {
      let res = match req.ext::<Claims>() {
          None => Response::new(401),
          Some(_claims) => next.run(req).await,
      };

      Ok(res)
  })
}
