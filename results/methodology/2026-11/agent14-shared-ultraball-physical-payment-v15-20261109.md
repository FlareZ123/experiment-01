# Shared paper-prompt v15: Ultra Ball's actual two-card paid physical custody

**Agent 14 | 9 November 2026 | compiled native Store, both physical owner seats.** This is an opted-in paper-semantics guard for the existing two-player research evaluator. It does not create a new challenger deck, qualify a full paper game, or estimate any game win rate.

## The concrete gap and integrated correction

The incumbent shared `simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs` already had an original `Ultra Ball MEG` root count screen (at least two other cards in hand) and an independent `ChooseCardsPrompt` check for exactly two distinct offered references. It did **not** require those physical references to still belong to the actual prompt owner's hand at dispatch or observe whether the accepted reply actually paid the cost by transferring those references into that owner's discard pile. Native prompt settlement by itself is not physical-card payment evidence.

Commit [`c9ae960`](https://github.com/FlareZ123/experiment-01/commit/c9ae960c302458a5f8af6d7b3c1a76a63f75a59c) upgrades that **existing shared** portfolio to `agent41-unified-paper-prompt-contract-portfolio-v15-ultra-ball-paid-custody`:

1. Scope only an actual owner `ChooseCardsPrompt` from source-stamped `Ultra Ball MEG`, message `CHOOSE_CARD_TO_DISCARD`, `min=max=2`. The later deck-search prompt must not be misclassified as mandatory discard.
2. Before native dispatch, prove exactly two distinct physical references, each still in both the prompt's offered cards and the current actual owner's hand. Rejected or foreign references fail before native mutation.
3. After native `ResolvePromptAction` has actually settled, independently check that those **same two card objects** are absent from that owner's hand and present in the owner's discard. Emit `verifiedUltraBallPhysicalPayments`, `unverifiedUltraBallPhysicalPayments` and per-event `physicalEffectVerified`. A returned native prompt without that custody transition is marked settlement-unverified, never silently called a paid success.
4. Preserve existing scope, underlying pinned Store, reversible hook teardown, original printed sixties, both seats, and **default-off** `sharedPaperPaymentPortfolio` option. Do not change the shared developmental agent decision policy.

The 29 authenticated original Aichi inventories have **24 Ultra Ball MEG 131 copies across 14 ranks**: 4, 5, 8, 9, 12, 14, 16, 18, 20, 21, 22, 27, 30 and 32. Their exact name/count inventory is `results/aichi-2026/full-decklists.json`; this count alone says nothing about actual turn availability.

## Executed evidence

**[Manual native CI 42561700880](https://github.com/FlareZ123/experiment-01/actions/runs/42561700880) passed.** It checked out pinned Twinleaf and compiled the genuine server under Node 22. The same job passed all five new independent mock-Store regression tests and all four new compiled native Store cases.

| Test | Actual result | Evidential scope |
| --- | --- | --- |
| Pure exact-two/owner-hand check | Pass | Rejects 0, 1, duplicate and foreign physical cards, including card offered by forged prompt but absent from owner hand |
| Pure dispatch and custody | Pass | Foreign selection vetoed before Store mutation; genuine selection moves two card objects into owner discard |
| Pure native-like misleading settlement | Pass | Native-looking accepted prompt without actual discard transfer counted **unverified** |
| Pure root/search distinction | Pass | Ultra Ball without two other cards vetoed; optional later deck search is not marked as cost |
| Original rank20 native staged 60, owner seat 0 and 1 | **2/2 pass** | Actual pinned Store accepts `Ultra Ball MEG`, pays two named physical cards and reaches owner discard; portfolio independently confirms custody |
| Original rank14 native staged hand, owner seat 0 and 1 | **2/2 pass** | Independent portfolio rejects a submitted empty Ultra Ball payment **before dispatch**. The pinned native prompt's own `validate([])` returned **false** in this fixture; there is no claim that the pinned native validator accepted an empty payment here |

Reusable native fixtures: `simulation/twinleaf/agent47-apex-ultraball-original-store.cjs` and `simulation/twinleaf/agent4-ultra-ball-zero-payment-native.cjs`. New tests: `tests/2026-11/agent14-ultra-ball-portfolio-paid-custody.test.cjs` and `tests/2026-11/agent14-ultra-ball-portfolio-paid-custody.native.test.cjs`. Re-run without inventing a new workflow using the existing manual `.github/workflows/agent14-source-mobility-census.yml` with `ultra_ball_portfolio_native=true`.

The first CI failed on a deliberately incorrect mock-test counting expectation, corrected by `03a2537`; the second passed pure and positive native cases but failed on my unsupported assumption that the native zero-card validator returned true, corrected by `351888a`. The final third CI passed every new test. Earlier failed runs remain visible: [42561399097](https://github.com/FlareZ123/experiment-01/actions/runs/42561399097), [42561494834](https://github.com/FlareZ123/experiment-01/actions/runs/42561494834). They are not validation of bad paper interactions.

## Admission and next integration

The v15 receipt certifies the **Ultra Ball payment transition only**, in the tested native states. The independent check does not certify the value of spending either card, later optional searches, any attacker line, opponent decision quality, all effect families, a paper clock, or the entire match. Original rank20's native test stages its printed 60 in controlled zones and uses an artificial opponent; it is not a naturally dealt paper match.

Handed off to Agent41 in `communications/agent41/20261109T0427Z_agent14_ultraball_v15_physical_payment_handoff.md` for inclusion in Agent36's requested **one versioned shared paper-semantics profile** after shared-path compatibility review. Do not retroactively upgrade v8, v9, or other historic native results to paper-qualified status.

**Decision unchanged:** 29/32 authenticated opponent inventories (23, 25, 28 absent), zero competitively paper-qualified games, no selected final fixed 60 and no demonstrated 99.5% win rate.
