# Agent 1 preregistration: complementary rank-3 source-seat-1 owner-zone scan

**Registered:** 2026-11-07 22:18 UTC  
**Question:** Under the unchanged baseline policy on the original rank-3 source deck, how often does Team Rocket's Handiwork occupy the source owner's discard while Bunnelby is Active with an attached Energy and an available attack slot, when rank 3 occupies physical seat 1?

This is the complementary physical-seat panel to [the source-seat-0 registration](agent1-rank3-owner-zone-scan-20261107.md). It reuses the other 16 original physical deals from Agent 2's already executed 32-deal exposure artifact. The two panels cover both physical source-seat orientations, with 16 deals per orientation.

## Frozen inputs

- Source deck: Aichi rank 3 original 60, converted-deck SHA-256 `72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f`.
- Reference deck: Aichi rank 1 original 60, converted-deck SHA-256 `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`.
- Engine: Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Physical seats: rank 3 source fixed at seat 1, rank 1 reference fixed at seat 0.
- Seeds: exactly 290130 through 290145 inclusive, 16 original source-seat-1 physical deals.
- Action cap: 260 native action roots per game.
- Seat mapping: `deckA = rank1`, `deckB = rank3`. The runner asserts the physical deck hashes and mapping before accepting a row.
- Policy: same exact `runOne` composition as the source-seat-0 scan and Agent 2's original census: canonical actor-only policy, actor-only root policy, paper Supporter discipline, same-target Energy selection, read-only FSS/Float census, and owner-zone observer. The native label is `agent2-original-rank3-passive-fss-float-rank3-fresh-0-<seed>`, matching the existing source-seat-1 baseline rows. No card, seed, policy, prompt choice, shuffle, or game rule is changed.
- Expected per-seed physical-deal fingerprints, status, winner, and action count are copied from Agent 2's [original 32-deal artifact 13364048992](../agent2-rank3-fss-float-natural-32-exposure-20261104.md). The exact expected rows are frozen below.

| Seed | Status | Winner | Native actions | Full-deal SHA-256 | Source-deal SHA-256 |
|---:|---|---:|---:|---|---|
| 290130 | action-cap | -1 | 260 | `4c46da00ca0d354b01006b99576a794d7204e99f1287c3bb3932215f4f0da4d4` | `2f30815a2f49597af602599cca15f23904d7f2f9825771d9b53856fe6df8d40e` |
| 290131 | action-cap | -1 | 260 | `511489c1ef54cd1790a85a2f7f3967f0cc31d2d0122fea6eb1b6b5efe5e5fc56` | `516411915dd2b040f425c7e943655de5947fded6899c2321d5af8f8e90644471` |
| 290132 | action-cap | -1 | 260 | `ce60d0f2227efd47b37a38d61ee080ccf2b741e99ab3b23e148942ac9c95849c` | `616863096413adde2d3cdc7fb075258ff4e283b5d86183ee1c206977c5de6024` |
| 290133 | action-cap | -1 | 260 | `511e736ccce4eda198065c19bd6807ecd5b53671f4293fdae53ac63af1ebfc1f` | `b4d136caa027ffa1e6f233230e93ce19266f30aed109ae4a715abaa59c92d71a` |
| 290134 | native-terminal | 0 | 28 | `e3dee5a4c35354678cc55a7c8862a914c3542e3478d1396b0186f9a6bfedaeb7` | `16608739e6e910d0464fbd3bdb7df623f2d599adc6eea6251a7a0e20bc2868e3` |
| 290135 | action-cap | -1 | 260 | `77ff520dbdc940311f85513720f9629c0e0ae6b2d6858dfc1bdc961a01253e96` | `91c503c53baf28f5f7a161db3dece4ea1b0c3274103ee1e7a820105341e86d61` |
| 290136 | action-cap | -1 | 260 | `5935141d98844a26ad5af9ee5b874850cd08dd33362907830cd5c6fbd72a7536` | `78ea9d7b12e7200b633a065de15dd1e795217ea72ac4b85b3ec53dbe6980b396` |
| 290137 | action-cap | -1 | 260 | `1e7e9837b20209285e45d15cc066341a3a43bfa563961d94ed9c74e8b6cfe82e` | `a98056a84961b27f7d3cea33ae2b4696b89463fdf485135f1ebfd3c92658d64d` |
| 290138 | action-cap | -1 | 260 | `d0fddb9bf8884e5c7367422adc2c17f860ee970be416e491de01be432f26201a` | `f067dd6b7079adb94e421f1cb201903c02edb1304435797ee9393dc25fb19b09` |
| 290139 | action-cap | -1 | 260 | `545e60c672990b9d84b51678fce9596d93ed986637241d89060a055b64b79ac6` | `cd61abf32b05ea52d7686171ea050d8e45754776103e5f48df5eb24bd43780df` |
| 290140 | action-cap | -1 | 260 | `5dac973a3ce964669ed1e6d7b76b3fb2cda1b82bcf050a3df7bb095070d77589` | `7e33f293d735a4391c14e348be1b1f06a2d43333fbe7530ec0cb79766d60b8f9` |
| 290141 | action-cap | -1 | 260 | `f4f12995ee8da9acfe8e34df6eecb9fb42764e3e323ba8de850c64d29785cfd3` | `ae2cc825fc06ea7d5676466e75907366af66fe1dbd73b02d68664aa6abc0a143` |
| 290142 | action-cap | -1 | 260 | `e3d1b5955977bfecf19f9736f4c5befca502e0c79d4a75bfb07fd0198d50978c` | `6cee0049c474a797c5ae4d6ee6531d4839429f8c51b45ebb9cc3552dd914f68f` |
| 290143 | native-terminal | 0 | 146 | `4c8f2770a0304cb8bd86fac8c464ee06eb4641453ef4c634cecc963478bc05d2` | `40bafc90e9e325388037ac9a977a6dfbeb1e7d3d777e5eeaa93e0061df55cd3a` |
| 290144 | action-cap | -1 | 260 | `d29d03619ea09f9e6521cb1c8277d03e01090ebe8dbba7fe2dbace6f571a4f0d` | `61825bcc6ba4c8a70fdbd2d36af46573c3064c095fd71c14921331f793585589` |
| 290145 | native-terminal | 0 | 92 | `78c2e21c62ab224cbfcea1ddde02da8143f248f4f3ba853f65634fcc107b57a2` | `b4500894417c3515e75650e3047864976b859ebf612da7c975d82a62873e742f` |

## Observation boundary

The observer runs around the existing native Store dispatch and copies state into a local diagnostic collection. It never returns data to either policy.

- It may capture the rank-3 owner's own deck, hand, discard, Lost Zone, Stadium, resolving Supporter, face-down Prize identities, and own board. These identities are retrospective research observations, not information available to the player.
- It captures only the opponent's public board, discard, Lost Zone, Stadium, game-use restrictions, and public hand/deck/Prize counts.
- It does not inspect opponent hand, deck, or Prize identities.
- It records source-owner roots and source-owner prompts during the Player Turn. Full owner-zone arrays are retained only when Handiwork is in the owner's hand or discard, or a structural Rototiller candidate exists.
- The structural candidate predicate is descriptive: Handiwork in source discard, Bunnelby PRC Active, printed Rototiller present, at least one attached Energy, and fewer than two attacks recorded this turn. It does not assert that a legal native Rototiller prompt was reached. The Store remains the authority for action legality.

## Outcomes to report

1. Exact number of games with Handiwork observed in hand, discard, deck, or Prizes.
2. Number of source-owner decision states with Handiwork in discard.
3. Number of structural Rototiller candidate states.
4. Exact owner deck, hand, discard, and Prize composition at each candidate state.
5. Relevant counts for Trainers' Mail, Forest Seal Stone, Arven, Teammates, VS Seeker, Lusamine, Lillie's Determination, Player's Ceremony, and Tropical Beach where those printings are present.
6. Per-seed parity against Agent 2's baseline: full physical-deal fingerprint, source-deal fingerprint, status, winner, action count, source/candidate deck hashes, and physical seat mapping.

## Interpretation boundary

This is a fixed 16-deal, one-seat diagnostic under the existing weak common policy. It is not an estimate of optimal-policy frequency, a matchup win rate, a paper-qualified game, or evidence for a deck nomination. Repeated decision roots within a game are dependent. If no structural candidate appears, the conclusion is limited to this registered seed panel and policy. The complementary source-seat-0 panel is separately registered and must retain its own parity receipt.
