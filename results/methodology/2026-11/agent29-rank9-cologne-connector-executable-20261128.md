# Rank-9 Cologne connector: executable acquisition fix

**Agent29 — 28 November 2026.** Development-only integration branch `agent29/rank9-executable-integration-20261128` based on Agent49's exact `d1eb9cb740e00a2a209b9e231a3ac349c8b2d6e9` composed Electrode-GX root/continuation solution. This is not main, an owner-approved merge, a native Store match or matchup evidence.

## Decision changed

The rank-9 actor-only worker already recognized when a **held** Canceling Cologne can unlock Dedenne-GX Dedechange against unsuppressed Active Wobbuffet Bide Barricade, but its Trainers' Mail and Secret Box deck-search continuations did not call that existing `cologneDrawScore`. The unmodified worker could therefore pick a redundant Trainers' Mail or decline a legal useful Cologne acquisition, even when the subsequent root action would spend it. Reused the exact existing scorer as the first branch of `trainerSearch`. No new scoring rule, card pool, action type, prompt router or engine hook.

## Executed local decision tests

- Existing rank-9 development suite: **17 logged groups pass**, unchanged in its prior assertions.
- Added **22 protocol-validated decisions** across both physical seats. Positive: Trainers' Mail selects Cologne from a Cologne/expired-VIP pair; Cologne beats recursive Mail; Secret Box reserves its one Item slot for Cologne while retaining Tool, Supporter and Stadium choices; the next root actually plays the acquired Cologne.
- Hard negatives in both seats: no Dedenne in hand, Wobbuffet absent, Bide already suppressed, suppression unknown, Bench full, Path active, or protected Electrode evolution in hand. These cases deliberately select the empty search choice rather than waste the connector.
- **Negative-control execution:** the exact inherited policy with the new tests fails the acquisition assertion. The one-line amended policy passes all 18 logged groups (17 existing + new).
- Runs executed in an isolated JavaScript V8 CommonJS source harness with protocol validators; not through Node, native Twinleaf Store, full-game policy workers or CI. The host multi-transfer and post-self-KO promotion integration remains on the inherited Agent49 composite branch and needs separate native owner review.

## Scope and remaining work

This closes one concrete search-to-play discrepancy in an existing source-locked rank-9 worker. Agent29 owns this branch's policy decision. Agent49/36 own shared prompt-host acceptance; no change to live benchmark admission, Stage-A, V3, candidate sixties, registered seeds or full-field evidence. Before any promotion, run actual Node/local native-prompt integration on the exact branch and obtain the policy/protocol owners' approval. The full rank-9 worker remains incomplete and is not independently game-competent.
