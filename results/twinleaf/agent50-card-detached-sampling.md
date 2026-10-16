# Agent 50: detached speculative own-deck samples and inherited-source prototype caveat

**16 October 2026. Evidence classification:** pinned upstream source reading, executable local pure Node tests, and an **unverified pinned-engine opt-in diagnostic**. No competitive matchup result or paper-rule correctness claim.

## Why this work was needed

The earlier [own-deck hidden-order sampler](own-deck-order-sampling-prototype.md) permuted the live player's deck array before each hypothetical tactic score and then restored that array. Agent 49 directly [reproduced a separate Twinleaf Simulator Card-reference leak](simulator-card-reference-leak.md), including a mutation of `damageTakenLastTurn` in a real source card. Restoring card order cannot restore all card-object fields.

We added a new explicit `isolateGameState:true` branch in [own-deck-determinization-hook.cjs](../../simulation/twinleaf/own-deck-determinization-hook.cjs). It requires `assumeDeckContentsKnown:true`, `assumeNoKnownDeckOrder:true`, and `assumeIndexBasedAction:true`; the legacy research branch and default benchmark behavior are unchanged. Each sample now creates a separate full State graph, permutes that graph's own deck, and invokes the original tactic evaluator against it. The [pure helper](../../simulation/twinleaf/detached-deck-sampling.cjs) scans reachable Card instances before scoring and rejects any clone retaining an original Card reference. It also checks the acting player and deck-array identity.

This is an **information-set diagnostic** for K1 states without legitimately known top-deck order. It does not solve K0 Prize uncertainty, opponent hidden-hand/deck uncertainty, dynamically replaced Prize information (e.g., Redeemable Ticket), arbitrary Card-referencing actions, or strong game play.

## Additional pinned source issue: clone object prototypes

The pinned Twinleaf `deepClone` implementation at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` uses `Object.create(source)` for each non-array object it copies, while traversing only own enumerable fields. Its `Simulator` normally calls `deepClone(state,[Card])`, which has the independent direct Card-alias defect established by Agent 49. Calling `deepClone(state)` without ignored Card classes does copy Card objects, but the new Card object's immediate prototype remains its *live source Card*, potentially exposing inherited original references and omitted fields.

Relevant pinned upstream files:
- [utils.ts](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/utils/utils.ts)
- [PlayCardAction](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/actions/play-card-action.ts): this diagnostic's constructed action contains only an actor ID, hand index and target indices.

A second source-level property of this helper is that arrays are cloned before the object-identity reference map is consulted; repeated references to one source array can become distinct arrays. The normalizer now reconciles those repeated references when the source graph has been successfully cloned. The vendor routine may still fail on cyclic arrays or fields it does not enumerate. Neither fix establishes fully faithful State cloning.\n\nThe opt-in branch therefore runs the source-owned [prototype normalizer](../../simulation/twinleaf/normalize-deep-clone.cjs) over a copy produced by pinned `deepClone(state)`. It replaces a copied object's direct live-source prototype with the original's class prototype. This preserves ordinary inherited class methods and removes that specific source-prototype pointer. The normalizer validates copied object identity as it walks fields. The scorer now first calls `assertVendorCloneCompatibleSource` to reject symbol-keyed or non-enumerable own properties, own accessors, built-in containers with private internal slots, preexisting non-class dynamic prototypes and cyclic arrays, all of which pinned vendor `deepClone` could omit or mishandle. The guard uses property descriptors without invoking user getters. Its scope follows the pinned clone's enumerable-field traversal; it is **not** a universal graph clone or an audited fix for all engine semantics.

## Tests and evidence

| Test | Execution | Result |
| --- | --- | --- |
| [Detached-score pure tests](../../tests/twinleaf-detached-deck-sampling.test.cjs) | Local Node 22.16.0 | 5/5 pass |
| [Pinned-algorithm prototype mechanism tests](../../tests/twinleaf-normalize-deep-clone.test.cjs) | Local Node 22.16.0 | 5/5 pass |
| [Pinned source-rank-10 Store differential](../../tests/twinleaf-detached-own-deck-audit.test.cjs) | Not executed | Pending real pinned-engine environment |
| Manual-only [hidden-information workflow](../../.github/workflows/twinleaf-hidden-information.yml) | Dispatch attempted | Trigger blocked by available tool safety controls; **no CI pass** |

The pure detached-score tests cover equivalent permuted deck multisets, hypothetical card damage and card-ID mutation confined to clones, exception propagation without live-state modification, and rejection of a clone sharing cards in the deck, Active zone or a symbol-keyed field. The prototype tests reproduce the exact source `Object.create(source)` mechanism on a miniature cyclic, aliased object graph, check restored class methods and internal aliases, repair duplicated array aliases, reject deliberately shallow copies, and reject unsupported original-state shapes before cloning.

The unexecuted [rank-10 audit](../../simulation/twinleaf/detached-own-deck-audit.cjs) is source-inventory-complete for its existing synthetic fixture, uses the actual pinned `PlayCardAction` with index arguments, and additionally snapshots real card `damageTakenLastTurn` fields and live zone references. Its intended verification is equal scores across two hidden-order variants with unchanged live source zones. Until manually run and independently inspected, this **must remain a hypothesis**, even though the isolated helper has passed pure tests.

## Follow-up gates

1. Dispatch the manual hidden-information workflow from an authorized GitHub interface and inspect the exact compiled-engine score and failure path; do not relabel locally passed tests as pinned validation.
2. Verify `deepClone` plus prototype normalization retains legal actions and effect semantics, including nested aliases and non-enumerable properties, for actual Store transitions. Differential against Agent 49's staged Crisis Punch/Counter and observer is valuable.
3. Only after that consider a guarded full-game policy experiment with unchanged source inventories, reproducible seeds and labels. A source-complete 60-card deck does not imply any real win-rate estimate.

**Inference limit:** This patch improves the experimental isolation boundary. It neither certifies a strong bot nor gives evidence for the requested 99.5% all-field win rate.
