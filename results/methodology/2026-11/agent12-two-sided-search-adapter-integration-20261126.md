# Agent12 two-sided MCTS / Twinleaf adapter integration

**Status:** Native adapter contract accepted at code/test SHA `47dffab1689d02418a206c812db0f8ffaa907c54`; exact-head native-only workflow run `45789806753` passed. Reconciliation commit `f25a2c2101e12064cac235b97a737fa93da609c1` is based on main `71fca62` and preserves its active Agent6 lease and decision board; subsequent PR-branch commits update Agent12 memory, this report, and the decision board only. A combined real Quick Ball-through-MCTS test is still under focused review with Agent44; current evidence keeps the real Quick Ball continuation and the MCTS transition-RNG path as separate tests.

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
- `tests/2026-11/agent12-twinleaf-two-sided-search.test.cjs` proves the MCTS adapter's player-prompt dispatch and a subsequent automatic prompt use deterministic transition-stream draws distinct from prompt-policy and ambient streams.
- `tests/2026-11/agent14-native-store-prompt-continuation.test.cjs` drives a real pinned Twinleaf Quick Ball `ChooseCardsPrompt` through the same Store with ambient `Math.random` set to a throwing sentinel during cloned validation and live dispatch. It verifies the live dispatch does not consume ambient RNG and the effect creates a separate `ShuffleDeckPrompt`.

The three test layers are deliberately not described as one combined real Quick Ball-through-MCTS fixture. Agent44 was asked to add that single combined integration test after the green run; if it lands, it requires a new exact-head CI receipt.

## Validation and reproduction

- Workflow: `.github/workflows/agent5-owner-root-native.yml`
- Invocation: manual dispatch with `native_search_only=true`; no game dispatch.
- Pinned Twinleaf revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Tested code/test/workflow SHA: `47dffab1689d02418a206c812db0f8ffaa907c54`.
- Exact-head run: [45789806753](https://github.com/FlareZ123/experiment-01/actions/runs/45789806753).
- Outcome: 39 successful steps, 56 intentionally skipped by the native-search-only path, 0 failed, 0 pending. The run includes the prompt-projection regression, Quick Ball same-Store test, and two-sided MCTS prompt-settlement tests.
- Reconciliation commit `f25a2c2` is a metadata-only merge of main `71fca62` plus the tested PR files. It preserves that main revision's active Agent6 lease, current Agent12 lease, and current `results/README.md`; subsequent branch commits update only Agent12 memory, this methodology report, and the decision board. The tested code/test/workflow blobs are unchanged. Before final PR merge, reconcile any later main-only lease/communication changes again.
- Previous exact-head receipts: `45788911615` passed on `4b2fc48` before the Quick Ball sentinel and final workflow-list addition; `45787848481` passed on `a7a2db8` before the live prompt-dispatch RNG correction. Run `45789476429` was cancelled when the final workflow revision was dispatched and is not evidence.
- The narrower PR #81 opponent-policy RNG fix passed `45785244678` on `a3f091f`; it is not substituted for the PR #78 exact-head receipt.

The existing workflow's MCTS contract step now syntax-checks and runs `simulation/evaluation/2026-11/agent36-prompt-projection.cjs` and `tests/2026-11/agent36-prompt-projection.test.cjs`. No new workflow was created and no upstream Twinleaf files were changed.

## Reusable K0/K1 determinization work

The hidden-partition sampler is not absent. Existing Agent5 research code includes:

- `simulation/twinleaf/2026-11/agent5-hidden-partition-sampler.cjs`
- `simulation/twinleaf/2026-11/agent5-twinleaf-belief-input.cjs`, exporting `createTwinleafDeterminizationSampler` and its `.metadataByState`, `.knowledgeBySeat`, and `.refreshMetadata` hooks
- `simulation/twinleaf/2026-11/agent5-twinleaf-mcts-adapter.cjs`
- `tests/2026-11/agent5-twinleaf-belief-search.test.cjs` and `tests/2026-11/agent5-hidden-partition-search.test.cjs`

The sampler implements K0/K1/PARTIAL hidden partition logic, exact and partial prize knowledge, known deck-top/bottom constraints, and per-seat knowledge ledgers. The Agent5 adapter uses it under a Flittle-only applicability envelope, with unit-fixture tests. Agent12's `redeterminize` callback and metadata/knowledge hooks appear structurally compatible with `createTwinleafDeterminizationSampler`, but live actor-observation/decklist-prior composition and actual Expanded Twinleaf state validation are not established. Do not reimplement the sampler; wire its existing observation, knowledge, decklist-prior, clone-state, and card-reconstruction dependencies into the two-sided adapter and validate the real state contract.

## Limitations

- No complete game was played or dispatched.
- No deck was selected or qualified; no Aichi Top 32 matchup was evaluated and no win-rate estimate exists.
- The MCTS core still receives its determinization, legal-action frontier, terminal adjudicator, and leaf evaluator as caller-supplied dependencies. The passing tests do not establish complete Expanded legal-action coverage, paper-rules terminal correctness, production K1 integration, or calibrated cPuct/leaf values.
- The current native prompt tests establish adapter and Store contracts; they do not demonstrate competitive policy quality.
- The 99.5% target remains aspirational and unsupported by evidence.

## Next actions

1. Complete or explicitly defer Agent44's combined real Quick Ball-through-MCTS fixture. If source/test/workflow changes, rerun the existing native-search-only workflow on that exact head.
2. After final exact-head review, merge PR #78. Before merge, reconcile against the latest main tree, preserving all active leases and memories; take the current main `results/README.md` as base and update only its MCTS status.
3. Integrate the existing K0/K1 sampler with the two-sided adapter using the correct actor observation, per-seat knowledge, decklist priors, clone-state and card-reconstruction dependencies. Verify on real pinned Twinleaf states before claiming Expanded readiness.
4. Continue policy readiness with one frozen candidate policy and independently specified rank-specific opponent policies; missing ranks must remain explicit.
5. V3 complete-game dispatch remains blocked until the owner explicitly authorizes the unchanged registered Hood Shield v1 vs original Aichi rank-1 two-game physical-seat-swap pair and configures `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM`. Stage-A issue #72 is separate and neither A/B outcome authorizes V3. No game should be dispatched before that gate.

No claim of a 99.5% win rate is made.
