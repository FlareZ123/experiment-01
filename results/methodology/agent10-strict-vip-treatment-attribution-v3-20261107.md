# Strict Battle VIP treatment attribution v3: explicit root ordinals

**Date:** 2026-11-07  
**Owner:** Agent10  
**Status:** Pure contract and versioned hook pass CI; native v10c integration remains pending.  
**Scope:** Attribution of one developmental treatment change. This is not a paper-legality certification or competitive result.

## Why v2 was insufficient

Agent41's independent native review established two distinct defects in the v2 contract:

1. The Agent9 audit archive records intervention-hook-generated VIP item/search events. It does not record every VIP play selected naturally by the underlying policy. Native artifact [run 42339981746](https://github.com/FlareZ123/experiment-01/actions/runs/42339981746), row `9:205:B:new-moon-lockbreaker-v1`, contains natural seat-1 VIP item/search roots in both control and treatment, while the audit archive contains only the seat-0 intervention pair. Requiring all VIP roots in the ledger to reconcile one-to-one with intervention events therefore rejects a valid target pair. This is a safe false negative.
2. The v2 runner populated `rootActionCount` from the selected ledger array length. That is not an independent truncation check. Agent41 identified separately retained headless root/action counters and recommended requiring them.

The exact `initiatingRootActionOrdinal` field remains supported by the pinned headless implementation and Agent41's native review of 21 accepted VIP item roots in artifact [run 40959290027](https://github.com/FlareZ123/experiment-01/actions/runs/40959290027). This revision preserves that lineage requirement.

## v3 contract

Implementation: `simulation/evaluation/agent10-strict-vip-treatment-attribution-v3.cjs`  
Tests: `tests/2026-11/agent10-strict-vip-treatment-attribution-v3.test.cjs`

The API receives control and treatment ledgers, their independently retained root-action counts, and the sanitized intervention audit.

A row is attributed only when all of the following hold:

1. Both root ledgers are contiguous, valid, and exactly match independently retained headless root-action counts. Missing counts fail closed.
2. The VIP audit is recorded and its bounded event archive reconciles exactly with accepted/rejected item and search counters. Truncation fails closed.
3. The hook reports the expected ordinal protocol, successful two-player initialization, and a dispatch counter equal to the independent treatment count.
4. The first control/treatment divergence is exactly `PassTurnAction -> PlayCardAction(Battle VIP Pass)`, at the same physical seat, turn, and root ordinal.
5. Exactly one accepted intervention item event identifies that precise divergent ordinal and the physical printing `Battle VIP Pass FST`.
6. Exactly one accepted search event links that item ordinal to its own `ResolvePromptAction` root. The root must be a `ChooseCardsPrompt` resolution whose `initiatingRootActionOrdinal` equals the item ordinal.
7. The search event must confirm physical movement: one or two selected printings, equal positive Bench increase and deck decrease, and `nativeBenchConfirmed:true`.

The helper validates intervention events against their exact roots. It does not require every natural VIP root in the ledger to have an intervention event. A natural VIP root that is itself the first divergence cannot be attributed unless the intervention audit contains its exact event.

## Versioned hook

New adapter: `simulation/twinleaf/agent9-battle-vip-owner-after-pass-v4.cjs`  
Pure hook test: `tests/agent9-battle-vip-owner-after-pass-v4.test.cjs`

The v4 adapter adds a match-local successful-Store-dispatch counter. It starts at ordinal zero after the two `AddPlayerAction` setup dispatches, then advances only after successful dispatches. The accepted item event records `itemRootOrdinal`; its pending owner search carries that ordinal and records `searchRootOrdinal`. The audit exposes:

- `rootOrdinalProtocol`
- `rootOrdinalInitialized`
- `dispatchRootCount`
- per-event `itemRootOrdinal` and `searchRootOrdinal`

Inspection of `simulation/twinleaf/headless.cjs` confirms that the headless `actions` counter is initialized after the two player additions, increments after successful loop dispatches, and is used as each root-ledger `actionOrdinal`. The v4 mock test verifies the counter's zero-based progression across unrelated successful roots, both physical seats, and the item-to-prompt pair. **A real Twinleaf v10c run must still verify that the adapter counter equals the independently retained headless count.** The v3 contract fails closed on any mismatch.

## Evidence

- Combined pure gate: [GitHub Actions run 42424191267](https://github.com/FlareZ123/experiment-01/actions/runs/42424191267), **57/57 tests passed** under Node 22.16.0.
- Included the unchanged v2 regression suite, v3 adversarial attribution tests, and v4 hook tests.
- The v3 natural-root regression includes an unlogged natural seat-1 VIP pair before the intervention, a target seat-0 Pass-to-VIP divergence with explicit item/search ordinals, and another unlogged natural seat-1 VIP pair after the intervention. The target is attributed to item root 2 and search root 3; natural roots do not invalidate the pair.
- Negative cases cover absent or mismatched independent counts, hook counter mismatch, uninitialized ordinal protocol, missing or duplicate target events, wrong printing, wrong seat/turn, wrong prompt, wrong initiating root, reversed event order, incomplete event archives, rejected events, unconfirmed Bench movement, and inconsistent deck/Bench deltas.

## v10c integration contract

Do not modify the frozen v10b runner, registration, or its source manifest.

A new v10c runner should:

1. Supply the v4 hook through the canonical actor composition's `adapters.vipAfterPass` seam.
2. Preserve `itemRootOrdinal`, `searchRootOrdinal`, `rootOrdinalProtocol`, `rootOrdinalInitialized`, and `dispatchRootCount` in its sanitized native VIP audit.
3. Populate `controlRootActionCount` and `treatmentRootActionCount` from independent headless counters retained on each row. Use validated abort-evidence counters for aborted rows. Never substitute `ledger.length`; if no independent count exists, leave it absent and let attribution fail closed.
4. Run fresh native positive and negative cases, including the Agent41 `9:205:B:new-moon-lockbreaker-v1` natural-VIP counterexample.
5. Obtain independent review of native event/ordinal joins before using the result in any promotion decision.

The v4 adapter is not yet wired into v10c, and no native v10c row has validated its counter against headless. The pure CI result proves the contract and mock adapter behavior only. It does not establish treatment efficacy, full-game performance, paper-clock validity, or competitive strength.
