use icod_data::models::testament::{self, Testament, TestamentSensitive};

pub fn testament(testament_id: i32, user_id: i32) -> Testament {
  Testament {
    id: testament_id,
    user_id,
    required_chunks: 2,
    spare_chunks: 1,
    grace_period: 2,
  }
}

pub fn sensitive(testament_id: i32, recipient_id: i32) -> Vec<TestamentSensitive> {
  vec![
    TestamentSensitive {
      testament_id,
      kind: testament::DataKind::Message,
      index: 0,
      data: "icod-msg:00000000003p816ufbu5qocdo1gd1lbv8jtg5p2evhf6hss5mlh5196al1vstjlur0jsualcu9a781kdd73remv3f0in0c6udlu193c8hli2gghc45ac4bn9p900cnms8tl8gshlqqqghm5s0r806cf892fb1a4vltln97l1obp636gb9v1ms8vahhm7j0rf9nr6o80pavrm6vb1gi9i0fmr6mmp2gedju8lt2d5p8jqh20vvccr7tiobtg1vsu3dph3ohrlev9n72tor894e902ii1ipp08r6ujeivge0nok1kkgco6nrgfi7hk2tdha8ekln4qapncgnvp2sud30qds20jlj6fhfu1eqsrcvkl5gerelfc4pip04f9kk140brd2jgnk6pf8smf2l05bq9d95gn3r6p3j3n7fsti0sdgi54clt3vdkla0tpmvh6hsdio3nbibempv8tqqfivleloe1v4tpmes0fpro102ukr4iregth86ofcfcpakeqluj9evd37q1cd6is203180p99dut1n0rn450polavav66r5o5rsijqkfmdghbfk8082hp7eh227matnjptg1j7v9".into(),
      recipient_id: None,
    },
    TestamentSensitive {
      testament_id,
      kind: testament::DataKind::Message,
      index: 1,
      recipient_id: None,
      data:
        "icod-msg:00000080003kcs9l5mb8qtfvj41oqk58ar282aeb1phq1lq1k4qicvcch4bahmrn2uftmt9lia9rjgnoj15v0durglb1d3k9rdse27f99ls65anhndibtqs8c0b44ia7eh0uu885t4v5iquqvqapeav2vb0bt9f1omlr98ovhri5k2vh88374j30al1rvg2c7vrk8t9lfcq80bq5p1i6d5d29cdo7tdof57l4f9eqatiga432c5e23f2mqrjdonnvdqk7ht2hbmf6ubucnlqpqbgq2v27e3se6h7jortln186qtosg6otl6s05krrclk9a9ueesk2ufp4qj4cniad9vaoskql6rkeietqngikl0rmbedkjtusp19kbd56o0f8l8ibsah74sii3bhbj8bhj7a1l2svd7bctqrsdnrve5hl219k4mbvtibmo4mpf80jj8ob7aj5s11tsf2fkg7fchqk8jao8pkgq06bmloteurpmnvcn8s4a3qrest8eocrqp0gss3aj0hr63nai18nedaor994f96a2jjiqkoesu554o0t40ran19jp64k3b4lnnju5f6hhtipq0e78sa1rg0".into(),
    },
    TestamentSensitive {
      testament_id,
      kind: testament::DataKind::Message,
      index: 2,
      recipient_id: None,
      data:
        "icod-msg:000000g0003tdoqprkpv75qjkkqq3hd4h9oc3h9do5cunqsske0pd9dfaec1jlhoohau7abi1a6ioikt7f0lqpnvfcat3d873kfdiiid2u5aedtc526d9r3lla1dvc13iha9ui5bj5522uo7btubla2ci21gp1s6caqbb9hq1120j2mqbpkntjb8aodmak9gdghj71p8biubkuj3sui2esrm54p3nmej3cmq4qjc06p3jd3h827oeqamifjl041nj69da9bd3ukqsma5r33pq7pcr8va79f58vppkv1h59rnv5f1bikkfl3hmpojhclc1l9ucmhb5rl5aln03rl58bdd9b11r6m9c6fus8c5eod8vtdmdm2qpibv6gmb7kngqir0l0l8lehir5nh18fjd2no0snljm3gd1alupo47md8l4pqv8v1o760i1797k5lhlgv1ju3rfur5rmetf5vodfk3vi036cg8rn1p6ivhlldee3qlsh2lfd8sgf632rjmka2ll4j079r3lj5dnh05rmbaalr212jsj8a2djj9lu658adrats6ubirbr1tqv4c806udmfmorps06o6kbp5hgs".into(),
    },
    TestamentSensitive {
      testament_id,
      kind: testament::DataKind::Message,
      index: 3,
      recipient_id: None,
      data:
        "icod-msg:000000o0003je476a56d9pfhmu72fd6nv5i948ovcjqkl3p4tnkmrgt3fq9jpojanvabpm980lrtgap7h5h4ta16aar7dddnch4ktvms35bsog4rfol4k8jt6gv3cpso4bsrj4lr8s9qeh78ob1fum0e65psoqeakcs2siaam0ff22ajba2aoomvbkjgcqmcrveckqvm4i0va374st9mvpamnc86rpdeug4u80m6c4m8qtlsr3c73ps7eg8jojhlk9gdg4v38jukotikimseg8i9apbos7lsqrsvleoegguo14brau4347eigv7i07o9p7d6ho713mnl1cl62cljcbud88uojakqo16s9vc0sj6i7oe20rg3r2hcnj80lu1e9n57i4dskmg8ouagjbtepp829563vsjhekekkc1cbm0ohjieap5c3pbt8dnbvs6iffk5qr1s6voi1fdcd5eo69gjioumj6kqggrvmmpsdn7p7luh6oulv2aenfgbtm77ltov2dsjes528oql8i50ulgviphj1l8qjhs06q2us5oe8am03jhqca7evs2escsah0m19hss83srnofmmo6cp63d".into(),
    },
    TestamentSensitive {
      testament_id,
      kind: testament::DataKind::Message,
      index: 4,
      recipient_id: None,
      data:
        "icod-msg:00000100003qbjheqthl4pmoblmjerju37e8eo6iee47bqtit935uigbt4so5t3ki1o3o4336c51ttci0m8j950hifd0qgpq5j0tgkt4f8v5pp8u5pvdtuon6jc5q96mk7jm4m1ifhvjbetdoae25uenbk270t19uikeuc46tgd3plovffri38g7kpq7051agutseakqic6s9ct6rvpuet6td7bgvush8dc0j0kn557o6rf05j5re76uq0qhp5a05sdp4cu96caa5kukdbmp893a2387d60h6l07i5uc6bkefe8fme8kamf6jpokbvi0ldecdks2jpi0psokmra91t40hidb85o8sbdirkmq1lupp6lhgp8n4ushhmbcf3rnbcd9hgj2ghr2uj4jsm60c4pv488h1ud70qjovb3q99o98k2lpn7t80d3fcj1lv9tqqs0ovv8o16r0hir0h8pdm16jvmtra4149errgrt983jepnr0epif12ik30an9ecj9f9eidv220qh43iguf99tvdn1de2n8pmqrpitdha8bphtifldj1on7hcugts4877o2keu8sd1manb6ig7uo2a0b".into(),
    },
    TestamentSensitive {
      testament_id,
      kind: testament::DataKind::Message,
      index: 5,
      recipient_id: None,
      data:
        "icod-msg:00000180003nv67p0m9v08oc85f04ri841sn7pai3t5rv8edua8fmvj6i5ocbp34r9a90eincsv3g1ep47tti740958hpb4blgmusdvk77pq4ch6hdabevmepbr5e3rpk41vr6er0etcq2lhgmrt8o63cq6frddvoigv37arcv7f146gm51s448noi5dtc26ns0buh4r3ei9cnjjeqtrfpgcfot018qe6u4kao8e3qef4c8kieq8hdpdas3otgfc1j7u4691nptj77efkrork6cl86h369605d7co6pmfpndc71u3fq23gp7lf4e4n0r2qpij8d069sofrpkn278oajvq68m2loe1mnvdo6c8c5paisijib215jdnnnht6okj1goa1ef3n0m2iluifi5k47o7k3kinnjvd477svu98aq27m3isvef8aan7ur43baq995rfp0fl5psg3stsif0cuojktn95fj358nvos9v590o2qopj3m8dh2fpbd1aj5nn1c53mhn33mdpjjcu48oc0nsrp1cq3otg0ji5edpoknb5j4e9mu8j7cdd8rujfn7ipjfh26r91g2efpljcgj6vm".into(),
    },
    TestamentSensitive {
      testament_id,
      kind: testament::DataKind::Message,
      index: 6,
      recipient_id: None,
      data:
        "icod-msg:000001g0003p9ahlm1jm3o1qtvsjdkbju0qkbpjhdmj86jpp1apsrpv974ecbd0418nmd9gp05ca7c3cdcma0g0gf22eg9ls9d185a4043t7p1fa0aok7b9eqg42uik48r18eo4kl69o83f9d1a0bk8t1aj3hcoelmkl2gm64nbq77q130is9m3jv7qhrn3405qe4qerts9q6kfvm3g1is932q3o2".into(),
    },
    TestamentSensitive {
      testament_id,
      kind: testament::DataKind::Chunk,
      index: 0,
      recipient_id: Some(recipient_id),
      data: "icod-chunk:d5hmup3301vl6n92ihoa0lc8o12gtctjta0sjkglbt0q6qoaa1ida03h9tfls11233t44vimkntmu721bk76be9ib2nbmo0e8qspnljhvtir440c080g00eh5jonoq3she977816sctu48nmbnjlodgrlvp1tjnhtji650mou9um00p1jtfg".into(),
    },
  ]
}
