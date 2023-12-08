use crate::auth::require_authorization_middleware;

pub mod indie_auth;
pub mod user;

pub fn configure(app: &mut tide::Server<crate::State>) {
  app
    .at("/auth/indie-auth/authorize")
    .post(indie_auth::authorize_indie_auth);

  let state = app.state().clone();
  app
    .at("/api/me")
    .with(require_authorization_middleware)
    .nest({
      let mut me = tide::with_state(state);

      me.at("/").get(user::profile);

      me.at("/recipients").get(user::recipients);

      me.at("/adapters").get(user::adapters);

      me.at("/testaments").get(user::testaments);

      me
    });
}
