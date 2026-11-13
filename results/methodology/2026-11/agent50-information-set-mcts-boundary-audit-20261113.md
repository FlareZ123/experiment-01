# Information-set MCTS: boundary audit and bounded Flittle provider integration

**Date:** 13 November 2026  
**Scope:** Static source review of the current Agent5 information-set search adapter and belief-input sampler. This is an interface audit, not a native match, not a completed MCTS decision, and not evidence of a competitive matchup.


## Status update — 13 November 2026, 06:12 UTC

The three original information-surface concerns and the ActionEnumerator legality gap have since been addressed in Agent5's current adapter/belief-input code:

- **Prompt selection:** there is no policy prompt resolver in the adapter. The resolvePrompts function accepts only native WaitPrompt, resolves it with ResolvePromptAction(prompt.id, null), and rejects every other prompt. This is safer than routing a resolver by owner because no policy callback receives a prompt or State. The audit field promptResolutionActorScoped is still emitted as a hard-coded true; Agent5 should derive it from explicit prompt-resolution/unsupported-prompt counters before treating the field as independently evidenced.
- **Full owner ledger:** createTwinleafInformationSetSearch now derives its knowledgeBySeat from the exact sampler provider, canonicalizes the complete K0/K1/PARTIAL ledger, and includes the acting owner's ledger in the observation hashed for node identity. The determinizer and observer share the same provider and metadataByState.
- **Public-prior callback:** ignorePublicCard now receives only the already-collected public printing, not State, Player, or native card objects.
- **Native frontier filtering:** each raw ActionEnumerator candidate is dispatched on a fresh isolated Simulator using the configured random flip/shuffle modes; GameError candidates are filtered, unsupported prompts/transitions abort, the upstream per-category cap is guarded, and the accepted semantic keys must match the observation-derived frontier. This is adapter-side contract coverage, not yet proof of a Store-backed match.

### Bounded Flittle provider repair

The previous simulation/twinleaf/2026-11/agent36-flittle-mcts-root-provider.cjs could not instantiate Agent5's adapter. It omitted required native constructors and the registered applicability ID, used custom action keys incompatible with the adapter's expected keys, reused root-only checks after actions, and declared a 10-second budget while the adapter ceiling is 250 ms.

Agent50 repaired the provider on main:

- It loads the actual pinned Twinleaf bindings from vendor/twinleaf/ptcg-server/output/ (the submodule path is vendor/twinleaf, remote https://github.com/twinleafgg/twinleafgg.git, pinned commit a9905a76a6c4103ba4b6cb9a49e86bad795c5c05).
- It supplies WaitPrompt, ResolvePromptAction, GameError, PlayCardAction, AttackAction, PassTurnAction, EnergyCard, EnergyType, PlayerType, SlotType, ActionEnumerator, Simulator, the random BotArbiter modes, the exact applicabilityEnvelopeId, and a pinned rulesProfileId.
- It uses Agent5's flittleActionKey() and expectedFlittleActionKeys() rather than a parallel action-key vocabulary.
- Root checks require both active Flittle to have one Psychic Energy and no damage. The acting seat may still have its attachment available (attach/Ram/pass frontier) or may already have attached this turn (Ram/pass frontier); the opponent's attachment must be from an earlier turn. The root validator admits globalTurn 2 so the second player's first turn can be tested. A separate successor-state envelope permits the one-energy Ram/Pass turn transition or the same-seat two-energy post-attach state. The MCTS horizon remains maxPlies: 1, so only the root frontier is searched; the successor envelope validates the one simulated transition but does not certify a child action frontier.
- The enforced budget is iterations: 16, maxPlies: 1, maxDecisionMs: 250, seed: 20261113. The provider passes the deadline to the core and checks the returned core audit's iterations, completed iterations, depth, deadline, seed, timeout status, and monotonic elapsed time. It also requires the core selectedActionKey to equal flittleActionKey(selected.action), binding the audited native action to the typed intent.
- Both registered candidate and opponent decklists are required at runtime and must each equal the exact 60-card fixture (1 Flittle SVI + 59 Psychic Energy SVE). Agent49's independent review correctly noted that validating these supplied objects alone does not bind them to the hidden cards in the live Store. The provider now additionally requires a trusted flittle-store-decklist-binding-v1 receipt binding both registered IDs and canonical list digests to a full native Store-state digest, with both physical seats checked. The future runner must produce this receipt from a trusted full-zone composition preflight before constructing the policy; the provider itself does not inspect concealed opponent identities. Until that runner preflight exists, the receipt is only an enforced interface contract, not proof of Store/list binding. The Flittle fixture remains a test harness, not a competitive candidate.

Pure contract coverage was added in tests/2026-11/agent36-flittle-mcts-root-provider.test.cjs: root versus successor envelopes, turn-2 second-player root and two-action frontier, seat mismatch, canonical action frontier keys, typed intent translation, exact adapter dependency construction, exact registered-list validation, trusted Store-binding receipt acceptance/rejection, selectedActionKey-to-native-action binding, and budget/scope checks. The test and syntax checks are in the existing MCTS pure-test step of .github/workflows/agent5-owner-root-native.yml; no workflow was created. The temporary duplicate test wiring in the Agent36 native fixture workflow was removed.

Relevant Agent50 commits:
- Provider repair and native projection: 4feb9d5aa7f4ee8f909a7fd77bf670dd92c19358, 867879ace0bf3b95f5936539d6528c32a3be0d2a, 3842f0c8cbbb6ed0aea176e4c595cd990e6fbc79, d86b99067af5d6f38096ecef70d861e0bdbd1bbf, 5d5d439fab3a5437bd2020aea30d5af564440bd8, 0ad8cb841c1c02f802ae32ea4af9326667dd8a3d, ca58cbe13565ed79bbd663f7fd358e7291886e8c.
- Contract tests: 40fca98fdda182910c553194bdb905749292a0a3, c09c93a0270bbcd3e710c6a058942d415cfd623f, f4ff27572511ae34cf59756506d5c5d1903540e2, a47526f0ed56de92c317865f9270ac059b9e45e2, 24c85c4b9610eee017edce1c10333e3238c39eaf.
- Workflow routing: 30b1fea1bd5cc89390b4b7b6bfa08736a5bf6bb5, f4995b2ff721418ae119d7e8e755170471202640.
- Report updates: 629dda1fe5f4e0313ecf16e61db5ac48c8b69e22, 833c452837a229f1166d72caa7593ba507e3b941, ed5a7ff57eb38613e93bf689514da600e706492f, 9504d3309952960b4cead39e95c993cfcafde039, 409e404125569dd283d8341e04f85ed02e5b4ada.

### General multi-ply limitation: root-determinization strategy fusion

Agent5 subsequently demonstrated a separate algorithmic failure in the current PUCT core. Each iteration samples once from the root player's information set and keeps that same hidden world while traversing opponent nodes. The opponent node is keyed by its own observation, but its Q values are conditioned on the root's actual private card. A synthetic counterexample holds the opponent observation and its 20% threat prior constant while changing only the root-private card; the simulated opponent's action distribution reverses (393/399 Block versus 393/399 Pass). See Agent5's report at results/methodology/2026-11/agent5-root-mcts-opponent-belief-fusion-20261113.md, test at tests/2026-11/agent5-root-determinization-opponent-belief-fusion.test.cjs, and broadcast at communications/broadcast/2026-11/20261113T0615Z_agent5_root-determinization-opponent-belief-fusion.md.

This does not affect the current Flittle smoke because it stops after one root action and never expands an opponent decision; the one-Flittle/59-identical-Energy fixture also makes hidden card identities degenerate once Flittle is Active. It does block using this PUCT core as a generally competent opponent model in Expanded games. Before increasing maxPlies, do not use the legacy root-determinization PUCT opponent nodes. Agent5 has now added an optional fixed actor-observation opponent-policy mode to the core: opponentActionPolicy receives only that seat's observation, sorted legal action keys, physical seat, seeded RNG, and deadline context; it must return a legal key, and repeated opponent information sets must retain the same frontier. The audit records opponentModel, opponentPolicyId, opponentPolicyCalls, and opponentInformationSetCount. This is policy-conditioned root search, not equilibrium/adversarial PUCT. It is a practical alternative for field evaluation only when the supplied per-rank policies are independently strong, frozen, and observation-safe. For a genuine equilibrium model, actor-relative re-determinization with per-seat K0/K1/PARTIAL ledgers, legal transitions on return to root, and seat-swap metamorphic invariance remains necessary. The current Flittle provider does not pass an opponent policy because maxPlies=1 never expands an opponent node.

### Remaining hard boundary

This provider is still **not wired into simulation/evaluation/2026-11/agent36-v3-runner.cjs or a native Store test**. The V3 runner currently constructs its role policies without this provider; no call to createFlittleMctsRuntime() or rootIntentProvider exists there. The new tests are synthetic contract tests and have not been executed in this invocation; the existing workflow is manual-only and no dispatch action is available here. Consequently there is still no selected typed intent accepted by the pinned Store, no completed MCTS pilot, no full game, and no competitive evidence.

The pilot is strictly a **one-root-decision dispatch smoke test**: the evaluator is constant zero and action priors default to uniform, only one action transition is simulated per iteration, and no opponent reply is searched. Even a successful native dispatch would prove integration and bounded frontier correctness only—not strategy, matchup strength, or a deck win rate. The current repository decision board still reports zero verified Expanded-eligible Aichi opponents, no selected final 60, and no demonstrated 99.5% win rate.

Next action: Agent36 (or the next owner of that runner work) should pass both registered fixture 60s, the pinned engine, and a trusted full-zone Store/list binding receipt into this provider; wire it through the existing Agent34 actor-only chooser; and prove one accepted typed Store action for each physical seat. The receipt preflight must compare the live Store's full card multiset by physical seat against the registered decklists without exposing those concealed identities to the policy. Confirm with the pinned engine that the turn-2 attack frontier is actually legal under attackFirstTurn=false; Agent5's observation-derived frontier currently assumes Ram is available whenever globalTurn>1, while the isolated Simulator candidate filter will fail closed if the engine rejects it. Agent43 should independently review the updated provider and the state-family assertions. Agent5 should replace the hard-coded prompt certification flag with a derived certificate. Do not widen beyond one ply until distinct successor frontiers are specified and tested.


## Initial audit findings (historical baseline; see current status below)

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

If an integration follows the v1 report's metadata wiring but omits `knowledgeSnapshot`, determinization can honor K1/PARTIAL while the MCTS information-set key hashes an observation with `ownerK1:null`. Distinct information states can then share the same seat+observation key. The root/determinization equality check will not detect the omission because both MCTS observer calls use the same null default. Even if only the existing `ownerK1Snapshot` callback is supplied, the observation contract still omits the full ledger fields consumed by `normalizeKnowledge()`: `knownTopDeck`, `knownBottomDeck`, `knownBottomDeckOrder`, and the full K0/K1/PARTIAL mode. Two states with identical public board/hand but different owner-known top/bottom order can therefore still collide.

**Required correction:** Make the entire verified per-seat owner ledger a required observation input (or expose the sampler's exact per-seat ledger projection and bind it automatically): mode, known top prefix, known bottom block/order, known Prize membership, and owner K1 snapshot. The observation key and determinizer must use the same ledger. Include only the acting seat's own ledger in that seat's observation; never expose the other seat's ledger. Reject ledger/observation disagreement before search.

**Required regression:** Keep public state fixed and change only the acting owner's known-top prefix, known-bottom block/order, K1 epoch/known-Prize membership, and K0↔PARTIAL state. Each distinct owner knowledge state must change the observation identity/node key. A mismatch between the ledger and observation must fail closed.

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

## Additional native action-frontier blocker: ActionEnumerator is only “legal-ish”

Agent36 inspected the pinned Twinleaf `ptcg-server/src/advanced-bot/action-enumerator.ts` and found its own contract says it emits “legal-ish” actions whose validity is confirmed by `Simulator` in `ActionSearchAi`. It has a per-action-type cap of 8 and does not itself prove attack-used state or attack-cost payment. The current Agent5 MCTS adapter returns `enumerator.enumerate(...)` directly, so it can put illegal actions into a node and later select one that aborts search.

**Required adapter correction:** For each raw candidate, validate it on a fresh isolated Simulator using the same random BotArbiter options, retain only dispatch-accepted actions, preserve stable action keys, and assert the filtered frontier is identical across determinizations of the same owner observation. If any per-type cap is reached, or a prompt/Prize/KO/hidden-reveal/unsupported transition leaves the declared envelope, mark the frontier incomplete and abstain. Do not use the raw ActionEnumerator list as an MCTS node frontier.

Agent36's bounded pilot fixture is now precisely specified as **1× `Flittle SVI` + 59× `Psychic Energy SVE`**, with the single Flittle forced Active after mulligans, and its sole attack is **`Ram`** (one Psychic, 10 damage). This deliberately removes hidden Basic-Pokémon identities from the remaining hand/deck/Prize partition; it is a test fixture, not a competitive deck. The intended action frontiers are root: attach/Ram/Pass; after attach: Ram/Pass; after Ram: attach/Pass; after Pass: opponent root. The Simulator filter must still prove those frontiers rather than assume them.

Targeted implementation handoff: `communications/agent5/20261113T033818598Z_agent50_native-simulator-action-filter.md`. Agent36 is owning the runner-side envelope and Store trace.

## Follow-up: fail-closed root-intent provider seam

To avoid leaving the audit as a handoff only, the small Agent34/Agent44 composition seam is now implemented on main:

- `simulation/twinleaf/agent34-actor-only-root-policy.cjs` exports `invokeActorRootIntentProvider()` and calls it only for a seat-scoped root where no higher-priority chooser or downstream fallback can override the result.
- The live State is passed only to the trusted `createRootSearchCapability({state,actorSeat,view,catalog,budget})` factory. It returns a synchronous one-shot search function. The policy-facing `rootIntentProvider({actorSeat,view,catalog,rootOptions,budget,runSearch})` receives no State/Player/Prompt object and must call `runSearch()` exactly once before selecting.
- The search result must carry a complete-frontier flag, verified bilateral knowledge ledgers, owner-ledger inclusion in the information-set key, actor-scoped prompt resolution, and a stable applicability-envelope ID. Otherwise the wrapper abstains and retains the existing chooser.
- Only the bounded typed neutral intents `bench-basic`, `attach-basic-energy`, `attack`, `pass`, and `paid-retreat` are accepted. The wrapper sanitizes intents and audit summaries and records selected/abstained/skipped counts.
- `simulation/twinleaf/agent44-role-scoped-policy-composition.cjs` protects the provider and capability factory as shared runtime bindings and requires exactly equal candidate/opponent `rootIntentBudget: {iterations,maxPlies,maxDecisionMs,seed}` policy options.

Commits: Agent34 seam `b492006257ae6f8d78460655bd0a700fefbe0f23`; Agent34 audit sanitization `77af83545c5669be04f32402eb38040a20e9504b`; final intent-vocabulary guard `08427bfacf5ca40ab3373391c3340bd5eb7d6cad`; Agent44 composer `0ed574f4a44dc3ba6654d15e2ec0fb32ed3e51bd`; tests `cbd89508805baffc6b0a954c20328faf1d9ab714` and `2dbd90f08d6c30a8e08defbdb6642ca387e07dd3`.

This seam is intentionally **fail-closed**: current Agent5 adapter does not yet produce the required certificates and its prompt/ledger surfaces remain open, so it should abstain rather than claim MCTS. The tests are committed but not executed; no native pilot, game win rate or competitive evidence is established. Runtime module hashes changed; regenerate/pin role manifests before any qualified run.

## Handoffs

Targeted implementation/audit messages were sent to Agents5 and 43 on 13 November 2026:

- `communications/agent5/20261113T025304920Z_agent50_mcts-prompt-noninterference-audit.md`
- `communications/agent5/20261113T025604858Z_agent50_mcts-knowledge-key-audit.md`
- `communications/agent5/20261113T031244913Z_agent50_public-prior-state-callback.md`
- `communications/agent43/20261113T025304920Z_agent50_mcts-prompt-noninterference-audit.md`
- `communications/agent43/20261113T025604858Z_agent50_mcts-knowledge-key-audit.md`
- `communications/agent43/20261113T031244913Z_agent50_public-prior-state-callback.md`
- `communications/agent5/20261113T031531450Z_agent50_mcts-full-ledger-key-followup.md`
- `communications/agent43/20261113T031531450Z_agent50_mcts-full-ledger-key-followup.md`.

The proposed root-intent provider seam was separately sent to Agents5, 34 and 36. Keep that callback in protected runtime dependencies, not serialized role policy options, and preserve explicit abstention when a complete native action frontier and bilateral information ledgers are unavailable.


## Status update — 13 November 2026, 07:20 UTC: stochastic opponent-policy RNG isolation

Agent43's follow-up audit found a second information-set leak in the fixed actor-observation policy mode: the core shared the mutable game-transition PRNG with the stochastic opponent-policy callback. Hidden-state-dependent draw consumption in an earlier transition could shift the policy's random choice; policy draws could also perturb later game transitions.

Agent50 fixed this in the shared core. Each policy invocation now receives an isolated deterministic stream seeded from the search seed, iteration, physical acting seat, the actor's observation hash and public search ply. The stream is derived per information set rather than as one sequential per-iteration stream, so a hidden-dependent number of earlier policy calls cannot shift it. Only `applyAction` receives the game-transition RNG. The audit reports `opponentPolicyRngProtocol: "mcts-opponent-policy-rng-v1"` when fixed-policy mode is active.

- Core commit: `1249aa66cb0ecb14566956e1cfe541200c1ea6c5`
- Regression commit: `7ac902a47f6582b720e4c05c37d8c86908a91f4d`
- Full implementation/evidence report: [fixed opponent-policy RNG isolation](agent50-fixed-opponent-policy-rng-isolation-20261113.md)

The complete five-test strategy-fusion/RNG test file passed in a V8 harness with deterministic SHA/assert shims. This is not Node 22 or native Twinleaf execution; the existing manual Agent5 workflow includes the test file but was not dispatched. This correction does not fix the separate root-determinization strategy-fusion defect in legacy PUCT opponent nodes, and it does not establish policy competence or competitive performance.
