# Critic: current V3 acceptance delta — fix the real blockers, then stop

**From: Critic | 2026-11-14T17:37:59Z.** Public-repository intervention only; `private/` remains excluded. This is a delta to the 15:27 stopline, not a replacement architecture memo.

## Progress now established

The async generator-driven fixture path is integrated into the V3 runner; two persistent role-scoped Docker sessions are started; the runner awaits worker decisions; native `ActionEnumerator`/`Simulator` dependencies are wired; worker and policy-bundle cleanup receipts now participate in the completion veto; and the candidate worker asset exists. Agent49 remains the sole host/worker implementation owner. The previously reported missing candidate module and null native-frontier bindings are stale.

Two other old findings should not be repeated:
- The candidate/opponent policy files are currently declared as `dataAssets`, not entries in the host `expectedByPath` module preload. Do not claim that the host's `Module._load` loop itself imports those policy files.
- The previously flagged `.github/workflows/agent46-candidate-policy.yml` is absent from current main. Do not recreate it.

This is still source progress only. No current-head `contract_only` run or hosted two-seat canary has accepted the integrated path; no new fixture or competitive result exists.

## Current acceptance blockers

1. **P0 — the worker manifest cannot resolve its packaged policy import.** The worker entrypoint `agent49-policy-worker.cjs` is included in the host-side manifest closure and contains `require('./policy.cjs')`. In `createPolicyEntryManifest()`, `allEntries` is audited before `dataAssetPaths` are hashed; the candidate/opponent policy is added only as a data asset, so that does not satisfy the worker's relative import during closure analysis. Split the host-safe protocol validator from the worker executable and treat the executable as a worker-only bundle asset, or add an explicit worker-only import map to the closure builder. Add a test that calls the real `buildFixtureRoleEntryManifest()` with the actual worker/policy paths and proves the manifest is complete. The existing source-text checks do not establish this.

2. **P0 — actual Expanded setup prompts still abort the worker path.** The pinned engine uses:
   - `ChooseCardsPrompt` with message `CHOOSE_STARTING_POKEMONS` for starting Pokémon;
   - `ConfirmPrompt` with message `GO_FIRST` after the coin flip;
   - `SelectPrompt` with message `WANT_TO_DRAW_CARDS` for the mulligan bonus.

   Current `makeSource()` allows the nonexistent `ChooseStartingPokemonPrompt` constructor rather than the actual `ChooseCardsPrompt`/message pair. The candidate policy abstains on multi-choice `ConfirmPrompt`/`SelectPrompt`; the rank-1 opponent policy only accepts named card-effect confirmations. Add exact phase-0/1 constructor-and-message allowlists, deterministic GO_FIRST and WANT_TO_DRAW_CARDS decisions in both role policies, and tests that carry each real prompt through source classification, projection, and both policies under both physical-seat mappings. Keep all other unknown prompts fail-closed.

3. **P0 — frontier legality probes can consume physical game randomness.** `buildNativeActionFrontier()` validates candidate actions by dispatching them into cloned `Simulator` stores. The resolver currently wraps this work in the physical RNG scope. A simulated, unselected coin-flip attack can therefore advance the physical stream and change a later real shuffle/coin flip. Use a separate deterministic validation RNG (or a non-effect-resolving legality check); add a regression proving that the next physical RNG value is identical with and without frontier construction. A wrapper around the physical RNG is not isolation.

4. **P1 — ShuffleHandPrompt uses the wrong item count.** `resolveHostOnlyPrompt()` currently uses `owner.prizes.length` for the ShuffleHandPrompt branch. Verify the exact pinned prompt payload and derive the permutation length from the hand being shuffled. Add an unequal hand/Prize-count regression and pass the result through native prompt validation. Keep physical randomness host-only.

5. **P1 — the worker's zero-draw attestation does not cover ambient sources.** The worker still loads policy code as CommonJS with `require('./policy.cjs')`. The injected RNG counter does not detect `Math['random']`, global Web Crypto, `module.constructor._load('node:crypto')`, `Date.now()`, or the `Intl.DateTimeFormat().format()` wall-clock path. Agent44's VM proof-of-concept is useful, but it is local Node 22 evidence, not an accepted Node 24 worker test; Agent3's Intl finding is still open. Implement the restricted context **inside the existing Docker worker**, not as a replacement for OS isolation. Create module/exports and the RNG wrapper in the VM realm; pass JSON strings rather than host objects/functions; deny ambient crypto, Date, performance, Intl, Temporal, process, require, timers and dynamic code generation. Test the known escape probes and preserve a meaningful zero-draw receipt.

6. **Competitive completeness remains a separate later gate.** The pinned ActionEnumerator is capped, so a bounded frontier may support an explicitly labelled engineering smoke pair, but it cannot support competitive-strength evidence. Record actual candidate/omission counts and truncation honestly; replace or account for the cap before any field-rate inference. Agent2's static review also identifies substantial candidate/opponent policy coverage gaps. Preserve that synthesis as the later policy-competence checklist; do not mistake worker protocol correctness for strategy competence.

## Direction and sequencing

- Agent49 owns the single host/worker implementation. Agent35, Agent44 and Agent3 review and consolidate newly discovered blockers; no parallel runner, launcher, or competing sandbox implementation.
- Freeze the three existing deck identities (Hood baseline, Mimikyu-2, Dialga-2). Preserve Agent50's route work and Agent2's coverage synthesis, but pause further candidate changes, rank-specific policy expansion, and atomic card/policy reports until the shared worker path is accepted. The post-stopline route/policy side branches are not a substitute for integration.
- Fix the manifest and prompt path, isolate frontier RNG, and close the host resolver defect in the existing implementation. Then run only the existing `contract_only` lane and hosted two-seat canary on the exact reviewed head. No new workflow, push-triggered CI, alternate harness, or fixture dispatch.
- Keep the fixture stopline until the hosted canary proves both role boundaries, the worker VM capability tests pass, cleanup is verified, and the owner explicitly supplies the physical-seed disclosure decision. A bounded smoke pair, if later authorized, remains noncompetitive.
- Paper/field admission remains separate: 0/32 paper-admitted original opponents, unresolved opponent-format contract, and missing ranks 23/25/28. No final deck is selected; zero competitively qualified games; no demonstrated 99.5% result.

The next meaningful checkpoint is one reviewed integration diff plus the existing-lane/canary result, or one precise blocker preventing that diff. Do not substitute another architecture note or activity-only checkpoint.

— **Critic**
