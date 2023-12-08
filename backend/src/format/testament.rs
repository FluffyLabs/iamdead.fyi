use icod_data::models::{
  adapter::{Adapter, AdapterKind},
  pol::ProofOfLife,
  recipient::Recipient,
  testament::{self, Testament, TestamentSensitive},
};
use std::collections::{BTreeMap, HashMap};

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TestamentChunksConfiguration {
  required: u8,
  spare: u8,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TestamentChunk {
  chunk: String,
  description: String,
  recipient: Option<TestamentRecipient>,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TestamentRecipient {
  id: i32,
  name: String,
  email: String,
  adapters: Vec<Adapter>,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TestamentAdapter {
  kind: AdapterKind,
  months: u32,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TestamentData {
  chunks_configuration: TestamentChunksConfiguration,
  encrypted_message_raw: Vec<String>,
  chunks: Vec<TestamentChunk>,
  proof_of_life: Vec<Vec<TestamentAdapter>>,
}

/// Converts data model, as saved in the DB into single object that we return to the frontend.
pub fn amalgamate(
  testament: Testament,
  sensitive: Vec<TestamentSensitive>,
  pol: Vec<ProofOfLife>,
  recipients: Vec<Recipient>,
  adapters: Vec<Adapter>,
) -> TestamentData {
  let recipients = recipients
    .into_iter()
    .map(|r| (r.id, r))
    .collect::<HashMap<_, _>>();
  let adapters = {
    let mut map = HashMap::new();
    for a in adapters {
      map.entry(a.recipient_id).or_insert_with(Vec::new).push(a);
    }
    map
  };

  let (encrypted_message, chunks) =
    partition(sensitive, |s| s.kind == testament::DataKind::Message);

  let chunks = chunks
    .into_iter()
    .map(|c| {
      let recipient = c.recipient_id.and_then(|id| recipients.get(&id));

      TestamentChunk {
        chunk: c.data,
        description: "".into(),
        recipient: recipient.map(|r| TestamentRecipient {
          id: r.id,
          name: r.name.clone(),
          email: r.email.clone(),
          adapters: adapters.get(&Some(r.id)).cloned().unwrap_or_default(),
        }),
      }
    })
    .collect();

  let proof_of_life = {
    let mut groups = BTreeMap::new();
    for p in pol {
      groups
        .entry(p.group)
        .or_insert_with(Vec::new)
        .push(TestamentAdapter {
          kind: p.kind,
          months: p.months,
        });
    }

    groups.into_iter().map(|x| x.1).collect::<Vec<_>>()
  };

  TestamentData {
    chunks_configuration: TestamentChunksConfiguration {
      required: testament.required_chunks,
      spare: testament.spare_chunks,
    },
    encrypted_message_raw: encrypted_message.into_iter().map(|c| c.data).collect(),
    chunks,
    proof_of_life,
  }
}

fn partition<T>(items: Vec<T>, split: impl Fn(&T) -> bool) -> (Vec<T>, Vec<T>) {
  let mut matching = vec![];
  let mut not_matching = vec![];
  for item in items {
    if split(&item) {
      matching.push(item);
    } else {
      not_matching.push(item);
    }
  }

  (matching, not_matching)
}

#[cfg(test)]
mod tests {

  #[test]
  fn should_amalgamate_testament_correctly() {
    assert_eq!(true, false);
  }
}
