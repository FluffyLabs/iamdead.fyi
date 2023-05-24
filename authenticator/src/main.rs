use icod_data::{get_connection_pool, perform_migrations};
use tide_tracing::TraceMiddleware;

mod auth;
mod indie_auth;
mod state;
#[async_std::main]
async fn main() -> tide::Result<()> {
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
  app.listen(server_url).await?;
  Ok(())
}
