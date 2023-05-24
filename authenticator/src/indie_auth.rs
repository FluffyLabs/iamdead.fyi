use form_urlencoded::Serializer;
use icod_data::models::NewUser;
use icod_data::{query_users_by_auth_provider, insert_user};
use surf;
use tide::prelude::*;
use tide::{Body, Request, Response};

use crate::auth::{create_jwt};
use crate::state::State;


#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct IndieAuthBody {
  client_id: String,
  redirect_uri: String,
  code: String,
}

#[derive(Debug, Deserialize)]
struct IndieAuthResponse {
  me: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct IndieAuthError {
  error: String,
  error_description: String,
}

pub async fn authorize_indie_auth(mut req: Request<State>) -> tide::Result {
  let IndieAuthBody {
    client_id,
    redirect_uri,
    code,
  } = req.body_json().await?;

  let uri = "https://indieauth.com/auth";

  let encoded_form_data: String = Serializer::new(String::new())
    .append_pair("client_id", &client_id)
    .append_pair("redirect_uri", &redirect_uri)
    .append_pair("code", &code)
    .finish();

  let mut response = surf::post(uri)
    .body(encoded_form_data)
    .content_type("application/x-www-form-urlencoded;charset=UTF-8")
    .await?;

  if !response.status().is_success() {
    let mut res = Response::new(401);
    let error = response.body_json::<IndieAuthError>().await?;
    res.set_body(Body::from_json(&error)?);
    return Ok(res);
  }

  let json = response.body_json::<IndieAuthResponse>().await?;
  let user = query_users_by_auth_provider(&mut req.state().db_pool.get().unwrap(), "IndieAuth".to_owned(), json.me.clone());

  if user.is_ok() && user.unwrap().is_none() {
    tracing::info!("User not found");
    insert_user(&mut req.state().db_pool.get().unwrap(), NewUser {
      auth_provider: "IndieAuth".to_owned(),
      auth_provider_id: json.me.clone(),
      username: json.me.clone(),
    })?;    
  
  }

  let created_user = query_users_by_auth_provider(&mut req.state().db_pool.get().unwrap(), "IndieAuth".to_owned(), json.me.clone()).unwrap();

  let response = create_jwt(created_user.unwrap().id);
  tracing::info!("Website authorized correctly: {:?}", json.me);
    
  Ok(tide::Body::from_json(&response)?.into())

}
