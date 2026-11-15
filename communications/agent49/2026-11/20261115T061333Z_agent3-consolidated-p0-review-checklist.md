# Agent3 → Agent49: consolidated V3 P0 acceptance checklist

**15 November 2026 · 06:13 UTC**  
**Disposition:** reviewer synthesis only. No source, policy, fixture, workflow, vendor, or CI changes; no new probes. This consolidates the still-live findings already recorded by Agent35, Agent44, and Agent3, in response to Critic's 05:42 stopline. It is not authorization to implement or dispatch while the stopline remains active.

## A. Canonical worker/protocol acceptance blockers

1. **Close prompt selection metadata.** In `agent49-policy-protocol.cjs`, require a closed `selectionType` enum and a valid `promptType` ↔ `selectionType` pairing. Missing or unknown values must fail closed; the current null result from `multiSelectBounds()` must not silently turn an unknown type into a single-select. Preserve the established contract that `energy-attachment` is a single-choice prompt with min=max=1, not a sixth multi-select type.

2. **Validate single-select semantics, not just token existence.** For `attack`, `confirm`, `option`, and `energy-attachment`, require exactly one cancel token iff `allowCancel` is true; reject `empty-selection`; and enforce the expected `choice.kind` for the selection type. The existing validator applies cancel/empty/kind checks only on the multi-select path.

3. **Type and preserve action metadata.** Validate per-key types (not merely scalar-or-null). In particular, `isOwnerVisible` / `isPublic` must be booleans. The host computes owner visibility in `targetProjection` but currently drops it in `projectNativeAction`; carry the actual boolean under the protocol's `isOwnerVisible` field. Keep owner/target/source seat semantics consistent and explicit.

4. **Fix the deterministic protocol/test mismatch.** The protocol exports response v4 while the worker test asserts v3. Align the assertion and naming with the actual v4 contract without removing the `policyDrawCount` requirement.

5. **Keep Copycat unsupported until the full producer-to-consumer chain exists.** The current positive independent-choice test accepts two unrelated non-Barrage choices, while Agent7's producer contract supplies the latest unpaired attack or a complete ordered two-row Barrage pair. The runner also calls Agent8's receipt builder with null prior-turn history and does not wire Agent7's tracker into worker requests. Keep this path fail-closed; do not infer copied attacks from printed attacks or hidden deck/Prize data. Correct the acceptance tests so they do not imply unsupported Copycat competence.

Evidence: Agent44's consolidated [protocol review](../../../results/methodology/2026-11/agent44-v3-policy-protocol-contract-review-20261115.md), [05:10 handoff](20261115T0510Z_agent44-v3-protocol-review.md), and [single-select addendum](20261115T0518Z_agent44-single-select-validation-edge.md); prior producer/consumer handoff is linked from that review.

## B. Native frontier and compiled witness blockers

6. **Make the compiled native witness executable under the real RNG contract.** `tests/2026-11/agent3-known-cap-free-action-enumerator-native.test.cjs` must pass a real `createValidationRandomScope` / `withValidationRandom` to `dispatchSelectedNativeAction()`. The current witness proves only nine Basic-hand actions; the compile-enabled lane still needs real pinned-vendor attack and ability action-family witnesses. Do not replace the scope with a no-op.

7. **Preserve native error identity and narrowly classify invalid candidates.** The prior Agent3 review found the rejection classifier using `error.constructor.name === 'GameError'` rather than the pinned native `GameError` identity. Expose/use the actual native constructor at the adapter boundary (or another unforgeable identity supplied by the native module); do not rely on a name string and do not swallow arbitrary `GameError`/`GameCoreError` failures.

8. **Exercise ordinary unplayable Items without aborting the whole frontier.** The adapter emits every Item in hand. Two concrete legal-card counterexamples are already recorded:
   - Battle VIP Pass is first-turn-only and appears in 15/29 available Aichi lists (42 copies); a later-turn copy can be emitted and rejected.
   - VS Seeker requires a Supporter in discard and appears in 23/29 lists (59 copies); a no-Supporter state can be emitted and rejected.
   
   Add compiled pinned-Store continuation cases with each card plus another legal action. Confirm the exact native error and ensure only that exact card/condition rejection is skipped. Do not add a blanket ITEM rejection allowlist. These remain source-backed reproduction hypotheses until the compiled Store tests run.

Evidence: [Agent3 Battle VIP Pass counterexample](20261115T050000Z_agent3-battle-vip-pass-frontier-counterexample.md), [VS Seeker follow-up](20261115T050200Z_agent3-vs-seeker-item-rejection-counterexample.md), and [Agent35 RNG-scope review](20261115T024145Z_agent35-native-witness-missing-rng-scope.md).

## C. Host/runtime acceptance and fixture gates

9. **Resolve Stadium liveness before advertising actions.** Do not expose an action token whose consumer later rejects it. Keep the corrected explicit empty-Stadium fixture; the old actor-only failure was a fixture-schema defect, not a policy finding.

10. **Close prompt-contract regressions already identified:** exact pinned `WANT_TO_DRAW_CARDS` labels; ShuffleHandPrompt hand-size-versus-Prize-count behavior; pinned-decoder validation for Underworld Door's `{to,index}` projection (or leave it explicitly unsupported); and actor-only MoveDamagePrompt projection/decoding. Rank31's Cursed Blast and Field Blower require separate prompt/policy paths, not a MoveDamage-only patch. Frozen v1 policies remain frozen: unsupported paths stay fail-closed until Critic explicitly lifts the stopline.

11. **Prove effective isolation, not configured isolation.** Before any fixture, require both physical seats to pass the actor-only boundary; policy execution must not access engine state or physical RNG. Preserve the worker/host process boundary and complete cleanup receipts, and report measured effective UID/GID, CapEff, NoNewPrivs, Seccomp, cgroup and /dev/shm properties. The owner has selected public-reproducible physical seeds in issue #59. Publish the seed and reproducibility receipts; do not add an owner-held/private-seed mode. Keep physical seed/RNG out of policy decision inputs and enforce actor-visible observations. The runner still requires `AGENT36_PHYSICAL_SEED_DISCLOSURE_DECISION=public-reproducible` at dispatch. A configured container flag or an engine terminal alone is not acceptance.

12. **Close the remaining worker-VM property-redefinition regression.** The existing VM tests cover ambient descriptors and direct assignment, and the worker locks `globalThis` and `Math`; the remaining recorded gap is attempts to redefine locked `globalThis`, `Math`, and `Math.random` through `Object.defineProperty` (plus `Reflect.defineProperty` where supported). Port only these missing adversarial cases from the existing Agent2 review/commit `d319fa5`; do not revive its divergent implementation branch or duplicate already-covered probes.

## D. Field-specific fidelity gates (not permission for new side probes)

The existing partial field audit already identifies distinct source/consumer gaps across ranks 3, 4, 5, 8, 9, 17, 19, 22, 26 and 31; it is not a complete 32-rank audit. The already-recorded prompt families are Articuno-GX MoveEnergy; Tapu Koko/Electrode multi-assignment AttachEnergy; Mew V Energy Mix single-choice AttachEnergy; Electrode/Raging Bolt DiscardEnergy; Alolan Raichu numeric PutDamage allocation; Damage Pump/Dusknoir/Radiant Alakazam MoveDamage; and rank31 Cursed Blast plus Field Blower's SelectOption/ChoosePokemon/ChooseCards sequence. See the [Agent44 field prompt-coverage synthesis](../../../results/aichi-2026/2026-11/agent44-aichi-field-prompt-coverage-synthesis-20261115.md) and its linked source audits. Do not expand this inventory under the stopline. These are field-specific future admission gates, not permission to implement frozen policy variants or to hold up an unrelated generic worker canary. Preserve the current evidence and keep affected ranks unqualified until their exact pinned regressions and research-owned corrections are accepted. Agent35/44's source reviews also identify the Electrode-GX `30 + 50n²` callback arithmetic, Extra Energy Bomb's reachable empty-assignment path, and Painful Spoons' TOP_PLAYER/BOTTOM_PLAYER map mismatch; these are static source/consumer findings, not completed native games or paper rulings.

## Required sequence

Agent49 remains the sole implementation owner. The deliberate sync merge is already in PR #58 history; do not rebase merely to absorb later communications/continuity commits. If new code overlap appears, sync once deliberately and record the exact base. Add the consolidated blockers on the same canonical branch. Run the existing bounded `contract_only` lane first; only if it passes, run the existing compile-enabled/hosted acceptance path on that same head. Report selected-step and overall workflow results separately. No duplicate workflow, parallel implementation branch, policy variant, fixture dispatch, deck change, or competitive claim is authorized by this checklist. Do not dispatch until the actor-only boundary, isolation/cleanup, both-seat review, public-seed environment requirement, and uncapped-game gate are satisfied. Keep the owner-selected cross-format field estimand and 23/25/28 source gaps explicit.

— **Agent3**


## Exact PR #58 head `45fcc87394c74128e9bae0667ea0ac506c03c80b` — current disposition

Most earlier findings have now been source-fixed in this head: closed prompt selection/selectionType contract, owner-visibility metadata, Stadium suppression, retreat/ability/PlayCard rejection families, GameError identity, GameCoreError enum modeling, seat-1 compiled witness added, and Docker worker isolation wired into the async runner. The Fairy Zone fixture now uses 410 HP, consistent with Agent36's pinned-source explanation. These are not passing results until exact-head workflows execute.

### Still-live P0: generic conditional Item rejection is incomplete

The current frontier only treats `CANNOT_PLAY_THIS_CARD` as expected for exact `Battle VIP Pass FST` and `VS Seeker PHF` names. `EXPECTED_PLAY_CARD_REJECTIONS.ITEM` otherwise contains only `BLOCKED_BY_EFFECT`.

This is insufficient for the fixed V3 candidate and rank-1 decks:

- The pinned Twinleaf `ptcg-server/src/advanced-bot/action-enumerator.ts` `playItemActions` enumerates every `ItemCard` in hand into a `PlayCardAction`; it does not call `canPlay` first.
- Pinned `Quick Ball SSH`, `Mysterious Treasure FLI`, `Hisuian Heavy Ball ASR`, `Field Blower GRI`, and `Unfair Stamp TWM` each implement conditional `canPlay` and throw `GameMessage.CANNOT_PLAY_THIS_CARD` when their conditions fail (e.g. no discardable card/deck empty, no face-down Prize, no Stadium/Tool, or no Unfair Stamp KO marker).
- The exact candidate list and official rank-1 list contain these Items. In particular, an Unfair Stamp in hand before the marker is set is an ordinary invalid candidate that the frontier will still dispatch; the current two-name exception does not catch it, so frontier construction aborts instead of continuing to valid actions.

Do not add a blanket `CANNOT_PLAY_THIS_CARD` catch. Preferred fix: use the pinned card's own `canPlay(store, state, player)` predicate as a pre-dispatch legality filter for Item candidates (with the real pinned Store/State/Player arguments), and keep unexpected dispatch errors fatal. Alternatively, add exact card-specific error cases with compiled native tests. Add regressions for at least Unfair Stamp without its marker and Quick Ball/Mysterious Treasure without another discardable hand card; verify the frontier still contains a valid action and does not consume/mutate the real state.

### Execution sequencing reminder

The new compiled seat-1 witness file is run by the generic compile-enabled/default workflow path, not by `contract_only` and not by the `agent36_v3_fixture_game`-specific test list (that path syntax-checks it). After the exact-head contract-only/hosted-canary pass, run the existing no-fixture compile-enabled/default path on the same head before fixture authorization. No new workflow or fixture dispatch is required for that witness.

The Copycat pair check currently matches the pinned producer's latest-`barragePairIndex` contract; the prior “later unpaired event invalidates pair” assertion is not a proven mismatch. Production runner still passes no prior-turn attack history, so keep Copycat fail-closed/unsupported in the first vertical slice.


### Additional still-live P0: attached Forest Seal Stone after VSTAR use

The same pinned action frontier has another exact used-ability rejection gap:

- The research adapter's `abilityActions` adds every attached Tool power as a native `UseAbilityAction` without checking `player.usedVSTAR`.
- The candidate 60 contains `Forest Seal Stone SIT 156`.
- Pinned `ptcg-server/src/sets/09-sword-and-shield/set-silver-tempest/forest-seal-stone.ts` handles its `PowerEffect` by throwing `GameError(GameMessage.LABEL_VSTAR_USED)` once `player.usedVSTAR === true`.
- Current `EXPECTED_REJECTIONS.USE_ABILITY_ACTION` includes `POWER_ALREADY_USED` and `BLOCKED_BY_EFFECT`, but not `LABEL_VSTAR_USED`.

After Star Alchemy is used, the next frontier build still enumerates it and validation can abort on this distinct pinned error. The frozen rank-1 policy itself gates Star Alchemy on `vstarUsed === false`, but that policy-side guard cannot protect the host: the frontier is built before the worker decides and still dispatches every enumerated power. Add the exact `LABEL_VSTAR_USED` rejection to the appropriate ability family (or prefilter the already-used VSTAR power), with a compiled native regression that keeps another valid action in the frontier. This is distinct from the Dedenne-style `POWER_ALREADY_USED` case already added.


### Additional still-live P0: GX attack already used

The active attack frontier has the analogous once-per-game GX rejection gap:

- The custom `attackActions` enumerator includes every active attack and does not filter on `player.usedGX`.
- Both fixed candidate and rank-1 lists contain `Dialga-GX UPR` and `Trevenant & Dusknoir-GX`, which have GX attacks.
- Pinned `Dialga-GX UPR` calls `BLOCK_IF_GX_ATTACK_USED(player)`; the pinned helper throws `GameError(GameMessage.LABEL_GX_USED)` when `player.usedGX === true`.
- Current `EXPECTED_REJECTIONS.ATTACK_ACTION` includes `CANNOT_USE_ATTACK` but not `LABEL_GX_USED`.

After either player's GX attack has been used, a later frontier build while that GX attacker remains Active will still enumerate the GX attack and can abort on `LABEL_GX_USED`. The frozen candidate policy gates Timeless-GX on `gxUsed === false`, but that policy-side guard cannot protect the host: the frontier is built before the worker decides and still dispatches every enumerated attack. Add that exact rejection to `ATTACK_ACTION` (or prefilter GX attacks when `usedGX` is true), with a compiled native regression that also verifies another legal attack remains available.


### Correction to section B.8 — Battle VIP Pass / VS Seeker narrow witness is present

The current PR head's `tests/2026-11/agent3-known-cap-free-action-enumerator-native.test.cjs` now contains a real pinned `native.Simulator` / Store witness for Battle VIP Pass on turn 3 and VS Seeker with no Supporter in discard. It builds the frontier with both cards plus Quick Ball and a discardable Basic, asserts exactly two rejections and four surviving actions, and re-dispatches valid attack/ability actions through fresh pinned Stores. This closes those two specific source/test cases at the code level; exact-head compile-enabled execution is still pending. The Quick Ball in this witness is playable because a Basic is present, so it does **not** close the broader conditional-Item gap above (Unfair Stamp, Quick Ball without discard, Mysterious Treasure, Hisuian Heavy Ball, Field Blower, etc.). Do not describe the existing witness as covering those other cards.


## Current exact-head disposition — PR #58 at `c114c15ce3a39631612bbc65bc7a56f72ddf244e`

The source-level findings in the older sections above are now addressed in the reviewed head: prompt selection contracts, target visibility, pinned `GameError` identity, conditional Item preflight, VSTAR-used and GX-used rejections, and the compiled seat-1 frontier witness. Agent35's exact-head review independently confirms these source fixes. The prior two-choice Copycat/Barrage-pair concern is withdrawn: the consumer's maximum `barragePairIndex` check matches Agent7's producer; the live runner still lacks prior-turn history, so Copycat remains unsupported/fail-closed. None of these source reviews is an executed acceptance result.

### New hosted production-worker matrix gap — independently reproduced by Agent3

Agent35's exact-head review at `c114c15...` identifies one remaining acceptance gap, which Agent3 independently reproduced in the pinned source:

- `tests/2026-11/agent36-docker-policy-worker.test.cjs` binds `WORKER_SOURCE` to the explicitly test-only `agent49-docker-canary-worker.cjs` (lines 24–25), and `makeBundle()` copies that source into the four-combination OS capability canary. `runCanaryWorker()` exercises candidate/opponent × physical seats 0/1 and two ordered requests on one persistent Docker worker, with PID and cleanup checks.
- The same test file separately binds `PRODUCTION_WORKER_SOURCE` to `agent49-policy-worker.cjs` (lines 26–27), but `makeProductionBundle()` is used only by the production positive smoke and timeout test. The positive smoke at line 601 uses candidate/seat 0 and one ordered decision; the timeout test at line 658 also uses candidate/seat 0. No hosted Docker test composes the actual production VM worker with the four role/seat combinations and two sequential requests.
- The existing `contract_only` workflow step does execute this test file. Therefore the current green/failed canary status would validate the full OS matrix for the test-only worker plus narrow production-worker smoke/timeout cases, not the production worker's full role/seat/persistent-session matrix.

**Minimal correction, same canonical PR and existing workflow:** add a hosted production-worker matrix in the existing test file using the actual `agent49-policy-worker.cjs` and deterministic role-specific candidate-only/opponent-only bundles. Cover all four role/seat combinations, two ordered requests per persistent worker, host-computed bundle digest and READY checks, stable worker PID, and verified process/container cleanup. Keep the existing test-only worker for its OS-capability probes. Do not create another workflow, runner, branch, or fixture. This is an acceptance-coverage gap, **not** evidence of a VM escape or demonstrated runtime compromise.

### Exact-head execution status

At 11:27:50Z, PR #58 remained draft at `c114c15...` and GitHub returned zero Actions runs for that exact head. Public reproducible seed mode is owner-authorized; no fixture is authorized yet. The existing sequence remains: bounded `contract_only` first; if it passes, run the default compile-enabled/no-fixture path on the same exact head and verify the pinned seat-1 native witness actually executes rather than skips. Ensure `AGENT36_PHYSICAL_SEED_DISCLOSURE_DECISION=public-reproducible` is set before any eventual dispatch. Report selected-step success separately from overall workflow status.

### Synchronization note

PR #58 already contains the deliberate merge from main at commit `eb9523cc3b4fa2e9c7266c4d0d0c865c5970ce6f`, whose main parent was `3a4ea1154201e94e2b890ea199c6ce0a1e6df34e`. Agent10's 10:52 comparison showed the subsequent main-side paths were continuity/leases/communications and had **zero** overlap with PR code paths. Do not interpret the ahead/behind count as code conflicts or repeatedly rebase just to absorb communications-only commits. If the owner elects to perform a final synchronization, do it once deliberately and record the exact base.

— **Agent3, updated after independent reproduction of Agent35's new acceptance gap**


### Post-acceptance vertical-slice launch gate — current runner still imposes an action cap

Agent35's 11:36 lifecycle cross-check identified, and Agent3 independently confirmed, that the current V3 fixture runner is not yet configured for the Critic's required complete diagnostic game:

- `simulation/evaluation/2026-11/agent36-v3-runner.cjs` sets `V3_FIXTURE.maxActions: 6000` (line 696), passes it into `runNativeFixtureGameAsync({ ..., maxActions: V3_FIXTURE.maxActions })` (line 1765), and reports the same cap in `decisionBudget.maxActions` (line 1042).
- The underlying `runNativeFixtureGameAsync` stops its loop when `actions < maxActions` becomes false and throws `Native fixture game exceeded maxActions without a natural terminal state` (in `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs`). Thus a 6000-action cap is real, not merely receipt metadata.
- Critic's first vertical-slice specification requires complete games **without action caps**. Do not dispatch that diagnostic game with this cap in place. Remove the action-count cap for the authorized vertical slice (retain failure-inclusive receipts and an appropriate non-action safety watchdog if needed); never reinterpret a capped result as a natural terminal.

The owner has selected public reproducible physical seeds in issue #59. `validatePhysicalSeedDisclosureDecision()` already accepts `public-reproducible`; private-host-only mode remains unimplemented and is no longer a required path. Ensure the explicit `AGENT36_PHYSICAL_SEED_DISCLOSURE_DECISION=public-reproducible` environment authorization is present at dispatch and preserve the process/RNG/isolation gates.

These are **post-worker-acceptance vertical-slice launch gates**, not reasons to dispatch a fixture now and not a new worker/protocol CI lane. Public seed mode is authorized; no fixture is authorized until the production-worker matrix, exact-head acceptance paths, and uncapped natural-terminal requirement are satisfied.


### Stadium/tool epoch scope — source-level witness authored; execution pending

The exact PR head `c114c15...` contains a compiled pinned-Store witness in `tests/2026-11/agent3-known-cap-free-action-enumerator-native.test.cjs` (lines 484–517): candidate seat 0 is active with its own suppression counter at zero; only opponent seat 1 has `stadiumAndToolHaveNoEffectTurnsRemaining=1` and a Stadium in play; native enumeration emits `USE_STADIUM_ACTION`; the test expects frontier validation to record the native rejection, omit the `use-stadium` token, and preserve Pass. This is the right targeted probe for the adapter's any-player-positive suppression check, but **the test has not been executed or passed** because there are no Actions runs for this exact head. Treat the old Stadium-scope uncertainty as source-level coverage added, pending the default compile-enabled/no-fixture workflow on the exact head. Do not repeat the source probe; close the evidence gap only after that exact-head workflow passes.
