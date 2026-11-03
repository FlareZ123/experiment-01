# Agent 21: two independent custody and provenance gaps in the historical Mew retreat observer

**Date:** 2026-11-03. **Scope:** the research-owned `simulation/twinleaf/agent21-owner-stranded-mew-native-pass-retreat.cjs` at Git blob `3ba7af6229aff8ffce74d33e40d4e034a7123075`. Zero competitive games are established. These are bounded test-double counterexamples, not claims that the pinned native Store itself accepts a free Retreat.

## Reproduction against actual repository module

Executed the exact fetched CommonJS module in an isolated JS runtime with injected `Store`, action, type, observation and policy stubs. Two same-class Store objects were made, one designated simulated/speculative and one designated live. Both were in a valid acting owner turn, with a legal-looking selector intent and the same source card identity. The wrapped invocation dispatched a `PassTurnAction` on each.

**Observed:** both objects dispatched `RetreatAction`, and the single policy audit recorded two `eligibleOwnerOffers` and two `nativeSettledPromotions`. The hook patches `Store.prototype.dispatch` and has **no live Store identity precondition**. It therefore cannot distinguish the two objects. This is an identity counterexample under controlled injected dependencies; whether a specific existing runner routes speculative Store dispatches through this hook requires a separately instrumented native test. Do not infer that *all* past live receipts are speculative.

The test-double Store deliberately swapped Crobat and Mew and set the native retreat-turn marker while **omitting the DCE Energy payment**. One preexisting `Double Colorless Energy SUM` was already in each owner's discard before the action. The policy's `inspectPending` checks only `owner.discard.cards.some(card => card.fullName === DCE)`, so it marked the promotion as `PROMOTED_AND_DCE_DISCARDED` despite no additional DCE being discarded, and despite the former Active retaining its attached DCE. In the two-Store reproduction:

| Observation | Actual |
| --- | ---: |
| Distinct dispatched Store objects | 2 |
| Reported offers | 2 |
| Reported `nativeSettledPromotions` | 2 |
| Increment in real owner's discard DCE count | 0 |
| Former Active still holding DCE | yes |
| Actually paid retreats | 0 |

**Consequence:** `nativeSettledPromotions` is not presently a valid fee-custody certification in isolation. This affects claims drawn from that particular research hook's audit. It does not challenge the separate pinned native six-case staged Store test, whose assertions inspect the removed Active Energy and changed discard.

## Required repair before using this receipt as a qualifying source event

1. Anchor to the actual per-game Store identity captured at genuine setup or provide an independently verified root action-object/Store join. Explicitly retain speculative counts separately. Simply identifying `state.activePlayer` or `playerId` does not identify the live object.
2. Snapshot the actual attached DCE **card object** on the outgoing Active before dispatch. After all payment prompts settle, verify the exact object is absent from the former Active, present in the same owner's discard, absent from that discard before, and that the intended Benched Mew was promoted. A preexisting equal-printing DCE in discard must be a **negative control**.
3. Distinguish `NATIVE_ACCEPTED`, `ROOT_LINK_VERIFIED`, `PAPER_PAYMENT_VERIFIED`, `PAPER_EFFECT_UNVERIFIED`, `REJECTED_ROOT_CONTINUATION`, and simulation-only outcomes. A native Store success is insufficient to certify the paper-game mechanism.
4. Test both physical seats with (a) genuine cost payment and (b) preexisting discard DCE plus deliberately unpaid retreat. Keep the previously archived 16-arm prospective zero-offer run and separate Agent9 Crobat witness immutable; no backfilled win-rate evidence.

This finding complements the 2026-11-03 Critic real-Store/rejection-integration directive and highlights an exact, repairable weakness in one preexisting receipt reporter. The broader objective remains one unchanged strong legal 60 against all 32 originals, with missing 23/25/28 source 60s and zero competitively qualified games.

## Existing repository primitives to reuse

Subsequent source inspection found an already implemented more stringent physical-fee witness, [Agent9's Crobat retreat custody](../../simulation/twinleaf/agent9-retreat-fee-custody.cjs): `captureCrobatRetreatFee` retains the **exact** outgoing DCE object before the Store action, and `settleCrobatRetreatFee` checks its later presence in owner discard, absence from board and Energy indexes, original Pokémon object promotion, and retreat-turn consumption. This resolves the **stale equal-printing discard** false-positive class for its Crobat-specific scope, subject to native verification. [Agent34's live card-instance auditor](../../simulation/twinleaf/agent34-live-card-instance-receipts.cjs) already anchors the actual Store on the first `AddPlayerAction` and counts auxiliary dispatches separately, providing an established research-owned pattern for root identity. **Reuse and compose these existing primitives rather than building another competing instrumentation framework.** Neither primitive by itself certifies full paper action legality or an official 25-minute game.

Executable test-double regression: [three expected-counterexample tests](../../tests/agent21-retreat-receipt-provenance-counterexample.test.cjs). The exact repository module and new test were independently loaded and all three tests executed successfully in an isolated JS runtime on 3 November. This is a pure module test, **not a GitHub Actions native-compiled run**. The tests assert current defective behavior to preserve evidence; they will need to flip to **strict rejection** when the old audit is repaired.
