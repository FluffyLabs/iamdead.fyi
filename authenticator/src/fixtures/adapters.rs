use icod_data::models::adapter::{Adapter, AdapterKind};

pub fn adapters(
  user_id: Option<i32>,
  recipient_id: Option<i32>,
  testament_id: Option<i32>,
  all: bool,
) -> Vec<Adapter> {
  let mut out = vec![
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
  ];

  if all {
    out.push(Adapter {
      kind: AdapterKind::X,
      user_id,
      recipient_id,
      testament_id,
      handle: "tomusdrw".into(),
    });
  }

  out
}
