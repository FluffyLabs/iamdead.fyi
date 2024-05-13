use icod_data::db::user::query_by_id;
use tide::Request;

use crate::{auth::Claims, fixtures, State};

pub(crate) fn user_id(req: &Request<State>) -> Result<i32, tide::Error> {
  Ok(
    req
      .ext::<Claims>()
      .ok_or_else(|| tide::Error::from_str(tide::StatusCode::Unauthorized, "User is missing."))?
      .uid,
  )
}

pub async fn profile(req: Request<State>) -> tide::Result {
  let user_id = user_id(&req)?;
  let user = query_by_id(&mut req.state().db_pool.get()?, user_id)?;

  Ok(tide::Body::from_json(&user)?.into())
}

pub async fn recipients(req: Request<State>) -> tide::Result {
  let user_id = user_id(&req)?;

  let value = fixtures::recipients(user_id);
  Ok(tide::Body::from_json(&value)?.into())
}

pub async fn adapters(req: Request<State>) -> tide::Result {
  let user_id = Some(user_id(&req)?);
  let recipient_id = None;
  let testament_id = None;

  let value = fixtures::adapters(user_id, recipient_id, testament_id, false);

  Ok(tide::Body::from_json(&value)?.into())
}
