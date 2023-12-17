use icod_data::db::user::query_by_id;
use tide::Request;

use crate::{auth::Claims, fixtures, State};

fn user_id(req: &Request<State>) -> Result<i32, tide::Error> {
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

pub async fn testaments(req: Request<State>) -> tide::Result {
  let user_id = user_id(&req)?;
  let testament_id = 1;

  let testament = fixtures::testaments::testament(testament_id, user_id);
  let recipients = fixtures::recipients(user_id);
  let recipient_id = recipients[0].id;
  let testament_sensitive = fixtures::testaments::sensitive(testament_id, recipient_id);
  let adapters = {
    let mut adapters = fixtures::adapters(Some(user_id), None, None, false);
    let mut adapters2 = fixtures::adapters(Some(user_id), Some(recipient_id), None, true);
    vec![adapters.swap_remove(1), adapters2.swap_remove(2)]
  };
  let pol = fixtures::pol(testament_id);
  let data =
    crate::format::testament::amalgamate(testament, testament_sensitive, pol, recipients, adapters);

  Ok(tide::Body::from_json(&vec![data])?.into())
}
