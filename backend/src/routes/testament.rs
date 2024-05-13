use tide::Request;

use crate::{fixtures, format::testament::TestamentData, State};

use super::user::user_id;

pub async fn user_testaments(req: Request<State>) -> tide::Result {
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

pub async fn add_testament(mut req: Request<State>) -> tide::Result {
  let user_id = user_id(&req)?;
  let testament: TestamentData = req.body_json().await?;

  println!("{:?}", testament);
  Ok(tide::Body::from_string("ok".into()).into())
}
