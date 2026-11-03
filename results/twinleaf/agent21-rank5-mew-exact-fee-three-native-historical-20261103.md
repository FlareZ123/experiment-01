# Agent 21: three exact physical DCE retreats and three same-turn copied attacks in eight known-seed original rank-5 games

**3 November 2026. Retrospective development evidence only. Zero competitively qualified games.**

## Registered frame and actual native execution

- Shared GitHub Actions manual workflow: [run 41608030388](https://github.com/FlareZ123/experiment-01/actions/runs/41608030388), head `fe9a54f81603f4f3c7c816a15612b9cc183e10dc`, **SUCCESS** after pinned native compilation and all ten old/new pure hook tests.
- Full unedited native JSON: [artifact 13217940926](https://github.com/FlareZ123/experiment-01/actions/runs/41608030388/artifacts/13217940926), ZIP SHA256 `2a0a3c168a0d8807bd71b5787226404a8f95fcfdcb016512d81e97740eeafa65`, JSON SHA256 `a313992311ad8d9db8f68be6a0db36de693942a0095a622cc7e1f1a1f2aa27e4`.
- Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Original rank-5 printed 60 SHA256 `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`. Original four known historical seed/seat groups from immutable registration Git blob `268023063cfcd1af2312b892e7a1eefd04e28c49`. Two distinct candidate fixed 60s, each in both physical seats.
- New **opt-in** hook `simulation/twinleaf/agent21-root-anchored-fusion-retreat-v2.cjs`, version `agent21-live-addplayer-anchored-dce-fusion-retreat-v2`; existing source owner-only Gene/Clefairy/Dedenne selector plus Agent9 Crobat fallback. Eight native rows were retained in original order.
- This was a **changed-code replay of already exposed historical seeds**; the older profile was not selected into this result. The observed drift from the historical frozen code pin was explicitly reported: `agent41-bilateral-v2-development.cjs` `59c1450…`→`15171b5…`; `agent13-actor-only-choose-attack.cjs` `05b5451…`→`9c2d9e1…`; `agent34-actor-only-root-policy.cjs` `3ca478d…`→`995ffdd…`; `agent41-paper-prompt-contract-portfolio.cjs` `41ac809…`→`8f1b50e…`. First attempt [run 41607146589](https://github.com/FlareZ123/experiment-01/actions/runs/41607146589) correctly failed at frozen source-hash preflight before attempting any native games. The second runner retained exact original seed/profile/deck hashes, recorded every executable-code drift, and labeled the replay retrospectively.

## Full archived trial disposition

| Trial | Source attacks declared | Native outcome | Actual engine turns |
| --- | ---: | --- | ---: |
| `5:0:A:champion-reference` | 2 | Terminal | 11 |
| `5:0:A:new-moon-lockbreaker-v1` | 4 | Terminal | 15 |
| `5:0:B:champion-reference` | 0 | Terminal | 10 |
| `5:0:B:new-moon-lockbreaker-v1` | 0 | Terminal | 16 |
| `5:1:A:champion-reference` | 0 | Terminal | 10 |
| `5:1:A:new-moon-lockbreaker-v1` | 3 | Terminal | 29 |
| `5:1:B:champion-reference` | 2 | 260-action cap | 68 |
| `5:1:B:new-moon-lockbreaker-v1` | 2 | 260-action cap | 71 |

These are game engine event counts and final native states, **not** real-paper time or match outcomes. No Monte Carlo inference is possible from the selectively reused historical seeds. Physical source-deal fingerprints matched for **three of four** candidate pairs. `5:1:A` did **not** match: the candidate champion-reference source set had mulligans `[0,4]` with four compensation cards drawn, whereas the new-moon source set had `[1,1]` and zero compensation. That pair is **incomparable as a matched physical deal**, despite sharing a seed and nominal source seat. The other three pairs have matching source-deal fingerprints; full two-sided deal fingerprints necessarily differ because the candidate 60s differ.

## Three native physical fee receipts and the canonical ledger action alias

Across eight genuine-looking pinned native Store roots, the new v2 audit observed **8 AddPlayer-anchored game Stores**, **208 anchored Pass roots**, **3 eligible owner-visible DCE offers**, **3 accepted native RetreatAction replacements**, **3 exact outgoing DCE-object-to-owner-discard fees**, **3 original Pokémon-object promotions**, **0 pending/unverified physical fees**, **0 Store rejections**, **0 reported auxiliary Passes**. Every replacement also had a same-turn genuine Store `Cross Fusion Strike` attack declaration with a settled public prompt chain. Exact recorded episodes:

| Original trial | Owner seat / global turn | Physical retiring Active → Mew VMAX | Canonical ledger prehook Pass / attack |
| --- | --- | --- | --- |
| `5:1:A:new-moon-lockbreaker-v1` | Seat 1 / T21 | Lillie's Clefairy ex JTG → Mew VMAX FST | Pass ordinal **96**, copied attack ordinal **97** |
| `5:1:B:champion-reference` | Seat 0 / T64 | Dedenne GX UNB → Mew VMAX FST | Pass ordinal **236**, copied attack ordinal **237** |
| `5:1:B:new-moon-lockbreaker-v1` | Seat 0 / T64 | Dedenne GX UNB → Mew VMAX FST | Pass ordinal **222**, copied attack ordinal **223** |

The physical Store received a selected `RetreatAction` instead of the logged `PassTurnAction`, paid the precise previously attached DCE, promoted the charged Mew, and retained the rest of the original board; the next canonical `AttackAction` on the same turn then settled a copied attack. The prior Pass label came from `headless.cjs` capturing the bot decision **before** the Store-interceptor replacement. Consequently, treating the root ledger as a literal table of Store actions is unsound for this specific class of post-choice intervention. This result now adds a genuine pinned-native demonstration to the [earlier source-order proof](agent21-pass-replacement-canonical-root-ledger-alias-20261103.md). The report makes **no** claim that an unmodified native Pass normally allows a same-turn attack.

For these three copied attacks the source's opponent did resume with a recorded immediate reply: one Pass on T22, a Dialga-GX PlayCard then Pass on T65, or a Gengar & Mimikyu-GX PlayCard then Pass on T65. These are genuine return-action roots, but their weak decision quality remains unqualified. In particular, the late T64 attacks cannot be treated as 25-minute paper knockout outcomes.

## Release exclusions and next step

These exact native fee events improve confidence in the mechanics of the distinct owner-paid retreat and expose a canonical observability failure. They do **not** establish paper legality across all modifiers, root-action identity certification, original-source full-game decision competence, official paper clock/overtime results, representative head-to-head win rate, or any degree of progress toward 99.5% across the whole Top32.

The strong architectural next step is to produce `RetreatAction` at the actor-owned **`decodeNextAction`** root, *before* `headless.cjs` captures its name and native object identity. Existing Agent34 actor-only code already supports Genesect via `dceMewMobilityRoot` and Crobat via `crobatDceMewRetreat`; consider a default-off reuse of Agent21's Dedenne/Clefairy intent within that actor layer, with the exact DCE physical fee observer retained as a separate validation hook. Do not select the present Store-dispatch v2 into the common candidate comparison without an explicit true-root action ledger join.

The wider benchmark remains **29/32 authenticated source 60s, zero competitively qualified games, and no proven fixed best sixty**.
