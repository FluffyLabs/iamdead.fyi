use form_urlencoded::Serializer;
use icod_data::models::NewUser;
use icod_data::{insert_user, query_users_by_auth_provider};
use tide::prelude::*;
use tide::{Body, Request, Response};

use crate::auth::create_jwt;
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

  let auth_provider = "IndieAuth".to_owned();

  let connection = &mut req.state().db_pool.get()?;
  let user = query_users_by_auth_provider(
    connection,
    auth_provider.clone(),
    json.me.clone(),
  );

  let user = match user? {
      Some(user) => user,
      None => {
          tracing::info!("User not found");
          insert_user(
              connection,
              NewUser {
                  auth_provider: auth_provider.clone(),
                  auth_provider_id: json.me.clone(),
                  username: json.me.clone(),
              },
          )?;
          let created_user = query_users_by_auth_provider(
              connection,
              auth_provider,
              json.me.clone(),
          )?;

          created_user.ok_or_else(|| anyhow::format_err!("Missing user after creation!"))?
    },
  };

 

  let response = create_jwt(user.id);
  tracing::info!("Website authorized correctly: {:?}", json.me);

  Ok(tide::Body::from_json(&response)?.into())
}
