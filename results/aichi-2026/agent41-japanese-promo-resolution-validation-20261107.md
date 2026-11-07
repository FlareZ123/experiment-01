# Agent41: Japanese promo and Aichi full-list deck-resolution validation

**Date:** 7 November 2026  
**Owner:** Agent41  
**Status:** Native deck-resolution census reviewed; bounded source-use rerun pending. No game-strength conclusion.

## Evidence

I dispatched the existing `.github/workflows/aichi-card-audit.yml` workflow with `native_print_release_census=true` on current `main`.

- Workflow run: [42393051391](https://github.com/FlareZ123/experiment-01/actions/runs/42393051391)
- Artifact: 13582685437, `agent49-original-native-print-coverage-42393051391.zip`
- Pinned Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`
- Source manifest digest: `653ed6620d742f1f011d729557265e6173902b5fa87c8b4830f886f7be585173`

## Deck construction result

The authenticated Aichi manifest contains 29 complete 60-card lists and missing full lists at ranks 23, 25, and 28.

The pinned-source census reports:

- `permittedEngineReady`: all 29 complete ranks.
- `permittedEngineUnresolved`: empty.
- Promo-bearing ranks 3, 6, 7, 24, and 29 all resolve as 60-card decks under the permitted resolver policy.
- `completeField`: false, because three Top32 lists remain unavailable and exact original-print round-trips are incomplete.

The Japanese promo identities are integrated into deck resolution:

- Palace Book SMP resolves to its exact native ID in ranks 6, 7, and 24.
- Palace Belt BWP resolves to its exact native ID in ranks 6 and 29.
- Player's Ceremony SP 127 resolves through the research-only implementation in ranks 3, 6, 24, and 29 (five copies total).

Thus the earlier question about whether the Japanese promo-bearing lists can be constructed is answered for the 29 authenticated lists: they are engine-ready under the permitted proxy policy. The separate rank-6 source-use probe checks both physical seats and all three promo IDs in one deck. The fresh current-main run [42394051302](https://github.com/FlareZ123/experiment-01/actions/runs/42394051302) completed successfully; its `source-use` job passed on head `49bb9687680f92c586aff5d871e45297c41fd111`.

## Exact-print and semantic limitations

The census reports 949/989 original-print round-trips. Forty original printing rows have no exact native catalog ID:

- 35 Basic Energy printing rows use same-set Basic Energy proxies.
- 4 Player's Ceremony printing rows use the research-only implementation.
- 1 Electrike PRC 60 printing row uses the verified PRC60 disambiguation.

The permitted proxy summary counts 120 Basic Energy copies, five Player's Ceremony copies, 12 Prism Star name aliases, and one Electrike disambiguation. Palace Book and Palace Belt are exact native IDs.

The report's per-rank `NATIVE_PRINT_OR_DECK_RESOLUTION_BLOCKED` status indicates that at least one original printing is represented by a permitted proxy. It should be read alongside the separate `permittedEngineReady` and `permittedEngineUnresolved` fields; it does not mean the 60-card deck failed to construct.

The artifact explicitly records:

- `semanticEffectsCertified: false`
- `ownerPolicyCertified: false`
- `competitiveQualifiedGames: 0`
- `skippedNativeFixtures: NOT_EXECUTED_IN_THIS_CENSUS`

This is a deck-resolution and print-identity census only. It does not certify the behavior of every card effect, the opponent policies, or competitive performance.

## Consequence for the 99.5% objective

The simulator can construct all 29 authenticated lists under the documented permitted resolver policy. Full Top32 evaluation remains blocked by the three missing decklists and by the 40 original-print identity rows. Even after those are addressed, semantic card coverage and competitive policy validation remain separate requirements. No 99.5% or full-field win-rate claim is supported by this census.


## Governing Aichi legality profile

Agent12's primary-source confirmation establishes that the Aichi Open League used the official Japanese Extra profile: BW through the latest series, Japanese-language cards, 60 cards and six Prizes, under the contemporaneous official Extra banned list. The broad repository research scope remains BW onward, but international Expanded legality is not a substitute for Aichi event legality. This census establishes engine deck construction under permitted proxies only. It does not certify Japanese physical-printing provenance, individual card legality, or the event clock. See `results/aichi-2026/agent12-official-format-rules-and-mulligan-20261107.md`.
