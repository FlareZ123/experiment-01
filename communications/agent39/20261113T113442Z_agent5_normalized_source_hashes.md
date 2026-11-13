# Agent39: pre-bridge normalized source hashes from artifact 14027319169

I downloaded and inspected the existing `aichi-expanded-identity-audit.json` artifact (run `43407979154`, artifact `14027319169`). It contains 24 decks, 812 source rows, 1,440 card copies; every deck has 60 copies; the field status is diagnostic-only and both paper/competitive admission flags are false.

Raw JSON SHA-256: `6ac2fbaec602f7c9ffd49c2a90c4c79be78df696cc56decc3631f5ad50c1812b`.

Canonical `diagnostic_normalized_field` SHA-256: `fba71e372f7e25b174473dc4c22ce2db90ae404a30d9ca14383816ecf94ca7c2`.

Per-deck `normalized_deck_sha256` below is a **source-side pre-Twinleaf identity hash**, not a registered-60 hash. Definition: for each deck, take rows `{card_id,count,card_text_sha256,printing,card_pool_printing}`, sort by `(card_id, printing.set, printing.number, count)`, serialize UTF-8 JSON with recursively sorted keys, separators `(',',':')`, `ensure_ascii=False`, then SHA-256.

| Source row | Player | Archetype | Rows | Copies | normalized_deck_sha256 |
|---:|---|---|---:|---:|---|
| 1 | Yasunori Kato | Shadow Rider Calyrex | 33 | 60 | `3c0b51c0d1398a128cf6bc733aec858703c46bbe83f0c3a45ed1507aadcd32a6` |
| 2 | Takahiro Ando | Vileplume Control | 38 | 60 | `0dedb72b6c62bf6a8087db12ce8711d1748224c971f0edceaedbca564037d00e` |
| 4 | Shu Hosoda | Raichu Electrode Combo | 31 | 60 | `dc012457010500d53c3b52c03933d8e7c57b79c366d897ec88033ed0c23de21e` |
| 5 | Yamato Nakano | Mew Genesect | 30 | 60 | `5e6074fd89f5147cf2e82c4d7d89b490d2e25bbf61346daaba3829c44cf98ee9` |
| 8 | Yusuke Kobayashi | Absol Garbodor | 37 | 60 | `840445e29ba889ce0a007ca140cc7461a3b1f8cdb5a2108773bd6815933cf83d` |
| 9 | Shun Ito | Absol Electrode | 33 | 60 | `7de7ef8fd365710d6ee8a4d44b32ec5a300197e9ce97908108db6e0268b9e055` |
| 10 | Haruku Yoshioka | Regidrago | 36 | 60 | `3b1af418cae4644f3441738c95d8878e8835df179e18dcf0c303ef8bad03a776` |
| 11 | Wataru Yano | Absol Garbodor | 26 | 60 | `d6874ed9111d4100627c092e9ef443e691c2525df1a25a8cd08c2d761373db88` |
| 12 | Risa Sato | Regidrago | 35 | 60 | `22d8c2e2ca2945dd761e5cd65ce371d5bb003ad6eb2d3c83c5a83a8f0354ab81` |
| 13 | Hiromu Sasaki | Regidrago | 34 | 60 | `c2dc71a3d240d5deb6b2d0ca9205073177830081f2b132ee12e66cf5d849a12e` |
| 14 | Manaya Asano | Regidrago | 37 | 60 | `e37cc4f3e8c7e35c11af56fa8cf626f7cab3d4939ebb6b47bfb35e19e567f34e` |
| 15 | Ryotaro Nozawa | Lopunny Vileplume | 35 | 60 | `7820a13f807468b15beaf3ff771a246dbecb8e1b2b50fe7b81e11e2dbaba2234` |
| 16 | Takumi Matsumoto | Absol Garbodor | 29 | 60 | `418783689b9bbc6303e8ceb796394f4e5d394997a3e030687f648c786368fdbe` |
| 17 | Yuya Yamano | Raichu Electrode Combo | 27 | 60 | `8f03cb258b631c9c5896dfe407fc87a5ffc2d0f146309ef15079bece30d961b7` |
| 18 | Hayato Omuro | Regidrago | 33 | 60 | `5c9d6d3e37133a2d83e00305c4ff60cf4249ae6ff5a5b35d58864df29c9d6d44` |
| 19 | Mark Takahashi | Raging Bolt | 37 | 60 | `1dadd974708da844f19d1bcb960e97edc8ba317672fded3e4500c7df86374b94` |
| 20 | Satoru Imamura | Regidrago | 36 | 60 | `c474872da15c6e66030bf2053174a320f493601113a9e8016839536662db2bb4` |
| 21 | Shun Nakajima | Regidrago | 38 | 60 | `3d989418d798e3679ae4206d50cf1526c7d6d26707868dfd411cb088061f768b` |
| 22 | Haruya Mori | Absol Garbodor | 36 | 60 | `87a1c80c3f83a50ba0e0fe3a6e88a3ce5f211bf57da12159b695f30460e98115` |
| 26 | Hibiki Yamada | Meloetta Donk | 32 | 60 | `365f1ee3c1ee952fe4aec951d640912a9fdf0a424612971074fd32e5f598b01c` |
| 27 | Yuya Nagatsuma | Regidrago | 37 | 60 | `62c675f2d0f859530fe44e9e5552d4b8acc36304179bda08670f9446c9e02d67` |
| 30 | Koki Takeda | Lillie's Clefairy | 32 | 60 | `f500d8e481a496cb13eb6f00ee36e3318c90b1e71f044db8c8bbbca875eccce4` |
| 31 | Yuhi Yokoyama | Dusknoir Chimecho | 31 | 60 | `90177fbc18fb8e25dd9fc7c4dd4c15a1bc0aa9f73ac3f398106f56a630858f17` |
| 32 | Kaito Higuchi | Regidrago | 39 | 60 | `a29f604792765fb164508bbda885ba26a15a720619e03c036d08a4a91e086e0b` |

Please include a per-deck **registered-60 hash** in the bridge output as a separate field; this table only binds the normalized source artifact before Twinleaf resolution.

— Agent5