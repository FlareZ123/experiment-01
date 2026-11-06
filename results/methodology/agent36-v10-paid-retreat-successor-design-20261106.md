# Agent36 v10 paid-retreat successor design

**Status:** Design only. Do not dispatch until live B-wrapper activation, decoder-error coverage, RNG protocol, ability guard, root-Store custody, and attacker-identity joins are independently validated.

**Critic correction (6 November 2026):** The frozen v9 B treatment never activated. The historical `scopedRoot` predicate omitted `!actorTwoUnitPaidRetreatRoot`, so the experiment executed A/A/A. All eight physical openings and all eight complete or abort-preserved root ledgers match across the three phases. The reported `controlsRepeatedExactly=false` comes from omitting `nativeAbortEvidence.rootActionLedger` in the summary. The five deterministic decoder failures remain genuine. See [Agent20's corrected mechanism audit](agent20-v9-paid-retreat-aba-audit-20261106.md) and [Agent48's eight-trial ledger reconciliation](agent48-v9-control-ledger-reconciliation-20261106.md).

## v9 interpretation

V9 returned 24 rows with matching physical openings. Three contexts capped at 128 roots; five aborted in each phase with the same decoder-exception SHA256 `2dc3a55f9b6d7dbc60aaa8883b43982e213957c44179b1baf52cb1139effe11f`. All eight root-action histories are available: three at top level and five under `nativeAbortEvidence.rootActionLedger`. Independent comparison found A = B = A' for all eight. More decisively, the B wrapper never installed, so no treatment policy was exercised. The summary's false control-coverage flag is a top-level-only parser defect. The first-divergence predicate also passed vacuously with zero divergences.

The 128-root cap cannot reach Agent42's reported root131 candidate. The v9 rank1 context also used source seat0, while Agent42's canary uses source seat1. The v9 comparison is invalid as a treatment test because B did not activate. The short horizon is an additional limitation; there is no evidence for or against paid retreat from this v9 run.

## Successor requirements

**Mandatory activation preflight:** instrument the live `scopedRoot` branch and assert paid-retreat opt-in false/true/false across A/B/A. Run a deterministic positive canary to prove B actually installs and invokes the selector. A null first Store-root divergence must fail the treatment gate. Do this before dispatching the expensive cohort.

1. Preserve the exact eight v8 trial IDs, seeds, source seats, candidate lists, and physical opening identities. Never pair candidate lists by seed alone.
2. Use 240 accepted native roots per arm. Add Agent42's rank1, source-seat-1, seed2532423208, New Moon candidate as a separately labelled retrospective canary. Verify the root131 retreat and root132 follow-on attack; do not include the canary in field-rate estimates.
3. Require exact A/A' root-ledger replay for every completed context. Every positive treatment divergence must be an accepted RetreatAction by the registered source seat. Join that exact root ordinal to exactly one accepted native sidecar event. A null divergence is NO_WITNESS, never a pass.
4. Diagnose the shared bot-decoder exception that censored five v9 contexts. Expose Twinleaf's existing `isolatePolicyRandomness:true` and `isolatePhysicalShuffleRandomnessAfterSetup:true` through the Agent41 adapter for treatment comparisons. Preserve legacy defaults for historical replay.
5. Preserve v8 physical openings. Run a legacy replay bridge against the v8 first-128-root prefix. If isolated RNG changes later root sequences relative to legacy v8, document the protocol boundary and compare controls within the isolated protocol. Do not claim an incompatible root tape is the original v8 prefix.
6. Add a public ability-aware, fail-closed retreat guard for Latias ex Skyliner, Snorlax Block, payable Active GX attacks, incomplete attack metadata, Float Stone alternatives, and unknown modifiers. Agent42's v2 selector is a prototype; it is not yet integrated into the common Agent34 root policy and its attack-restriction metadata must fail closed.
7. Expose the actual root Store created by `headless.runMatch` through an inert research-only `onRootStoreCreated(store)` hook. Also expose `onRootActionDispatched(store, action, actionOrdinal, seat, turnBefore)` after the successful dispatch, using the exact ordinal written to `rootActionLedger`. The custody observer must ignore speculative Stores and bind its receipt to that exact Store and ordinal.
8. Join physical payment to the exact Energy object identities, discard zone, source/target printings, target promotion, and native accepted RetreatAction. Verify `attack.publicBoardBefore[sourceSeat].active.printing === pivot.targetPrinting` before attributing the follow-on attack, damage, or Prize. Add negative fixtures for speculative Store receipts and a Switch that promotes a different attacker before the attack.
9. Require the complete payoff chain: settled printed attack, actual damage, Prize transition, immediate opponent reply, and source's next owner turn. Preserve every cap, error, and terminal.
10. Keep Team Flare prompt settlement, Night Watch SHA-separated entropy, missing Aichi ranks23/25/28, exact historical printings, and opponent competence as separate release gates.

## RNG and adapter decision

Twinleaf already supports the two isolation flags. The bilateral adapter currently does not pass them. The per-match headless runner seeds `Math.random` from each request seed and restores it after the match. Independent audit found exact A/A' ledger reproduction in all eight v9 contexts, including five with abort-preserved ledgers; the original coverage flag failed due to the comparator. The actual historical treatment blocker was the omitted `scopedRoot` activation condition. The five identical bot-decoder exceptions are a separate continuation blocker. The legacy shared stream remains a future treatment-dependent randomness confound, so isolation flags are required for clean comparisons after proving B truly activates.

## Acceptance

V10 is a mechanism experiment only. It does not select a final deck or establish competitive qualification. The report must expose registration/source hashes, decoder-error/censoring counts, RNG protocol, per-trial opening fingerprints, A/A' equality, source-seat treatment divergence, unique sidecar join, actual root-Store identity, exact root ordinal, physical payment, promoted-target attacker identity, follow-on consequences, errors/caps, and paper-qualified game count.

The 99.5% objective remains unproven.
