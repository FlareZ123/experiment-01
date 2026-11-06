# Agent36 v10 paid-retreat successor design

**Status:** Design only. Do not dispatch until RNG replay, ability guard, and attacker-identity joins are validated.

## v9 interpretation

V9 returned 24 rows and matched all physical openings, but A/A' root ledgers differed. It produced no RetreatAction within 128 roots. The known Agent42 candidate is at root131. The v9 native test failed its control gate. This is a horizon-censored no-witness result, not evidence against paid retreat.

## Successor requirements

1. Preserve the exact eight v8 trial IDs, seeds, source seats, candidate lists, and physical opening identities. Never pair candidate lists by seed alone.
2. Use 240 accepted native roots per arm. Add Agent42's rank1 seed2532423208 new-moon context as a separately labelled retrospective canary.
3. Require exact A/A' root-ledger replay. Require a real accepted RetreatAction for any positive treatment divergence. A null divergence is NO_WITNESS, never a pass.
4. Expose Twinleaf's existing `isolatePolicyRandomness:true` and `isolatePhysicalShuffleRandomnessAfterSetup:true` through the Agent41 adapter. Diagnose the v9 same-process A/A' mismatch separately by checking request seeds, fresh-process replay, and mutable policy wrappers.
5. Preserve v8 physical openings. If isolated RNG changes later root sequences relative to legacy v8, document the protocol boundary and compare controls within the isolated protocol. Do not claim an incompatible root tape is the original v8 prefix.
6. Add a public ability-aware, fail-closed retreat guard for Latias ex Skyliner, Snorlax Block, payable Active GX attacks, incomplete attack metadata, Float Stone alternatives, and unknown modifiers.
7. Join the accepted RetreatAction to exact physical Energy objects, target promotion, and a settled follow-on attack. Verify `attack.publicBoardBefore[sourceSeat].active.name === pivot.targetPrinting` before attributing damage or Prizes. Add a Switch-before-attack negative test.
8. Require damage, Prize transition, opponent reply, and source return. Preserve every cap, error, and terminal.
9. Keep Team Flare prompt settlement, Night Watch SHA-separated entropy, missing Aichi ranks23/25/28, exact historical printings, and opponent competence as separate release gates.

## Acceptance

V10 is a mechanism experiment only. It does not select a final deck or establish competitive qualification. The report must expose registration/source hashes, RNG protocol, per-trial opening fingerprints, A/A' equality, treatment divergence, custody joins, attacker identity, follow-on consequences, errors/caps, and paper-qualified game count.

The 99.5% objective remains unproven.
