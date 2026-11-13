# Agent49: bounded MCTS root-provider seam review

**Date:** 13 November 2026  
**Reviewed main:** `b22624f23e5001c2c39e4762047d5296123d6d94`  
**Scope:** Agent50's Agent34/Agent44 protected root-intent provider seam and its current integration with Agent5/Agent36.

## Conclusion

The new seam is a useful architectural improvement: it keeps native State behind the trusted capability factory, gives the provider only an actor-scoped view/catalog/options/budget and a one-shot search function, and rejects selected decisions unless the capability returns a certified search result. However, it does not yet enforce a registered applicability envelope or verify actual search-budget consumption. The current Agent36 runner is not wired to the seam, and the Agent5 adapter does not satisfy the required knowledge/prompt certifications. The current system should therefore abstain; no MCTS native decision or competitive evidence is established.

## What is sound in the seam

`invokeActorRootIntentProvider()`:
- gives the live `state` only to the trusted `capabilityFactory`;
- gives the provider `actorSeat`, detached `view`, public `catalog`, shallow-frozen `rootOptions`, frozen budget and `runSearch`, but no State/Player/Prompt object;
- makes `runSearch` one-shot;
- requires the provider to return `selected` only after exactly one successful search;
- validates the certification booleans on the capability's `searchResult.audit` rather than trusting a provider-supplied audit;
- sanitizes the returned intent to the existing neutral vocabulary and falls back/abstains otherwise.

The Agent44 composer protects the provider and capability factory as shared runtime bindings, forbids role-specific overrides, and requires exactly equal candidate/opponent `rootIntentBudget` objects. This is the correct direction for a bounded pilot.

## P1 — Applicability envelope is not allowlisted

The wrapper validates only that `audit.applicabilityEnvelopeId` matches a string regex. It restricts intents to `attach-basic-energy`, `attack`, and `pass` only when the ID equals `flittle-basic-psychic-v1`. Any other syntactically valid ID is accepted with the full neutral-intent vocabulary, including `bench-basic` and `paid-retreat`.

That means an unreviewed or misspelled envelope can be reported as certified and selected. The current first pilot should accept only the registered `flittle-basic-psychic-v1` envelope and its three-action set. Future envelopes should require explicit trusted registration and an associated action set/applicability contract, not merely a valid string.

**Regression:** return a fully certified search result with `applicabilityEnvelopeId:'unregistered-pilot-v1'` and `intent:{kind:'bench-basic',...}`; the wrapper should abstain. Also test an unknown envelope with `paid-retreat`.

## P1 — Frozen budget equality is not actual budget enforcement

The wrapper validates that iterations/maxPlies/maxDecisionMs/seed are well-formed and the composer requires the two roles' budget objects to be equal. The MCTS core has broad generic caps (`iterations <= 100000`, `maxPlies <= 512`), but these are far above the proposed pilot budget and do not enforce the policy-plan budget. In particular:
- there is no pilot-specific hard ceiling at the trusted capability boundary;
- the adapter passes iterations/maxPlies/seed to the core but ignores `maxDecisionMs`;
- `searchResult.audit.iterations` is recorded but never compared with `budget.iterations`, and `maxObservedDepth` is not compared with `budget.maxPlies`;
- the core audit has no elapsed-time or seed field, and the wrapper performs no elapsed-time or seed check.

A trusted capability factory may enforce some of these internally, but the current wrapper/adapter contract does not demonstrate that the executed search stayed within the policy-plan budget. For the example pilot budget `{iterations:32,maxPlies:4,maxDecisionMs:250,seed:9}`, the time limit is currently unused, and an over-budget iteration/depth result would still pass if the four certification booleans and envelope string were set.

Add a pilot-specific hard ceiling at the trusted capability boundary and require actual usage evidence from the capability (iterations, max observed depth, elapsed time, seed) to be within the frozen values. The adapter/search loop should enforce the deadline; the wrapper should reject an over-budget audit.

**Regression:** certified search result with iterations above budget, maxPlies above budget, elapsedMs above maxDecisionMs, or mismatched seed must abstain. Also reject a policy option budget beyond the pilot's hard ceiling before constructing the capability.

## Integration status

Current main's `agent36-v3-runner.cjs` has zero references to `rootIntentProvider`, `createRootSearchCapability`, or the Agent5 information-set MCTS adapter. The current Agent5 adapter also does not produce the four required certification fields. Agent50's separate audit already identified two specific reasons: its prompt resolver passes full determinized State to the policy resolver, and its information-set key omits the full acting-owner knowledge ledger (known top/bottom deck and order, K1 Prize membership, and K0/PARTIAL state). See [Agent50's MCTS boundary audit](agent50-information-set-mcts-boundary-audit-20261113.md) and the [full-ledger key follow-up](../../communications/agent43/20261113T031531450Z_agent50_mcts-full-ledger-key-followup.md).

Until the prompt resolver is actor-scoped, the same verified full owner ledger feeds both observation and determinization, the full action frontier is demonstrated for the declared envelope, and the runner wires the protected capability, the seam should continue to abstain. A one-Flittle/59-Psychic-Energy test fixture is infrastructure validation only, not a competitive deck or a representative Expanded policy.

## Actions taken

- Sent the envelope and budget findings, with exact regression cases, to Agent50 and Agent36.
- Made no code changes to Agent34, Agent44, Agent5 or Agent36.
- Did not execute Node tests or a native pilot. This review is static; no competitive result is claimed.

**Confidence:** high for the two wrapper-level gaps and current missing runner integration; no claim about native search performance.

## 13 November 2026 06:19 UTC follow-up — Agent43 root-boundary hardening

Reviewed current main after Agent43's 05:32 broadcast and commits `544ec3e947ad2c723a188142d759807f52a735e7` / `f00eeb5d6b3a69e61a413f32f2c9bb07dff4e4e1`.

### Resolved at the Agent34 boundary

The earlier wrapper-level budget gap is materially closed. Current `invokeActorRootIntentProvider()` freezes the registered budget and requires the core audit's iterations, completed iterations, max plies, max decision time, seed, timeout status, and monotonic `elapsedMs` to match it. This is stronger than the previous wrapper, which only checked shape. Do not repeat the old statement that the wrapper never compares actual budget usage.

The current Agent36 Flittle provider still has separate integration blockers reported by Agent43: missing required adapter dependencies and a custom `actionKey` that disagrees with the adapter's default `expectedActionKeys`. The provider is not yet a native Store decision and the V3 runner is still not wired.

### Remaining audit gap: selected intent is not bound to selectedActionKey

Current `invokeActorRootIntentProvider()` (around lines 1095–1144) sanitizes and returns `searchResult.intent`, but does not require `evidence.selectedActionKey` or prove that it identifies the same action. It copies `selectedActionKey` into the emitted audit only when the value happens to be a string; otherwise the boundary still returns `status:'selected'`.

The existing positive case in `tests/agent34-actor-only-root-policy.test.cjs` (around lines 56–73) returns a selected `{kind:'pass'}` intent and a rollout whose actions are `PASS_TURN`, omits `selectedActionKey`, and is accepted. A core/adapter mapping defect could therefore dispatch a different typed intent from the action identified by the search's selected root without the generic boundary detecting it.

**Required correction:** require a nonempty canonical selected action key and bind it to the sanitized intent using the adapter's canonical action-key mapping (or carry a digest-bound action-key/intent pair from the core). Add missing-key, mismatched-key/intent, and positive matching regressions. This is a boundary-consistency gap, not evidence that the current Flittle provider actually misselects.

Direct handoff: `communications/agent43/20261113T061900383Z_agent49_root-search-intent-audit-binding.md`, commit `c4d3461cb4985c00e6768c26d0b7de42f4acbc43`.

### Applicability registration remains open

The earlier unregistered-envelope concern also remains in the current code: the boundary accepts any regex-valid `applicabilityEnvelopeId` and applies the Flittle-specific action restriction only to the exact Flittle ID. The first pilot itself supplies a fixed ID and has its own envelope assertions, but the generic boundary has no trusted registration/allowlist. Keep the prior regression recommendation for an unknown, fully certified envelope with an otherwise permitted intent.

No native MCTS decision, full game, matchup, or competitive result was produced.

## 13 November 2026 06:30 UTC — independent review of Agent50's provider repair

Agent50's updated provider is now present on main (provider blob `00a35d0144c114797ac02c9c3e6110923208ff72`; registered-list change commit `5d5d439fab3a5437bd2020aea30d5af564440bd8`; pure contract test commit `f4ff27572511ae34cf59756506d5c5d1903540e2`). The earlier provider-specific missing constructors, canonical action-key dependency, 10-second budget, and root predicate reuse were repaired. The provider now supplies the pinned WaitPrompt/ResolvePromptAction/GameError/action bindings, the adapter's canonical Flittle action-key functions, a 16-iteration/1-ply/250ms fixed budget, and separate root/successor envelopes. The provider-specific adapter also requires the exact registered Flittle envelope ID. The one-ply cap remains appropriate in light of Agent5's root-determinization strategy-fusion counterexample.

The root/successor state-family checks are internally consistent for the declared one-ply smoke: root requires one Psychic on each active Flittle and zero damage; the successor envelope allows two Energy only on the still-active just-attaching seat, and after Ram/Pass expects the next active seat with one Energy after WaitPrompt resolution. The public projection checks correctly compare the PokemonCardList stack projection (`evolutionPrintings`, including attached Energy) with the energy-only projection (`energies`). The `PlayerType.BOTTOM_PLAYER` target is relative to the acting player in Twinleaf, so it is correct for both physical seats.

### Remaining runner contract: the live Store must be built from the registered lists

The provider validates that the supplied candidate and opponent decklist objects are exactly one Flittle + 59 Psychic Energy. However, the live Twinleaf `state` is not independently tied to those registered list IDs. `knowledgeBySeat()` assumes every Prize is Psychic from the fixture composition, while the determinization input intentionally does not inspect concealed opponent identities. This is sound only if the runner constructs the actual native Store from the exact same two registered 60-card lists and passes those same IDs into the runtime. A correct metadata list paired with a Store built from a different hidden deck would make the K1 Prize assertion and opponent prior false.

Before native acceptance, the runner must bind Store construction to these exact list IDs/digests (or perform a trusted state-composition preflight before exposing only the actor view) and record the binding in the receipt. Add a negative mismatched-Store/list regression. Agent50 was sent this requirement in `communications/agent50/20261113T063046010Z_agent49_independent-flittle-provider-review.md`, commit `01c9448a8156bd38cc2a764ca05bb29d79151982`.

### Selected-action audit binding remains open

The provider maps `selected.action` to a neutral intent but does not assert that `selected.audit.selectedActionKey` names that same action. The generic Agent34 boundary does not require the key at all; its positive stub test omits it and still returns selected. Require a nonempty canonical key and bind it to the mapped intent in the provider and/or trusted boundary; add missing-key and mismatch regressions. Agent43 was sent the generic-boundary finding in `communications/agent43/20261113T061900383Z_agent49_root-search-intent-audit-binding.md`.

### Evidence boundary

The provider's current tests are pure/synthetic; they do not instantiate the pinned native Store or prove the real PokemonCardList projection. The provider remains unintegrated with the V3 runner. No native MCTS decision, Store acceptance, full game, matchup, or competitive result has been demonstrated. Do not widen beyond one ply; Agent5's 06:15 root-determinization strategy-fusion counterexample blocks using the current PUCT opponent nodes as a competent multi-ply model.


## 13 November 2026 09:02 UTC — selected-action binding and native smoke update

The two earlier open findings above are now superseded by subsequent work:

- **Selected-action audit binding is closed in Agent43's Agent34 update.** The boundary now requires a nonempty `selectedActionKey`, sanitizes and compares the capability intent with the provider intent, and calls the protected adapter `rootIntentActionKey` to require an exact key round-trip. The Agent36 Flittle provider derives the key from the actual selected native action, maps that same action to a bounded Attach/Ram/Pass intent, and supplies the inverse adapter mapping. Current tests cover missing key, mismatched key, mismatched provider/capability intent, positive Pass, and Flittle Attach/Ram/Pass mapping. Agent49 reviewed the round-trip and found no key-format or intent-mapping mismatch; see `communications/agent43/20261113T0834Z_agent49_root-action-binding-review.md` and the follow-up native smoke review.
- **The native Store/registered-list binding is now represented by an actual native smoke harness.** Agent42 added `tests/2026-11/agent42-flittle-mcts-native-store-smoke.test.cjs` and the isolated manual input `agent42_flittle_mcts_native_smoke` in `.github/workflows/agent36-bilateral-competence-v9.yml`. The test creates the pinned native Store from the registered one-Flittle/59-Psychic lists, runs the trusted physical-card/decklist receipt against that live Store, wires the Agent34 wrapper and Agent36 root provider, and exercises both physical seats plus an opponent-Ram/out-of-envelope fallback. Agent43's latest corrections require exact `handIndex` equality between native action and typed intent and assert the frozen pilot seed.
- This native test uses the real Store and ActionEnumerator, so its exact Flittle root-frontier assertion will also resolve the multi-copy Psychic Energy question raised by Agent49: it will fail if the native enumerator produces more attach actions than the provider's first-hand-index frontier. No extra mock test/workflow is needed. The workflow is manual and isolated; the current README and owner communications report that it has **not yet been dispatched**. Agent49 cannot dispatch with the available GitHub API surface. Owner dispatch is the remaining step.
- The native smoke, once run, is only a one-root Store-dispatch/intent-binding test. It is not a complete game, not a full V3 runner integration, and not matchup or competitive evidence. Until a successful run is preserved, do not claim native selection or Store acceptance. The V3 runner remains a separate integration gap.

The previous sections documenting the missing generic action-key check and missing Store binding are historical context, not current status. The separate generic applicability-envelope registration concern remains open for future review; the current Flittle-specific provider itself checks its exact envelope ID.
