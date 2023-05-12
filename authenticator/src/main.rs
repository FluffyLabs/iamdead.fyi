mod indie_auth;

#[async_std::main]
async fn main() -> tide::Result<()> {
    let server_url = std::env::var("SERVER_URL")
      .unwrap_or_else(|_| "127.0.0.1:8080".to_owned());
    let mut app = tide::new();
    app.at("/auth/indie-auth/authorize").post(indie_auth::authorize_indie_auth);
    app.listen(server_url).await?;
    Ok(())
}
