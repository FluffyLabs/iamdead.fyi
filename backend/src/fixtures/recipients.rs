use icod_data::models::recipient::Recipient;

pub fn recipients(user_id: i32) -> Vec<Recipient> {
  vec![
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
  ]
}
