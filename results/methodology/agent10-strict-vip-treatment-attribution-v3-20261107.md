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

1. Both control and treatment matches must report `finished:true`; capped, aborted, or incomplete matches fail closed. Both contiguous root ledgers must exactly match independently retained headless root-action counts. Missing counts fail closed.
2. The VIP audit must truthfully report `policyRecorded:true` and `nativeStoreSeen:true`. The v4 hook sets `policyRecorded` only in its `finally` block after it has observed a native Store.
3. The bounded event archive must reconcile exactly with accepted/rejected item and search counters. `unresolvedOwnerSearches` must be exactly zero, and accepted item/search counters must match. Every accepted item must have exactly one accepted search event, and every accepted search must link to exactly one accepted item. Partial item/search pairs fail closed.
4. The hook reports the expected ordinal protocol, successful two-player initialization, and a dispatch counter equal to the independent treatment count.
5. The first control/treatment divergence is exactly `PassTurnAction -> PlayCardAction(Battle VIP Pass)`, at the same physical seat, turn, and root ordinal.
6. The unique accepted intervention item event identifies that precise divergent ordinal and the physical printing `Battle VIP Pass FST`.
7. Its unique accepted search event links the item ordinal to its own `ResolvePromptAction` root. The root must be a `ChooseCardsPrompt` resolution whose `initiatingRootActionOrdinal` equals the item ordinal.
8. The search event must confirm physical movement: one or two selected printings, equal positive Bench increase and deck decrease, and `nativeBenchConfirmed:true`.

The helper validates intervention events against their exact roots. It does not require every natural VIP root in the ledger to have an intervention event. A natural VIP root that is itself the first divergence cannot be attributed unless the intervention audit contains its exact event.

## Versioned hook

New adapter: `simulation/twinleaf/agent9-battle-vip-owner-after-pass-v4.cjs`  
Pure hook test: `tests/agent9-battle-vip-owner-after-pass-v4.test.cjs`

The v4 adapter adds a match-local successful-Store-dispatch counter. It starts at ordinal zero after the two `AddPlayerAction` setup dispatches, then advances only after successful dispatches. The accepted item event records `itemRootOrdinal`; its pending owner search carries that ordinal and records `searchRootOrdinal`. The audit exposes:

- `rootOrdinalProtocol`
- `rootOrdinalInitialized`
- `dispatchRootCount`
- per-event `itemRootOrdinal` and `searchRootOrdinal`

Inspection of `simulation/twinleaf/headless.cjs` confirms that the headless `actions` counter is initialized after the two player additions, increments after successful loop dispatches, and is used as each root-ledger `actionOrdinal`. The v4 mock test verifies the counter's zero-based progression across unrelated successful roots, both physical seats, and the item-to-prompt pair. Native smoke workflow [run 42424474002](https://github.com/FlareZ123/experiment-01/actions/runs/42424474002) then ran one complete pinned Twinleaf game using the upstream smoke deck: 70 successful actions, 70 hook dispatches, and 70 root-ledger rows; the match finished, with zero VIP intervention events and `competitiveGameQualified:false`. This verifies counter alignment in one real native match. It does not yet verify event ordinals on a real VIP item/search pair; that still requires a v10c native positive case. The v3 contract fails closed on any mismatch.

## Evidence

- Combined pure gate: [GitHub Actions run 42424191267](https://github.com/FlareZ123/experiment-01/actions/runs/42424191267), **57/57 tests passed** under Node 22.16.0.
- Included the unchanged v2 regression suite, v3 adversarial attribution tests, and v4 hook tests.
- The v3 natural-root regression includes an unlogged natural seat-1 VIP pair before the intervention, a target seat-0 Pass-to-VIP divergence with explicit item/search ordinals, and another unlogged natural seat-1 VIP pair after the intervention. The target is attributed to item root 2 and search root 3; natural roots do not invalidate the pair.
- Negative cases cover absent or mismatched independent counts, hook counter mismatch, uninitialized ordinal protocol, missing or duplicate target events, wrong printing, wrong seat/turn, wrong prompt, wrong initiating root, reversed event order, incomplete event archives, rejected events, unconfirmed Bench movement, and inconsistent deck/Bench deltas.

## Native paired validation

The native test is now consolidated into the existing shared manual gate `.github/workflows/agent36-issue25-public-prompt-zone-diagnostic.yml`; no separate ordinal-smoke workflow remains. The temporary standalone smoke/probe tests were removed after their evidence was captured. The frozen v10b runner and registration were not modified.

Pinned native run [42425556536](https://github.com/FlareZ123/experiment-01/actions/runs/42425556536) passed the pre-hardening native tests under Node 22.16.0. It verified item/search root ordinals for both physical seats and showed four attributed cases in an eight-seed forced-pass A/B probe. That probe used a 96-action cap and manually marked the audit as recorded; it is retained as exploratory evidence only and does not satisfy the strengthened completion/audit contract below.

The existing shared manual gate [run 42425872616](https://github.com/FlareZ123/experiment-01/actions/runs/42425872616) passed with the earlier 96-action fixture and completed its separate phase-A diagnostic with `FALLBACK_CAPTURED_SOURCE_AND_PUBLIC_ZONE_MATCHED`. That is a fallback diagnostic outcome, not a definitive selection pass.

The native test has since been tightened: it uses four fixed seeds known to cover both seats, allows up to 512 root actions, requires both matches to finish, and consumes the hook's own `policyRecorded` field. The v3 helper now rejects capped/aborted matches, missing native Store evidence, unresolved owner searches, and any accepted item/search count mismatch. The next shared manual gate run must validate this stronger contract before the native A/B result is treated as accepted evidence.

The native A/B fixture is a diagnostic forced-pass policy used only to verify intervention mechanics and attribution. It is not a competitive playing policy and establishes no deck-strength inference.

The v3 pure suite now also includes the precise Agent41 native counterexample from [run 42339981746](https://github.com/FlareZ123/experiment-01/actions/runs/42339981746), row `9:205:B:new-moon-lockbreaker-v1`: an accepted seat-0 intervention item/search pair at root 13/14 plus an unlogged natural seat-1 VIP root at ordinal 22 in both ledgers. The test confirms the event/root join accepts the recorded pair and ignores the unrelated natural root; attribution is then declined because the first divergence is a different action. This preserves the distinction between event-archive completeness and first-divergence attribution.

## v10c integration contract

Do not modify the frozen v10b runner, registration, or its source manifest.

A new v10c runner should:

1. Supply the v4 hook through the canonical actor composition's `adapters.vipAfterPass` seam.
2. Preserve `itemRootOrdinal`, `searchRootOrdinal`, `rootOrdinalProtocol`, `rootOrdinalInitialized`, and `dispatchRootCount` in its sanitized native VIP audit.
3. Populate `controlRootActionCount` and `treatmentRootActionCount` from independent headless counters retained on each row. Use validated abort-evidence counters for aborted rows. Never substitute `ledger.length`; if no independent count exists, leave it absent and let attribution fail closed.
4. Run fresh native positive and negative cases, including the Agent41 `9:205:B:new-moon-lockbreaker-v1` natural-VIP counterexample.
5. Obtain independent review of native event/ordinal joins before using the result in any promotion decision.

The v4 adapter is not yet wired into v10c. The strengthened native paired fixture must pass in the shared manual gate before its full-match attribution result is accepted. Even then, it validates the adapter and attribution contract with a diagnostic forced-pass policy; it does not reproduce a v10c treatment. Neither the pure tests nor these native mechanics tests establish treatment efficacy, paper legality, paper-clock validity, or competitive strength. The native workflow also emits a post-job cleanup warning for the nested `vendor/twinleaf/vendor/pokemon-cards-css` submodule missing a URL in the superproject `.gitmodules`; test steps pass.
