use icod_data::{
  models::{
    adapter::{Adapter, AdapterKind},
    recipient::Recipient,
  },
  query_users_by_id,
};
use tide::{convert::json, Request};

use crate::{auth::Claims, state::State};

pub fn user_id(req: &Request<State>) -> Result<i32, tide::Error> {
  Ok(
    req
      .ext::<Claims>()
      .ok_or_else(|| tide::Error::from_str(tide::StatusCode::Unauthorized, "User is missing."))?
      .uid,
  )
}

pub async fn profile(req: Request<State>) -> tide::Result {
  let user_id = user_id(&req)?;
  let user = query_users_by_id(&mut req.state().db_pool.get()?, user_id)?;

  Ok(tide::Body::from_json(&user)?.into())
}

pub async fn recipients(req: Request<State>) -> tide::Result {
  let user_id = user_id(&req)?;

  let value = vec![
    Recipient {
      id: 1,
      user_id,
      name: "Mommy".into(),
      email: "mommy@home.com".into(),
    },
    Recipient {
      id: 2,
      user_id,
      name: "Daddy".into(),
      email: "dad@home.com".into(),
    },
    Recipient {
      id: 3,
      user_id,
      name: "Wife".into(),
      email: "wife@home.com".into(),
    },
  ];
  Ok(tide::Body::from_json(&value)?.into())
}

pub async fn adapters(req: Request<State>) -> tide::Result {
  let user_id = Some(user_id(&req)?);
  let recipient_id = None;
  let testament_id = None;

  let value = vec![
    Adapter {
      kind: AdapterKind::Telegram,
      user_id,
      recipient_id,
      testament_id,
      handle: "tomusdrw".into(),
    },
    Adapter {
      kind: AdapterKind::Whatsapp,
      user_id,
      recipient_id,
      testament_id,
      handle: "+48123456789".into(),
    },
    Adapter {
      kind: AdapterKind::Email,
      user_id,
      recipient_id,
      testament_id,
      handle: "hello@iamdead.fyi".into(),
    },
    // Adapter { id: AdapterKind::Twitter, user_id, recipient_id, testament_id, handle: "tomusdrw".into() },
  ];

  Ok(tide::Body::from_json(&value)?.into())
}

pub async fn testaments(_req: Request<State>) -> tide::Result {
  let value = json!(["test",]);
  Ok(tide::Body::from_json(&value)?.into())
}
