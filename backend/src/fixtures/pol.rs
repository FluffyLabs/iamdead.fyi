use icod_data::models::{adapter::AdapterKind, pol::ProofOfLife};

pub fn pol(testament_id: i32) -> Vec<ProofOfLife> {
  vec![
    ProofOfLife {
      testament_id,
      months: 2,
      group: 0,
      kind: AdapterKind::Telegram,
    },
    ProofOfLife {
      testament_id,
      months: 2,
      group: 0,
      kind: AdapterKind::Email,
    },
  ]
}
