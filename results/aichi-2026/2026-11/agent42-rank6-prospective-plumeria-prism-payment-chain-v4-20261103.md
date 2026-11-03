# Agent 42: prospective original-rank-6 Plumeria payment, Prism Star redirect, and opposing reply

**3 November 2026 | evidence from the sealed 2 November experiment | native source-action certificate only | zero competitively qualified games.**

## Question and evidence boundary

Does the printed Plumeria BUS 120 payment execute with two distinct physical cards from the genuine original rank-6 player's hand, followed by removal of a physical opponent Energy card and a later opponent policy root? A preceding native staged test exposed an illegal one-card-payment path. This audit tests what happened in naturally shuffled source games with a research-owned, default-off paper payment guard.

The [immutable prospective registration](../registrations/agent42-prospective-rank6-plumeria-native-20261102.json) was committed before game execution at **2026-11-02 17:02:06.971 UTC**. It specifies four original rank-6 physical-source seed groups (`476812527, 2570068619, 740204527, 615236925`), two fixed candidate identities per seed, and alternating source seats. The eight registered trials were each run once without and once with the guard. Both arms use the same parent policy profile and original printed roster. They make **16 native attempts** in total, comprising eight control/guard comparisons.

The compiling and executing [manual GitHub Actions run 41488493618](https://github.com/FlareZ123/experiment-01/actions/runs/41488493618) **succeeded**. Runner head: `400e951ded1aca38528219ad59ca861b85a3b4c7`. Pinned Twinleaf submodule: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Parent policy Git blob: `fcb54de73c7b9f92c5793258a8450ff605449fa8`; source roster blob: `ae773f6201d7aa69d31914dbfee66f3fba692200`. The workflow compiled the pinned engine and passed the local certificate's six pure test cases.

[Native evidence artifact 13163246895](https://github.com/FlareZ123/experiment-01/actions/runs/41488493618/artifacts/13163246895) was uploaded as `agent42-original-rank6-plumeria-physical-sourcechain-8attempts`; Actions log reported ZIP SHA-256 `d2c0ae5193ee61931b8d5933d00581575f1180df5e9f71eb772fea01df2f6b3a`. The original artifact was independently downloaded through the GitHub Actions artifact API on 3 November and its ZIP SHA-256 was computed locally; the entire digest matched the upload-job receipt. The included `agent42-plumeria-prospective-sourcechain-native.json` also independently confirms all 11 source-action certificates.

## Actual executed outcomes

The job's complete `AGENT42_PLUMERIA_SOURCECHAIN` JSON log contains these eight registered guarded rows:

| Original source rank-6 trial | Genuine Plumeria roots | Physical payment confirmed | Physical opposing Energy removal confirmed | Later opponent policy root |
| --- | ---: | --- | --- | --- |
| `6:0:A:champion-reference` | 2 | 2/2 | 2/2 | PlayCard, Attack |
| `6:0:A:new-moon-lockbreaker-v1` | 0 | n/a | n/a | n/a |
| `6:1:B:champion-reference` | 2 | 2/2 | 2/2 | Attack, PlayCard |
| `6:1:B:new-moon-lockbreaker-v1` | 1 | 1/1 | 1/1 | Pass |
| `6:2:A:champion-reference` | 1 | 1/1 | 1/1 | PlayCard |
| `6:2:A:new-moon-lockbreaker-v1` | 1 | 1/1 | 1/1 | Pass |
| `6:3:B:champion-reference` | 4 | 4/4 | 4/4 | Pass, PlayCard, Pass, Pass |
| `6:3:B:new-moon-lockbreaker-v1` | 0 | n/a | n/a | n/a |

Across those eight source games, **11/11 naturally selected source Plumeria roots** passed all seven narrow local certificate checks (with subsequent opponent roots: five Pass, four PlayCard, two Attack): native two-card-cost prompt, opponent targeting, native Energy selection, two physically paid owner cards, physical Energy removal, subsequent source turn completion, and a subsequent opponent policy action. For this limited payment intervention, all eight control/guard comparisons had **identical source and full physical initial-deal fingerprints and identical complete accepted native root ledgers**. The guard saw eight genuine AddPlayer-created Stores.

The single key accounting case is the rank-6 source payment in `6:3:B:champion-reference` on global turn 25. The original owner submitted two distinct physical cards, **Enhanced Hammer TWM** and **Wondrous Labyrinth Prism Star TEU**. The post-Store observer found Enhanced Hammer in the owner's discard pile and the same physical Wondrous Labyrinth object in the owner's **Lost Zone**. Both were absent from its hand. The opponent's Energy removal was also independently observed. The payment is correctly classified as two cards paid. A discard-only physical observer would falsely reject this valid Prism Star destination. The native follow-up also records the real opponent's turn 26 Pass, while its strategic quality remains unexamined.

## Reproducible code and safeguards

- [Prospective native runner](../../../simulation/evaluation/agent42-plumeria-prospective-sourcechain.cjs) records actual per-trial physical deals, accepted roots, control/guard parity, payment receipts and local certificates.
- [Research-owned paper-payment observer/guard v4](../../../simulation/twinleaf/agent42-plumeria-paper-payment-guard.cjs) rejects missing, duplicate or foreign cost cards and independently checks the post-Store physical destination of every submitted card, including the Prism Star Lost Zone replacement. The observer is scoped to original Plumeria BUS prompts in genuine AddPlayer-created Stores.
- [Local source-action certificate](../../../simulation/evaluation/agent42-plumeria-native-chain-certificate.cjs) joins native actual root and prompt ordinals, card payment/target/Energy custody, source turn completion and an opponent root. [Six pure negative and positive tests](../../../tests/agent42-plumeria-native-chain-certificate.test.cjs) passed in this compiled manual CI.
- [Earlier native one-card underpayment report](../agent42-plumeria-physical-shortpayment-20261102.md) demonstrates why accepted Store effects must never serve alone as proof of printed payment legality.

## Qualification and next decision

The local checks demonstrate that **these 11 Plumeria plays** were physically paid and resolved in the pinned native environment, including a real Prism Star replacement. The comparison did not produce any alternate gameplay root or provide a ranked candidate advantage. A later `PassTurnAction`, `PlayCardAction`, or `AttackAction` proves that an opponent root occurred; it does not establish competent counterplay.

**Competitive qualification: 0 games.** Full-game paper rules fidelity, quality of both decision policies, remaining matchup coverage, 25-minute match clock, and rank-23/25/28 original lists remain unresolved. This case supports a future common-policy payment certificate and its source evidence accounting, without advancing the 99.5% win-rate claim. Do not promote a candidate or revise the current fixed-60 decision index from this narrow result.
