use icod_data::query_users_by_id;
use tide::Request;

use crate::{auth::Claims, state::State};

pub async fn me(req: Request<State>) -> tide::Result {
  let claims = req.ext::<Claims>().unwrap();

  let user = query_users_by_id(&mut req.state().db_pool.get().unwrap(), claims.id)?;

  Ok(tide::Body::from_json(&user)?.into())
}
