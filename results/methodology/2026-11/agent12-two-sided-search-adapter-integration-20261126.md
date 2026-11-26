# Agent12 two-sided MCTS / Twinleaf adapter integration

**Status:** The two-sided adapter and the combined real Quick Ball-through-MCTS test are implemented. Combined test code/test commit `29e09c79ca6cf080705970cc3dbeeb8e9cf33e60` is included in reconciled PR head `634469c6a2bbd7af517458caa94d8eda08759b0e`; exact-head native-only run `45792988401` is in progress. Earlier code/test SHA `47dffab1689d02418a206c812db0f8ffaa907c54` passed run `45789806753` before the combined fixture. Reconciliation commit `634469c6a2bbd7af517458caa94d8eda08759b0e` is based on main `8593960`, includes the updated Agent12 memory and latest main board, and preserves main's active leases; a final latest-main refresh will be done before PR merge.

## Purpose

Integrate the existing general-sum information-set MCTS core with Twinleaf's native prompt and actor-relative history machinery without modifying the upstream submodule. This is an executable search-adapter milestone, not a deck-strength result.

## Integrated behavior

### General-sum search and per-search randomness

- The Agent5 information-set MCTS core is used as a two-sided general-sum search engine, with the active seat's own-win probability as the value convention.
- Opponent-policy randomness is derived from the root search seed and a monotonically increasing search ordinal. Consecutive searches on one core receive distinct streams; a fresh core replaying the same call sequence reproduces the same draws.
- The regression is in `tests/2026-11/agent5-information-set-search.test.cjs`. The earlier undefined/base-seed defect observed on superseded PR head `fd7191e` is fixed.
- This establishes deterministic stream derivation, not opponent-policy competence or calibrated playing strength.

### Actor-relative history and root-prefix integrity

- Actor-safe prompt events distinguish the transition actor from the prompt owner.
- Per-seat own-decision history is transferred across redeterminization, and root-history attestation binds the supplied prefix to the actual root State and canonical per-seat prefix digest.
- Root-prefix validation now requires nested `actorObservation.actorSeat` to equal the physical-seat bucket for both native-action and player-prompt events.
- Nested `actorHistorySha256`, `actorVisibleHistory`, and `actorOwnDecisionHistory` are rejected inside `actorObservation`; these are separately represented by the event contract.
- Player-prompt root prefixes require `promptProjection.actingSeat` to equal the physical seat.
- Negative regressions cover both event kinds, all three nested history fields, and a mismatched prompt projection seat in `tests/2026-11/agent12-twinleaf-two-sided-search.test.cjs`.

### Native prompt settlement and RNG scopes

There are three distinct RNG domains:

1. **Prompt-policy RNG** selects the player's prompt decision.
2. **Cloned-Store validation RNG** validates the raw prompt result without consuming the live rollout stream.
3. **Rollout transition RNG** governs live game transitions and automatic/host-only prompt resolution.

The adapter now passes a `withDispatchRandom` capability from `settlePendingPrompts` through `resolvePlayerPrompt` to `dispatchPromptChoice`. It wraps only the final live `ResolvePromptAction` Store dispatch in the transition RNG; validation remains under its isolated scope and prompt-policy selection retains its own stream. The prompt decision protocol identifier is bumped to v3.

Important qualification from Agent3's review: the pinned Quick Ball player-prompt dispatch itself does not consume ambient randomness. It creates a separate automatic `ShuffleDeckPrompt`, which the adapter resolves under the transition RNG. The live-dispatch wrapper is defense in depth for any direct randomness in future prompt continuations, not evidence of a confirmed Quick Ball RNG leak.

Tests:
- `tests/2026-11/agent36-prompt-projection.test.cjs` proves cloned validation sees its isolated RNG, the final live dispatch sees the supplied transition RNG, and ambient `Math.random` is restored.
- `tests/2026-11/agent12-twinleaf-two-sided-search.test.cjs` proves the MCTS adapter's player-prompt dispatch and a subsequent automatic prompt use deterministic transition-stream draws distinct from prompt-policy and ambient streams. Agent44 added a combined real Quick Ball-through-MCTS fixture: Quick Ball is the root action, the player-owned `ChooseCardsPrompt` resolves on the registering Store, the automatic `ShuffleDeckPrompt` resolves before the next observation, and the test checks the stable successor, ambient-RNG sentinel, and prompt audit/history receipts.
- `tests/2026-11/agent14-native-store-prompt-continuation.test.cjs` independently drives a real pinned Twinleaf Quick Ball `ChooseCardsPrompt` through the same Store with ambient `Math.random` set to a throwing sentinel during cloned validation and live dispatch. It verifies the live dispatch does not consume ambient RNG and the effect creates a separate `ShuffleDeckPrompt`.

The three test layers are deliberately not described as one combined real Quick Ball-through-MCTS fixture. Agent44 was asked to add that single combined integration test after the green run; if it lands, it requires a new exact-head CI receipt.

## Validation and reproduction

- Workflow: `.github/workflows/agent5-owner-root-native.yml`
- Invocation: manual dispatch with `native_search_only=true`; no game dispatch.
- Pinned Twinleaf revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Previous tested code/test/workflow SHA: `47dffab1689d02418a206c812db0f8ffaa907c54`; exact-head run [45789806753](https://github.com/FlareZ123/experiment-01/actions/runs/45789806753) passed with 39 successful steps, 56 intentionally skipped, zero failed, before the combined fixture was added.
- Combined-test code/test commit: `29e09c79ca6cf080705970cc3dbeeb8e9cf33e60`; exact reconciled head: `634469c6a2bbd7af517458caa94d8eda08759b0e`; native-only run [45792988401](https://github.com/FlareZ123/experiment-01/actions/runs/45792988401) is in progress. Do not transfer the previous green receipt to the combined fixture.
- Reconciliation commit `634469c` is based on main `8593960`, includes the updated Agent12 memory and latest main decision board, and preserves that main revision's active Agent6 and Agent12 leases. Main may advance with additional communications while CI runs; refresh from the latest main tree before PR merge, preserving all non-Agent12 lease/memory files.
- Previous exact-head receipts: `45788911615` passed on `4b2fc48` before the Quick Ball sentinel and final workflow-list addition; `45787848481` passed on `a7a2db8` before the live prompt-dispatch RNG correction. Run `45789476429` was cancelled when the final workflow revision was dispatched and is not evidence.
- The narrower PR #81 opponent-policy RNG fix passed `45785244678` on `a3f091f`; it is not substituted for the PR #78 exact-head receipt.

The existing workflow's MCTS contract step now syntax-checks and runs `simulation/evaluation/2026-11/agent36-prompt-projection.cjs` and `tests/2026-11/agent36-prompt-projection.test.cjs`. No new workflow was created and no upstream Twinleaf files were changed.

## Reusable K0/K1 determinization work

The hidden-partition sampler is not absent. Existing Agent5 research code includes:

- `simulation/twinleaf/2026-11/agent5-hidden-partition-sampler.cjs`
- `simulation/twinleaf/2026-11/agent5-twinleaf-belief-input.cjs`, exporting `createTwinleafDeterminizationSampler` and its `.metadataByState`, `.knowledgeBySeat`, and `.refreshMetadata` hooks
- `simulation/twinleaf/2026-11/agent5-twinleaf-mcts-adapter.cjs`
- `tests/2026-11/agent5-twinleaf-belief-search.test.cjs` and `tests/2026-11/agent5-hidden-partition-search.test.cjs`

The sampler implements K0/K1/PARTIAL hidden partition logic, exact and partial prize knowledge, known deck-top/bottom constraints, and per-seat knowledge ledgers. The Agent5 adapter uses it under a Flittle-only applicability envelope, with unit-fixture tests. Agent12's `redeterminize` callback and metadata/knowledge hooks are structurally compatible with `createTwinleafDeterminizationSampler`: the sampler's call signature is `(state, actorSeat, random, actorObservation)`, matching the two-sided adapter's `redeterminize(state, seat, random, actorView, deadline)` call (the extra deadline argument is ignored by JavaScript); it also exposes the exact `.metadataByState`, `.knowledgeBySeat`, and `.refreshMetadata` hooks the adapter reads. A minimal composition therefore sets `redeterminize` to the returned sampler function and, if `knowledgeBySeat` is supplied separately, uses that exact same function object. The unproven part is not the callback shape but the live composition of actor observations, authenticated root/belief/seat knowledge, rank-specific decklist priors, clone-state, and card reconstruction for Expanded states. Do not reimplement the sampler; wire these existing dependencies into the two-sided adapter and validate the real state contract.

## Limitations

- No complete game was played or dispatched.
- No deck was selected or qualified; no Aichi Top 32 matchup was evaluated and no win-rate estimate exists.
- The MCTS core still receives its determinization, legal-action frontier, terminal adjudicator, and leaf evaluator as caller-supplied dependencies. The passing tests do not establish complete Expanded legal-action coverage, paper-rules terminal correctness, production K1 integration, or calibrated cPuct/leaf values.
- The current native prompt tests establish adapter and Store contracts; they do not demonstrate competitive policy quality.
- The 99.5% target remains aspirational and unsupported by evidence.

## Next actions

1. Complete exact-head native-only run `45792988401` on the combined Quick Ball-through-MCTS test. If it passes, obtain final exact-head review and merge PR #78; if it fails, inspect only the failing source/test and rerun the corrected exact head.
2. After final exact-head review, merge PR #78. Before merge, reconcile against the latest main tree, preserving all active leases and memories; take the current main `results/README.md` as base and update only its MCTS status.
3. Integrate the existing K0/K1 sampler with the two-sided adapter using the correct actor observation, per-seat knowledge, decklist priors, clone-state and card-reconstruction dependencies. Verify on real pinned Twinleaf states before claiming Expanded readiness.
4. Continue policy readiness with one frozen candidate policy and independently specified rank-specific opponent policies; missing ranks must remain explicit.
5. V3 complete-game dispatch remains blocked until the owner explicitly authorizes the unchanged registered Hood Shield v1 vs original Aichi rank-1 two-game physical-seat-swap pair and configures `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM`. Stage-A issue #72 is separate and neither A/B outcome authorizes V3. No game should be dispatched before that gate.

No claim of a 99.5% win rate is made.
