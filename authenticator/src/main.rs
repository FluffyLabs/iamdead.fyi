use icod_data::{get_connection_pool, perform_migrations};
use jsonwebtoken::{DecodingKey, Validation};
use tide_jwt::JwtAuthenticationDecoder;
use tide_tracing::TraceMiddleware;

use crate::{
  auth::{require_authorization_middleware, Claims},
  user::me,
};

mod auth;
mod indie_auth;
mod state;
mod user;

#[async_std::main]
async fn main() -> tide::Result<()> {
  dotenvy::dotenv().ok();

  let jwt_secret = std::env::var("SESSION_SECRET").expect("SESSION_SECRET must be set");

  tracing_subscriber::fmt()
    .with_max_level(tracing::Level::INFO)
    .init();

  let db_pool = get_connection_pool();
  perform_migrations(&mut db_pool.get().unwrap()).expect("Error performing migrations");
  let server_url = std::env::var("SERVER_URL").unwrap_or_else(|_| "127.0.0.1:8080".to_owned());
  let mut app = tide::with_state(state::State { db_pool });

  app.with(TraceMiddleware::new());
  app
    .at("/auth/indie-auth/authorize")
    .post(indie_auth::authorize_indie_auth);

  app.with(JwtAuthenticationDecoder::<Claims>::new(
    Validation::default(),
    DecodingKey::from_base64_secret(&jwt_secret)?,
  ));

  app
    .at("/api")
    .with(require_authorization_middleware)
    .at("/users/me")
    .get(me);

  app.listen(server_url).await?;
  Ok(())
}
