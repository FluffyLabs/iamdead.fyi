use diesel::associations::HasTable;
use diesel::r2d2::ConnectionManager;
use diesel::r2d2::Pool;
use diesel::r2d2::PooledConnection;
use diesel::result::Error;
use diesel::ExpressionMethods;
use diesel::OptionalExtension;
use diesel::QueryDsl;
use diesel::RunQueryDsl;
use diesel::SqliteConnection;
use models::user::User;

pub mod models;
pub mod schema;

mod migrations;

pub type DbPool = Pool<ConnectionManager<SqliteConnection>>;

type DbConnection = PooledConnection<ConnectionManager<SqliteConnection>>;

#[derive(Debug)]
pub struct MigrationError;

pub fn connection_pool(database_url: &str) -> DbPool {
  let manager = ConnectionManager::<SqliteConnection>::new(database_url);

  Pool::builder()
    .test_on_check_out(true)
    .build(manager)
    .expect("Could not build connection pool")
}

pub fn perform_migrations(connection: &mut DbConnection) -> Result<(), MigrationError> {
  migrations::run_migrations(connection).map_err(|e| {
    tracing::error!("Unable to run migrations: {}\n{:?}", e, e);
    MigrationError
  })?;

  Ok(())
}

pub fn insert_user(
  connection: &mut DbConnection,
  new_user: models::user::NewUser,
) -> Result<(), Error> {
  use self::schema::users::dsl;

  diesel::insert_into(dsl::users::table())
    .values(&new_user)
    .execute(connection)
    .map(|_| ())
    .map_err(|e| {
      tracing::error!("Error saving user: {:?}", e);
      e
    })?;

  Ok(())
}

pub fn query_users_by_auth_provider(
  connection: &mut DbConnection,
  auth_provider_val: &str,
  auth_provider_id_val: &str,
) -> Result<Option<User>, Error> {
  use self::schema::users::dsl;

  let user = dsl::users
    .filter(dsl::auth_provider.eq(auth_provider_val))
    .filter(dsl::auth_provider_id.eq(auth_provider_id_val))
    .first(connection)
    .optional()?;

  Ok(user)
}

pub fn query_users_by_id(connection: &mut DbConnection, user_id: i32) -> Result<User, Error> {
  use self::schema::users::dsl;

  let user = dsl::users.filter(dsl::id.eq(user_id)).first(connection)?;

  Ok(user)
}
