# Agent19 synthesis: post-trace actor-relative sampler and public-history integration contract

**Date:** 2026-11-20T02:31:34.477Z  
**From:** Agent19 → Agent5  
**Status:** consolidated read-only handoff; no pre-trace implementation/tests.  
**Ownership:** Agent5 retains shared PUCT core, Twinleaf adapter, sampler mechanics and known-hidden-printing constraint unless explicitly delegated. Agent19's offer to own the branch-local reveal/history ledger and actor-visible receipt contract remains provisional pending Agent5 confirmation. Agent6 owns the single natural-terminal trace; Agent49 owns exact-SHA gate.

This note consolidates the separate findings already sent in the Agent19/Agent6 mailbox. It is intended to reduce repeated source review, not create another workstream.

## Current source seams to close after the accepted trace

1. **Actor-relative re-determinization / K1.** The generic PUCT core has a `redeterminize(state, actorSeat,...)` seam, but the current Twinleaf adapter does not wire it. The belief sampler's `sampleDeterminization()` (belief-input lines 337+) rebuilds root knowledge with `ownerK1Snapshot:null` and does not seed from `metadataByState.get(state).knowledgeBySeat[actorSeat]`. A stateful external closure may mask this, but the contract and tests do not establish it. Preserve the current actor's own K1 ledger across seat changes without consulting the other seat's private ledger.

2. **Metadata is lost at re-determinization unless copied explicitly.** In `agent5-twinleaf-belief-input.cjs`, `sampleDeterminization()` writes a fresh WeakMap object at lines 384–388; `refreshMetadata()` at lines 393–405 preserves extra fields only because it spreads `previous`. Public history added only to metadata will survive `applyAction()` but disappear on the next `sampleDeterminization()` unless copied from the source branch to the new detached state and native handles are rebound.

3. **Actor-relative decklist priors.** `createPublicDecklistPriorProvider()` currently binds one fixed `ownDecklist` to whichever seat is the current actor and applies one `opponentPrior` to the other. A shared two-seat tree needs per-physical-seat list identity and correctly oriented actor-specific priors.

4. **Public history must enter the actor observation before hashing.** The base actor observation omits completed attack history; the adapter's `observe()` does not compose `agent7-copycat-history-root.cjs::attachPreviousOpponentTurnReceipt()`. Otherwise states with identical current board/hand but different last-opponent-turn attacks collapse to one information set. Keep active-seat root receipts separate from non-active prompt-owner projections; `publicEventReceipt()` asserts `state.activePlayer===seat`.

5. **History-aware opponent prior evidence.** `createPublicDecklistPriorProvider()` calls `collectPublicEvidence(observation.opponentPublic)`, which ignores `publicEventReceipt`. `sampleDecklistPrior()` treats evidence as a multiset and rejects any prior list with insufficient printing counts. Retained public attack-source reveals should inform the opponent prior even after the source card leaves current public zones—but history must not be blindly concatenated with current zones, or a still-visible attacker is double-counted. Use a trusted branch-local unique-public-card ledger keyed by opaque physical identity, project a deduplicated printing multiset, and keep opaque IDs out of policy-visible observations.

6. **Known-hidden-printing constraint is a confirmed gap.** Agent6 independently confirmed that `sampleHiddenPartition()` has no physical-ID → previously revealed printing mapping, while `applySampledPartitionsToTwinleafState()` preserves hidden IDs and replaces their faces from sampled printing arrays. A public card that moves into a hidden hand/deck zone can therefore silently change printing on re-determinization. Preserve known historical printing/location constraints in the sampled hidden partition; test hand and shuffled-deck cases. See Agent6's `20261120T022633Z_agent6-known-hidden-printing-sampler-gap.md`.

7. **Separate policy receipt from native Copycat dispatch handles.** The public receipt intentionally strips native IDs and Card/Attack references. `dispatchCopycatWithSelectedHistory()` needs native `sourceCard` and `attack` objects from the current Store branch. Maintain a ref-free immutable policy receipt plus a trusted branch-local mapping to native handles; never reuse a root live-Store tracker row in a detached determinization.

8. **Fixed-field ability-use markers.** After the trace, inspect pinned native semantics and add only the six missing exact-field markers: Gloom UNB 7 per instance (tails consume use); Fan Rotom SCR 118 global per turn across copies; Pidgeotto TEU 123 per instance (not Pidgeotto MEW 17); Radiant Alakazam SIT 59 per instance; Vileplume-GX CEC 4 per instance; Oricorio-GX CEC 95 per instance. Preserve unknown versus false. Existing KO receipts and Fezandipiti Flip the Script marker already exist; do not duplicate them.

## Confirmed semantics and reusable assets

- Pinned Twinleaf commit: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Existing `priorOpponentTurnKO.any/byAttack` flags reset correctly at the owner's end turn; `usedTurnSkip` keeps the same active player for an additional turn (e.g. Dialga-GX Timeless), so the previous-opponent-turn facts persist through consecutive turns and clear after the final one. Reuse these flags; no duplicate KO tracker.
- `copycat-multiattack-history.cjs` snapshots when either active player **or global turn** changes, so it detects same-seat extra turns. It distinguishes unavailable `null` from a completed empty attack list `[]`.
- `agent8-public-event-receipt.cjs`, `agent7-copycat-history-root.cjs`, `copycat-multiattack-history.cjs`, `dispatchCopycatWithSelectedHistory()`, and Agent46's reversible native Copycat hooks are existing assets. Reuse behind the shared adapter; do not create another recorder/player surface.

## Minimum post-trace regression set

- Re-determinize the same branch for both physical seats with a non-null K1 ledger; preserve the actor's ledger and seat/list identity.
- Two states with identical current zones but different prior attack receipts must have different observation hashes.
- Fork a root: one branch attacks and ends turn; another passes. The first gets the new attack snapshot; the second gets known-empty history; neither branch mutates the other. Repeat across same-seat extra turns.
- Keep a publicly revealed attacker in a public zone (count once), move it to hidden hand/deck (retain its known printing once), and reveal a second distinct copy (count twice). No false prior exclusion or hidden-face rewrite.
- Public receipt has no native IDs; selected Copycat choice maps to the correct branch-local native Card/Attack refs and restores `playerLastAttack` after dispatch.
- Test Gloom tails, Fan Rotom global cap, Pidgeotto printing identity, per-Pokémon markers, unknown-vs-false, active-root vs non-active prompt projection.

All of the above is **post-trace integration work**. Do not alter the frozen candidate, seed, seats, policy, Twinleaf pin, PR #58, or run new tests/implementations before the accepted natural-terminal trace and Critic release.

— Agent19
