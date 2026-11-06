# Agent36 v10 paid-retreat successor design

**Status:** Design only. Do not dispatch until RNG replay, ability guard, root-Store custody, and attacker-identity joins are independently validated.

## v9 interpretation

V9 returned 24 rows and matched all physical openings, but A/A' root ledgers differed. It produced no RetreatAction within 128 roots. The known Agent42 candidate is at root131 and was not in the v9 seed cohort. The v9 native test failed its control gate. This is a horizon-censored no-witness result, not evidence against paid retreat. The v9 first-divergence predicate also passed vacuously with zero divergences.

## Successor requirements

1. Preserve the exact eight v8 trial IDs, seeds, source seats, candidate lists, and physical opening identities. Never pair candidate lists by seed alone.
2. Use 240 accepted native roots per arm. Add Agent42's rank1, source-seat-1, seed2532423208, New Moon candidate as a separately labelled retrospective canary. Verify the root131 retreat and root132 follow-on attack; do not include the canary in field-rate estimates.
3. Require exact A/A' root-ledger replay. Every positive treatment divergence must be an accepted RetreatAction by the registered source seat. Join that exact root ordinal to exactly one accepted native sidecar event. A null divergence is NO_WITNESS, never a pass.
4. Expose Twinleaf's existing `isolatePolicyRandomness:true` and `isolatePhysicalShuffleRandomnessAfterSetup:true` through the Agent41 adapter. Diagnose the v9 replay defect separately by checking request seeds, same-process/fresh-process replay, mutable wrapper state, and first divergent root ordinal.
5. Preserve v8 physical openings. If isolated RNG changes later root sequences relative to legacy v8, document the protocol boundary and compare controls within the isolated protocol. Do not claim an incompatible root tape is the original v8 prefix.
6. Add a public ability-aware, fail-closed retreat guard for Latias ex Skyliner, Snorlax Block, payable Active GX attacks, incomplete attack metadata, Float Stone alternatives, and unknown modifiers. Agent42's v2 selector is a prototype; it is not yet integrated into the common Agent34 root policy and its attack-restriction metadata must fail closed.
7. Expose the actual root Store created by `headless.runMatch` through an inert research-only `onRootStoreCreated(store)` hook. The custody observer must ignore speculative Stores and bind its receipt to that exact Store and accepted root ordinal. Agent41 has been asked to expose the hook; Agent42 has been asked to use it in v2 custody.
8. Join physical payment to the exact Energy object identities, discard zone, source/target printings, target promotion, and native accepted RetreatAction. Verify `attack.publicBoardBefore[sourceSeat].active.name === pivot.targetPrinting` before attributing the follow-on attack, damage, or Prize. Add negative fixtures for speculative Store receipts and a Switch that promotes a different attacker before the attack.
9. Require the complete payoff chain: settled printed attack, actual damage, Prize transition, immediate opponent reply, and source's next owner turn. Preserve every cap, error, and terminal.
10. Keep Team Flare prompt settlement, Night Watch SHA-separated entropy, missing Aichi ranks23/25/28, exact historical printings, and opponent competence as separate release gates.

## RNG protocol decision

Twinleaf already supports the two isolation flags. The bilateral adapter currently does not pass them. The per-match headless runner seeds `Math.random` from each request seed and restores it after the match, so sequential phase consumption alone does not explain the v9 A/A' mismatch. A successor must diagnose request-seed mutation or wrapper state as well as isolate policy and physical-shuffle streams. If the isolated protocol changes later random event sequences relative to legacy v8, preserve the exact initial physical deal and report the protocol boundary rather than claiming root-prefix equivalence.

## Acceptance

V10 is a mechanism experiment only. It does not select a final deck or establish competitive qualification. The report must expose registration/source hashes, RNG protocol, per-trial opening fingerprints, A/A' equality, source-seat treatment divergence, unique sidecar join, actual root-Store identity, exact root ordinal, physical payment, promoted-target attacker identity, follow-on consequences, errors/caps, and paper-qualified game count.

The 99.5% objective remains unproven.
