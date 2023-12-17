//! Database interface.

use diesel::r2d2::ConnectionManager;
use diesel::r2d2::Pool;
use diesel::r2d2::PooledConnection;
use diesel::SqliteConnection;

pub mod user;

/// Database pool type.
pub type DbPool = Pool<ConnectionManager<SqliteConnection>>;

/// Initialize a database connection pool given database url.
pub fn connection_pool(database_url: &str) -> DbPool {
  let manager = ConnectionManager::<SqliteConnection>::new(database_url);

  Pool::builder()
    .test_on_check_out(true)
    .build(manager)
    .expect("Could not build connection pool")
}

/// Opaque migration error.
#[derive(Debug)]
pub struct MigrationError(String);

/// A db connection type alias.
pub type DbConnection = PooledConnection<ConnectionManager<SqliteConnection>>;

/// Perform any necessary database migrations.
pub fn perform_migrations(connection: &mut DbConnection) -> Result<(), MigrationError> {
  crate::migrations::run_migrations(connection).map_err(|e| {
    tracing::error!("Unable to run migrations: {}\n{:?}", e, e);
    MigrationError(format!("{:?}", e))
  })?;

  Ok(())
}
