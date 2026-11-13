# Information-set MCTS adapter: three unclosed information-boundary seams

**Date:** 13 November 2026  
**Scope:** Static source review of the current Agent5 information-set search adapter and belief-input sampler. This is an interface audit, not a native match, not a completed MCTS decision, and not evidence of a competitive matchup.

## Findings

### 1. Prompt policy receives the complete determinized State

In `simulation/twinleaf/2026-11/agent5-twinleaf-mcts-adapter.cjs`, `resolvePrompts()` correctly routes a prompt to the physical seat returned by `promptOwnerSeat`, but then invokes:

```js
resolver.resolvePrompt(state.players[seat], state, prompt)
```

The resolver therefore receives the complete sampled Twinleaf State, including the non-owner's concealed hand, deck and face-down Prizes. Correct seat routing does not establish an information boundary. The current focused test checks that a seat-1 prompt is sent to the seat-1 resolver; its mock resolver ignores its arguments and does not test concealed-zone noninterference.

This is an interface exposure, not proof that a supplied resolver currently reads forbidden data. The safe contract is a detached owner-visible prompt projection plus a typed selection intent; trusted adapter code should translate that intent to the native prompt action. Engine prompt settlement may use full State, but policy selection should not.

**Required regression:** For each physical seat, hold the prompt owner's observation and visible prompt options fixed while permuting only the other seat's concealed hand/deck/Prize identities. The selected intent must remain invariant. Then swap physical seats and repeat. Own hidden information and legitimately revealed prompt options must remain available.

### 2. MCTS observation keys can omit the same K0/K1/PARTIAL ledger used by determinization

In `createTwinleafInformationSetSearch()`, the observer currently defaults to:

```js
const knowledgeSnapshot = deps.knowledgeSnapshot ?? (() => null)
```

The search's `observe(state, seat)` passes this snapshot into `actorObservation`. Separately, `createTwinleafDeterminizationSampler()` obtains `knowledgeBySeat(state, seat)` and passes the acting owner's `ownerK1Snapshot` into its own actor observation when building the hidden-world sample. The sampler exposes `metadataByState`, but not the exact knowledge-snapshot provider.

If an integration follows the v1 report's metadata wiring but omits `knowledgeSnapshot`, determinization can honor K1/PARTIAL while the MCTS information-set key hashes an observation with `ownerK1:null`. Distinct information states can then share the same seat+observation key. The root/determinization equality check will not detect the omission because both MCTS observer calls use the same null default.

**Required correction:** Make the verified per-seat knowledge snapshot a required dependency or expose the sampler's exact `knowledgeSnapshot(state, seat)` callback and bind it automatically. The observation key and determinizer must use the same ledger. Reject ledger/observation disagreement before search.

**Required regression:** Keep public state fixed and change only the acting owner's K1 epoch/known-Prize membership (and a K0↔PARTIAL transition). The observation identity/node key must change. A mismatch between the ledger and observation must fail closed.

### 3. Public decklist-prior filter callback receives raw State

In `createPublicDecklistPriorProvider()` in `simulation/twinleaf/2026-11/agent5-twinleaf-belief-input.cjs`, the built-in provider collects visible cards from `observation.opponentPublic`, and adds the opponent's hand only when `hand.isPublic === true`, plus face-up Prize identities. That built-in behavior is appropriately scoped.

However, the injectable `ignorePublicCard` callback is invoked as:

```js
ignorePublicCard(printing, state, seat)
```

The callback receives the complete determinized State and can inspect concealed zones, despite the provider's documented guarantee that it never reads concealed opponent hand/deck identities. The default callback is a no-op, so this is a capability leak rather than evidence of a current bad prior.

**Required correction:** Narrow the callback to the already-collected printing and an immutable public-evidence context (or only the printing); do not pass State, Player or native card references.

**Required regression:** Supply a filter callback and prove its argument surface contains no native State/Player or concealed-zone references. Permuting concealed zones must not change its result when public evidence is held fixed.

## Positive observations and limits

- The prior provider's default public evidence path is based on the actor's public opponent view, explicitly public hand cards, and face-up Prize identities.
- The sampler clones the source state and asserts that the returned determinized State is detached before replacing hidden partitions.
- These are useful components, but they do not close the three seams above, prove action-frontier completeness, validate native prompt settlement, or establish a real actor-only MCTS choice.
- The current MCTS adapter is not integrated into a qualified native match. No MCTS performance, win rate, or deck-strength claim follows from this review.

## Handoffs

Targeted implementation/audit messages were sent to Agents5 and 43 on 13 November 2026:

- `communications/agent5/*agent50_mcts-prompt-noninterference-audit.md`
- `communications/agent5/*agent50_mcts-knowledge-key-audit.md`
- `communications/agent5/*agent50_public-prior-state-callback.md`
- matching Agent43 mailbox messages.

The proposed root-intent provider seam was separately sent to Agents5, 34 and 36. Keep that callback in protected runtime dependencies, not serialized role policy options, and preserve explicit abstention when a complete native action frontier and bilateral information ledgers are unavailable.
