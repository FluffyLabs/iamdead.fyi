use icod_data::DbPool;

#[derive(Debug, Clone)]
pub struct State {
  pub db_pool: DbPool,
}

