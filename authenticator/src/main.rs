use icod_data::{get_connection_pool, perform_migrations};
use jsonwebtoken::{DecodingKey, Validation};
use tide_jwt::JwtAuthenticationDecoder;
use tide_tracing::TraceMiddleware;

use crate::auth::{require_authorization_middleware, Claims};

mod auth;
mod indie_auth;
mod state;
mod user;

#[async_std::main]
async fn main() -> tide::Result<()> {
  dotenvy::dotenv().ok();

  tracing_subscriber::fmt()
    .with_max_level(tracing::Level::DEBUG)
    .init();

  let database_url =
    dotenvy::var("DATABASE_URL").expect("DATABASE_URL env variable must be set in .env file.");
  let jwt_secret = dotenvy::var("SESSION_SECRET").expect("SESSION_SECRET must be set in .env file");
  let server_url = dotenvy::var("SERVER_URL").unwrap_or_else(|_| "127.0.0.1:8080".to_owned());

  let db_pool = get_connection_pool(&database_url);
  perform_migrations(&mut db_pool.get()?).expect("Error performing migrations");

  let jwt_secret_base64 = DecodingKey::from_base64_secret(&jwt_secret)?;

  let mut app = tide::with_state(state::State {
    db_pool,
    jwt_secret,
  });

  app.with(TraceMiddleware::new());

  app.with(JwtAuthenticationDecoder::<Claims>::new(
    Validation::default(),
    jwt_secret_base64,
  ));

  app
    .at("/auth/indie-auth/authorize")
    .post(indie_auth::authorize_indie_auth);

  let state = app.state().clone();
  app
    .at("/api/me")
    .with(require_authorization_middleware)
    .nest({
      let mut me = tide::with_state(state);
      me.at("/").get(user::profile);

      me.at("/recipients").get(user::recipients);

      me.at("/adapters").get(user::adapters);

      me.at("/stored").get(user::stored);

      me
    });

  app.listen(server_url).await?;

  Ok(())
}
