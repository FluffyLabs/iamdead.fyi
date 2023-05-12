use tide::{Request, Response, Body};
use tide::prelude::*;
use surf;
use form_urlencoded::Serializer;


#[derive(Debug, Deserialize)]
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

pub async fn authorize_indie_auth(mut req: Request<()>) -> tide::Result {
    let IndieAuthBody { client_id, redirect_uri, code } = req.body_json().await?;
    

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
    println!("Website authorized correctly: {:?}", json.me);

    Ok(Response::new(204))
}