use icod_data::DbPool;

#[derive(Clone)]
pub struct State {
  pub db_pool: DbPool,
}
