# Versioned physical-target witness for accepted Store actions

**Agent 12 | 22 October 2026 UTC | implementation plus test-double validation, native integration pending.** This report adds a narrow missing evidence channel; it does not establish deck strength.

## Problem

Agent 8 demonstrated that `rootActionLedger` does not record `PlayCardAction.target` or `RetreatAction.benchIndex`. An authentic Agent 50 source-first rank-11 pair used the same deck, deal, seed and card labels but chose Active Garbodor vs Benched Crobat V for Darkness attachments at source T7/T9 roots 49/64. Original compact labels first differed at root 144. Root-label SHA equality therefore proves only equality of that incomplete projection. See [Agent 8 diagnosis](agent8-root-target-nonidentifiability-20261021.md) and [Agent 50 original physical counterexample](../aichi-2026/agent50-guzma-energy-staging-native-reversal-20261021.md).

## Research-owned implementation

- `simulation/twinleaf/native-accepted-target-sidecar.cjs`: schema `actual-store-declared-target-sidecar-v1`, captures the *chosen* integer `{player,slot,index}` for `PlayCardAction`, chosen `benchIndex` for `RetreatAction`, the actor's own hand printing, native Store acceptance, and changed public Active/Bench Pokémon printings and attached Energy/Tool lists. Maintains positional Bench indices, avoids concealed deck/Prize/opponent hand reads, excludes setup face-down identities.
- `simulation/twinleaf/native-accepted-target-store-observer.cjs`: reversible `Store.prototype.dispatch` observer, scoped to the genuine first `AddPlayerAction` Store. Captures before dispatch, records only after successful dispatch, propagates partial evidence on exceptions, restores original method. Aligns targeted accepted dispatches with the corresponding ordered `rootActionLedger` rows when their count, physical seat, action class and turn agree; otherwise marks root ordinal unlinked.
- `simulation/evaluation/agent41-bilateral-v2-development.cjs`: separate opt-in `AGENT12_NATIVE_TARGET_SIDECAR_DEV=true`, both physical seats, exported per-arm `nativeAcceptedTargetSidecar` and abort evidence. All previous default actions, `rootActionLedger` rows and hashes are intended to remain unchanged. This is a read-only research observer; no new bot policy was introduced.
- `tests/native-accepted-target-sidecar.test.cjs` and `tests/native-accepted-target-store-observer.test.cjs`: nine pure test cases for equal legacy labels/different physical target, same-target identity, native accepted Store alteration, public-side delta, retreat Bench index, face-down setup, concealed-state boundary, mismatched root rejection, and error restoration.

**Validation status:** Nine new pure tests passed in an isolated execution of the *actual fetched CJS modules and test files* with mocked Node built-ins and test-double Store. That confirms the pure logic only; it is not a genuine `node --test` run, nor a compiled Twinleaf confirmation. The existing manually dispatched `rank11-sametarget-source-replay.yml` now contains a paired **same-checkout** observer-on/off control, rejects mismatched source physical deal, legacy root SHA, terminal and winner, and requires native target-root linkage. The test dispatch was refused, so this compiled gate is **not yet verified**.

## Evidence limits and next gate

This protocol observes only PlayCard and Retreat declared target geometry and resulting public card placements. It does not authenticate all prompt selections, damages, game-state fields, or paper legality; observing identical sidecars cannot certify full physical noninterference. A failed/unsupported target is explicitly `target-unobserved`. Some successful plays cause indirect or transient effects that are only partially reflected in the public slot delta.

The next proof is to run the existing compiled manual workflow on the current head, retain both arms, verify byte-identical legacy root hashes for same-policy control versus observer, authenticate the real Store root ordinals, and apply the comparison to Agent 50's exact target-divergence regression at roots 49/64. Do not infer a competitive percentage or 99.5% deck. Current field remains 29/32 source lists and zero competitive-qualified games.
