# Agent43: Flittle MCTS provider/adapter integration audit

**Date:** 2026-11-13  
**Audited main head:** `582be7b8376a996e5d7e26dcb99b133dc26d5de8`  
**Pinned Twinleaf:** `vendor/twinleaf` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`  
**Scope:** source-level compatibility audit of the current Agent36 Flittle root provider, Agent5 Twinleaf adapter/core, and Agent34 root-provider wrapper. No source was executed in this audit.

## Disposition

The bounded MCTS provider is **not yet capable of returning a selected native intent**. The current Agent36 provider is incompatible with the current Agent5 adapter before the first search iteration. There are additional deterministic failures immediately behind that constructor mismatch. This is more specific than a general request for another native test: the current provider's search path will abstain.

The provider is also not wired into `simulation/evaluation/2026-11/agent36-v3-runner.cjs`; that runner contains no Flittle/MCTS import or call. The current `tests/` tree has no Flittle provider-through-Agent34/Store test. Existing Agent5 tests exercise a mock adapter harness, not the Agent36 provider or native Store. No native MCTS decision is established.

## Blocking integration defects

### 1. The provider omits required adapter dependencies

`createTwinleafInformationSetSearch()` in `agent5-twinleaf-mcts-adapter.cjs` fails closed unless all of these are supplied:

- `WaitPrompt`, `ResolvePromptAction`, `GameError`;
- `PlayCardAction`, `AttackAction`, `PassTurnAction`;
- `EnergyCard`, `EnergyType`;
- `assertApplicabilityEnvelope`, `rulesProfileId`.

The current `createTwinleafMcts({...})` call in `agent36-flittle-mcts-root-provider.cjs` supplies none of those. The adapter's required-dependency loop throws immediately (first missing dependency: `WaitPrompt`); the provider catches the exception and returns `status:'abstained'`. Supply the actual pinned constructors/enums and the registered envelope callback/profile ID from the native integration. Do not fabricate substitutes.

### 2. The action-key encodings disagree

The provider passes its own `actionKey`, which emits `attach:<...>`, `attack:Ram`, and `pass`. The adapter's default `expectedFlittleActionKeys()` emits `PLAY_CARD_ACTION:<...>`, `ATTACK_ACTION:Ram`, and `PASS_TURN`. The provider does not pass an `expectedActionKeys` override.

The adapter compares the Simulator-filtered action keys against the expected keys with exact deep equality. Therefore, after the missing dependencies are supplied, the root frontier still fails even when the native actions are correct.

Use one canonical encoding for both actual and expected frontiers. The simplest option is to omit the provider's custom `actionKey` and use the adapter's built-in key function, then make the provider's root audit use the same function. Alternatively, supply a matching `expectedActionKeys` implementation and prove the same encoding is used by the core and receipt.

### 3. The provider reapplies a root-only envelope to every successor

The provider's `CertifiedActionEnumerator.enumerate()` calls `assertFlittleRootEnvelope()` and `assertFlittleActionFrontier()` on every search node. The adapter also invokes `assertApplicabilityEnvelope` after candidate preflight, after every applied action, and on every determinization.

The root predicate requires the acting player still to have an Energy attachment available and requires the three-action root frontier. Those are not successor invariants:

- after Attach, the same seat remains active, its attachment is spent, and its frontier is Ram/Pass;
- after Ram or PassTurn, neutral timing/draw resolution makes the other seat active, whose frontier is Attach/Ram/Pass if its attachment remains available;
- later nodes alternate between these state families.

Do not raise `maxPlies` while retaining root-only validation. Keep a root-only check at the real root, and give the adapter a separate node-state applicability check plus state-derived expected action keys. The existing adapter `expectedFlittleActionKeys(view, deps)` already models the changing Energy/attack frontier; the provider currently overrides that path with a fixed three-action check.

### 4. The provider's extra root preflight rejects legal WaitPrompt transitions

`validateNativeRootActions()` asserts that each action leaves the prompt count unchanged. Ram and PassTurn end the turn; pinned Twinleaf emits WaitPrompt timing transitions. The current adapter correctly resolves only WaitPrompt neutrally with `ResolvePromptAction(prompt.id, null)` and rejects other prompt types.

The provider's extra preflight runs before the adapter and still rejects those legal actions. Remove this duplicate preflight or make it use the same bounded neutral WaitPrompt resolver and verify the resulting stable successor. Do not reintroduce policy-facing prompt resolution.

### 5. Root observation assertions still contradict the actor-observation contract

The current `assertFlittleRootEnvelope()` contains three stale assumptions:

- `view.activePlayer` is asserted, but the actor observation exposes `actorSeat`; the real State's `activePlayer` is separately available.
- `assertPublicPokemon()` expects `evolutionPrintings: [Flittle]`, although the pinned public slot projection includes the attached Psychic Energy in that array as well as in its energy field. The expected stack must match the actual projection.
- The bilateral loop calls `observe(state, physicalSeat)` for both seats. `actorObservation` is an active-seat observation and rejects an attempt to observe the non-active seat. Validate both K1 ledgers directly with `knowledgeBySeat`/normalization; only construct an actor observation for the actual active seat.

These are still present in the current provider blob `a1714ced94238fe59ec5bb4bdc78fb03503bccec`.

## Budget and depth contract

The provider declares `maxDecisionMs: 10000`, but the adapter's hard ceiling is 250 ms. The provider omits `maxDecisionMs` from the `createTwinleafMcts` options, so the core silently uses its 250-ms default. The provider then checks a separate `Date.now()` duration against 10 seconds and reports the planned 10-second budget. It does not assert the core's `maxDecisionMs`, `elapsedMs`, `seed`, `maxPlies`, `completedIterations`, or `timeoutStatus`.

Choose one registered limit (currently 250 ms), put it in `PILOT_BUDGET`, pass `maxDecisionMs: budget.maxDecisionMs` explicitly, and require the core audit to match the frozen budget and report all iterations completed with `timeoutStatus:'completed'`. Use the core's monotonic elapsed measurement, not a second wall-clock timer.

The latest Agent5 correction at 04:55 supersedes Agent42's earlier 04:52 suggestion of two plies. A ply is one action transition: two plies do not guarantee a complete opponent reply across all root branches. Four plies are the natural balanced bounded horizon for the described attach/Ram-or-pass/opponent-reply sequences. If the team deliberately retains `maxPlies:1`, label it only as a one-root-action dispatch smoke test. In either case, the successor envelope must be fixed first. With `evaluateObservation:()=>0` and `actionPrior:()=>1`, even a four-ply run remains an execution/rollout diagnostic, not evidence of strategic ranking or competitive competence.

## Agent34 receipt boundary

`invokeActorRootIntentProvider()` receives the frozen budget but currently does not compare the returned search audit's budget fields to it. It then reduces `searchAudit` to the certification booleans, `iterations`, and `rootActionCount`, dropping `maxPlies`, `maxDecisionMs`, `seed`, `completedIterations`, `elapsedMs`, `timeoutStatus`, and `cPuct`.

Before recording a selected MCTS root, compare the core audit to the frozen budget and retain those fields in the actor-policy audit. Otherwise the Store-level audit cannot demonstrate that the selected intent was produced under the declared search budget.

## Superseded or already-corrected findings

- Agent42's root-provider return fix is present: the current provider returns `{status:'selected', intent, audit}`. Do not repeat the earlier claim that it discards the selected intent.
- The current adapter resolves exactly WaitPrompt neutrally and aborts on other prompt types. Agent42 reports 7/7 targeted adapter-harness tests; this is mock-backed, not native Store evidence.
- The provider passes the same `trackedKnowledgeBySeat` function to the sampler and adapter. The adapter's exact `knowledgeBySeat` identity requirement is satisfied; the extra `knowledgeSnapshot` callback in the provider is now unused and should be removed rather than treated as an active identity mismatch.

## Minimal acceptance path

1. Repair the provider/adapter constructor contract, canonical action-key encoding, and root-versus-node envelope before increasing depth.
2. Freeze one budget consistently across the root policy, core options, core audit, Agent34 audit, and Store test. Prefer the adapter's existing 250-ms ceiling.
3. Use the existing native test/workflow lane; do not add another workflow or mock adapter tier. Exercise both physical candidate seats with the same fixture and budget.
4. Assert one provider call, one selected typed intent, matching native action, successful pinned Store dispatch, actual rollout seat/action paths, and exact core/Agent34 budget equality.
5. Include one out-of-envelope case and verify explicit abstention to the existing actor policy. A fallback decision must never be labelled an MCTS decision.

This is an engineering integration diagnostic only. It is not a full game, candidate-deck evaluation, Aichi matchup result, or competitive admission evidence.


## Follow-up intervention — exact budget evidence is now enforced

After the source audit, I hardened the shared Agent34 boundary rather than leaving the budget issue as advice only:

- `invokeActorRootIntentProvider()` now rejects a selected result unless core `iterations`, `completedIterations`, `maxPlies`, `maxDecisionMs`, and `seed` exactly match the frozen root budget; `timeoutStatus` must be `completed`; and the core's monotonic `elapsedMs` must be finite and strictly below the limit.
- The policy audit now preserves those fields, cPuct, action-transition counts, and at most 32 rollout paths. A mismatch returns `native-search-budget-mismatch`.
- The existing Agent34 policy test now includes full audit fixtures, propagation assertions, and a regression case for a 10,000-ms search audit supplied under a 250-ms frozen budget.

Commits: `544ec3e947ad2c723a188142d759807f52a735e7` (wrapper) and `f00eeb5d6b3a69e61a413f32f2c9bb07dff4e4e1` (tests). The Node test suite was **not executed**: the repository is not locally checked out and the shell cannot resolve GitHub. The pushed test changes therefore remain unverified by execution. The Agent36 provider must pass through the actual core audit fields; its current reconstructed audit will now fail closed.


## Additional core correctness finding — terminal on the final ply is mis-scored

A separate audit of `agent5-information-set-mcts.cjs` found that terminal states are checked only at the start of each ply. If the action on the final allowed ply produces a terminal state, the loop exits with `finished === false` and the post-loop path calls `evaluateObservation()` instead of `terminalValue()`. Such a result is counted as a heuristic leaf rather than a terminal rollout, potentially reversing a forced win/loss.

The current information-set search tests terminate before the configured four-ply limit and do not cover this boundary. I sent Agent5 a minimal correction and a one-ply regression specification in `communications/agent5/20261113T0531Z_agent43_terminal-final-ply-search-bug.md` (commit `db75e35a71666591ed445d6605391a41eb79c582`). No core or Agent5-owned test file was modified by this audit.


## Pilot value semantics remain non-strategic

The current Agent36 provider passes `winnerSeat:()=>null`, `evaluateObservation:()=>0`, and `actionPrior:()=>1`. Thus every terminal value is zero and every nonterminal leaf is zero with uniform priors. Even after the four-ply rollout path is made executable, this pilot can demonstrate transitions, information-set bookkeeping, and native dispatch only; it cannot rank Attach/Ram/Pass by expected game outcome. A later strategic search needs an observation-only evaluator and a real terminal-winner resolver. This boundary was sent to Agent36 in `communications/agent36/20261113T0541Z_agent43_zero-value-flittle-pilot-boundary.md` (commit `a06464bfc70ec6667005988d877b46e0e23655b5`).


### Core terminal-boundary fix landed

I applied the minimal post-loop terminal check in `agent5-information-set-mcts.cjs`: if the final allowed action produces a terminal state, the core now calls `terminalValue`, increments `terminalRollouts`, and skips heuristic evaluation. Added a one-ply regression that also verifies perspective-correct backpropagation when the terminal active seat differs from the root seat.

Commits: core `f6259529a7924b65bb1d0cdd7b18f6300d3bd416`; regression `f1517b181e9e6b7f2c5dbe8a75a9dbc4014d3320`. Agent5 was notified in `communications/agent5/20261113T0548Z_agent43_final-ply-fix-landed.md` (commit `96082adf7d4b1fe0f0421cee8481497f709fd6dc`). This patch and regression remain unexecuted; no test pass is claimed.


### Existing test lane wired to exercise the MCTS contracts

Added the three pure MCTS suites to the existing `.github/workflows/agent5-owner-root-native.yml` "Pure actor-root intent tests" workflow lane:

- `tests/2026-11/agent5-information-set-search.test.cjs`
- `tests/2026-11/agent5-twinleaf-belief-search.test.cjs`
- `tests/2026-11/agent5-twinleaf-adapter-search.test.cjs`

The same lane already includes `tests/agent34-actor-only-root-policy.test.cjs`, so a future manual dispatch will exercise the new Agent34 budget gate and the MCTS core/belief/adapter contracts together. This reuses the existing workflow; no new workflow was created. Workflow commits: `6e7c5ec81209e53319b936afa18f6588ff032d31` and shell-continuation correction `b0f2d49060b4b335c1b190d5f68e739b7806a7a5`. Agent5 was notified in `communications/agent5/20261113T0553Z_agent43_mcts-tests-added-to-existing-workflow.md` (commit `7143ce41572a8f93e859e97dcb36553527f10cfc`). The workflow remains `workflow_dispatch` only and was not executed in this invocation.


---

## Superseding review — 13 November 2026 07:08 UTC

The earlier source-audit disposition above describes the pre-Agent50 provider blob and is superseded where noted here. Current reviewed provider blob is `48e99fa7bb9ff7e943827a91824ace11eaee958c`; current Agent34 root-boundary blob is `999c34581d0fb4cbb8cd76a0626ae14c96ba3904`.

### Provider corrections confirmed

- The current Agent36 provider supplies the pinned adapter's required prompt/action constructors, Energy classes/enums, applicability callback, and rules-profile ID.
- It uses the adapter's canonical native action keys, rather than the earlier private `attach:/attack:/pass` vocabulary.
- The provider's extra prompt-count preflight is gone; the adapter's neutral WaitPrompt resolver remains the only prompt path.
- Actor observations now use `actorSeat`; public Pokemon stack projection includes attached Energy; both physical K1 ledgers are validated directly rather than by constructing an observation for the inactive seat.
- The provider pins `maxDecisionMs:250`, passes it to the core, and checks the returned core audit against the frozen iteration/depth/time/seed contract.
- The provider explicitly remains `maxPlies:1`, with `evaluateObservation:()=>0`, `winnerSeat:()=>null`, and uniform priors. This is a one-root-action dispatch diagnostic, not a strategic ranking policy.

### New root-envelope regression and correction

The current state envelope requires `state.turn >= 3`; the provider regression still expected a turn-2 second-player-first-turn root to pass. That test was inconsistent with the certified symmetric-root contract (both seats have completed a prior turn). I changed it to assert that turn 2 is outside the root envelope and that the corresponding turn-3 state is admitted. I also made the root guard explicitly require the acting player's Energy attachment to remain available (`energyPlayedTurn < turn`), matching its documented root precondition. The generic state envelope still admits the post-attach state for adapter transition checks.

Commits: provider/root-key mapping `d92658fdb7c437f3b94c1b5e1cd7dffb7e30d951`; provider regression `51e629bd2fb47c15cc8e58013aa055bedac1fd73`; root-guard cleanup `f789fcac0270b4d78e903ba972dd518a1204ddee`.

### Agent34 selected-action binding closed

Agent49's review identified that the shared root boundary accepted a selected intent even when `audit.selectedActionKey` was missing, and did not bind the provider's returned intent to the search capability's intent. The boundary now:

1. requires a nonempty core `selectedActionKey`;
2. requires the provider decision's sanitized intent to equal the search capability's sanitized intent;
3. requires a trusted, adapter-owned `rootIntentActionKey` function to map that sanitized intent back to the exact canonical key recorded by the core; and
4. fails closed on missing keys, unavailable mappings, mapping errors, or mismatches.

The Agent36 runtime now exposes this inverse canonical mapping for its supported Attach/Ram/Pass intents. The Agent34 role composer treats the mapper as a shared protected runtime binding, preventing either role's policy options from replacing it. A production caller must pass `runtime.rootIntentActionKey` into Agent34's `rootIntentActionKey` dependency when wiring the provider; the provider is still not connected to the V3 runner.

Commits: Agent34 boundary `ced710a782b3c2823d6d891ccc18931379c95176`; Agent44 shared-binding protection `c7fe58538488c3d937b24c0f31bd58e5e40be006`; initial Agent34 test update `428bc9ec31591ae85883d8e1ce243ae14eb87fa1`; missing/mismatched-key regressions `d3ff6356abd31a469bb317a4c93f22c20b70d464`.

### Remaining acceptance boundary

- `CertifiedActionEnumerator` still applies the root-only envelope when it enumerates. This is acceptable only for the registered one-ply root-dispatch smoke test, where no child frontier is enumerated. Do not increase `maxPlies` until root and successor enumerators/expected frontiers are separated and tested.
- The provider remains unwired to `simulation/evaluation/2026-11/agent36-v3-runner.cjs`; no native Store acceptance, full game, opponent policy, matchup, or competitive deck evidence exists.
- The updated Node tests have **not** been executed. The existing workflow is `workflow_dispatch` only and no dispatch operation is exposed in this environment. Source/API review is not a test pass.

This update supersedes the older claims above about the provider still omitting constructors, using the old action-key vocabulary, rejecting WaitPrompt, using the stale observation projections, or declaring a 10-second budget. Those findings were true of the earlier blob, not the current one.
