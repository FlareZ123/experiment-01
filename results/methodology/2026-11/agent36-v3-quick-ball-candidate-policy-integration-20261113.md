# Agent36 V3 candidate-only Quick Ball policy integration

**Status:** candidate-only Quick Ball root and source-bound continuation integrated as V3 policy v17; native rerun is blocked by the owner-controlled diagnostic-key prerequisite. The exact target-to-Bench follow-through is still being added to the shared continuation helper. No game-performance result is claimed.

## Correct opening-hand diagnosis

The paper rulebook's setup sequence (page 15) flips the coin before shuffling. The exact pinned Twinleaf setup reducer at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` does the same: `CoinFlipPrompt`, then the `GO_FIRST` prompt when applicable, then the two seat-ordered `ShuffleDeckPrompt`s ([pinned setup reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/setup-reducer.ts)). The fixture runner consumes the physical RNG for the coin flip before the two deck permutations.

Agent49's reproducible offset-1 reconstruction is therefore the supported opening-hand result; Agent36's earlier offset-0 Fog Crystal inference was wrong and has been superseded. The candidate's exact post-setup hand is:

| Card | Count | Source printing | Engine printing |
|---|---:|---|---|
| Psychic Energy | 3 | MEE 13 | SVE 5 |
| Arven | 1 | SVI 166 | SVI 166 |
| Quick Ball | 1 | FST 237 | FST 237 |
| Shadow Rider Calyrex V | 1 | CRE 74 | CRE 74 |
| Float Stone | 1 | BKT 137 | BKT 137 |

Shadow Rider Calyrex V is the only Basic and becomes Active; five Bench slots are open. The first native fixture's candidate did not Bench or search, instead attaching Psychic Energy and using Shadow Mist. The missing first-turn line is Quick Ball, not Fog Crystal. Full reproduction and assumptions are documented in [Agent49's opening-hand report](agent49-v3-fixture-opening-hand-reconstruction-20261113.md).

## Policy v17

The V3 runner now enables `quickBallRoot: true` **only for candidate seat 0**. The rank-1 opponent retains its prior Agent34/SimpleTacticsAi policy unchanged. The existing `agent49-owner-quick-ball-prompt-continuation.cjs` is installed inside the run callback passed to `withCandidateOpponentPolicyRoles`, making it the outermost decoder wrapper for the native game while remaining eligible only for seat 0.

The policy identity is:
- Policy version: `agent34-actor-only-root-slice-v17-agent49-quick-ball-source-bound-v1`
- Trial ID: `agent36-v3-fixture-hood-rank1-20261113-quick-ball-v1`
- Candidate producer: `agent36-fixture-candidate-agent34-agent49-quick-ball-v1`
- Opponent producer: `agent36-fixture-rank1-opponent-agent34-baseline`

The original deterministic seed, candidate printed-60, rank-1 printed-60, deck hashes, and pinned Twinleaf commit are unchanged for a paired policy comparison. The V3 prompt chain, common bindings and challenge-suite test paths now include the Quick Ball continuation module and its unit test. The Fog Crystal wrapper and its Fog-only GameMessage binding have been removed from the active runner.

Relevant implementation:
- [V3 runner](../../../simulation/evaluation/2026-11/agent36-v3-runner.cjs)
- [V3 fixture integration test](../../../tests/2026-11/agent36-v3-fixture-game.test.cjs)
- [Agent49 Quick Ball continuation](../../../simulation/twinleaf/2026-11/agent49-owner-quick-ball-prompt-continuation.cjs)
- [Quick Ball continuation tests](../../../tests/2026-11/agent49-owner-quick-ball-prompt-continuation.test.cjs)
- [Agent49 opening-hand reconstruction](agent49-v3-fixture-opening-hand-reconstruction-20261113.md)
- [Agent5 search-prompt contract](agent5-v3-search-prompt-contract-20261113.md)

## Physical evidence boundary: retrieval is not Bench completion

The existing continuation v1 binds the exact physical Quick Ball Card, a specific physical duplicate donor from the candidate's own hand, the owner-scoped mandatory discard prompt, and the authenticated owner-deck search prompt. It invokes the native validator and checks that the exact payment object reaches discard and the exact selected Basic object leaves the deck and reaches hand.

However, v1's `completedPhysicalChains` currently counts the cost-plus-search retrieval chain ending in hand. It does **not** establish that the same selected Card object subsequently reaches the candidate's Bench. The public summary therefore labels this as `quickBallCompletedSearchChains`; Bench-placement and completed-setup counters remain `null` until the continuation helper adds the physical follow-through. It would be incorrect to count retrieval to hand as a completed setup line.

Agent48 identified the correct end-to-end condition: exact Shadow Rider Calyrex V selected from the candidate's owner deck → the same object enters the candidate's hand → that same object is accepted by native Store and reaches the candidate's Bench. The helper should retain `selectedCard` in the pending plan after the search reply, observe subsequent native Store transitions, and report retrieval and Bench completion separately. Agent49 has been asked whether this narrow extension is already in progress; avoid duplicating their work if so.

## Execution gate and limitations

The only encrypted fixture dispatch so far, [run 43492137408](https://github.com/FlareZ123/experiment-01/actions/runs/43492137408), failed before Twinleaf compilation because repository Actions variable `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` was empty. No game ran and no artifact was uploaded. Do not redispatch until the repository owner configures the RSA public-key variable; keep the matching private key offline.

Consequently:
- policy v17 has not been executed;
- the Quick Ball root, payment and search have not been accepted by native Store in this V3 fixture;
- the target-to-Bench follow-through is not yet instrumented in the shared helper;
- no board-survival, match outcome, matchup win rate, deck legality or 99.5% claim follows;
- no card or deck-list change has been made.

## Next actions

1. Complete or coordinate the Quick Ball helper's exact selected-card-to-Bench follow-through audit and regression. Keep search retrieval and setup completion as separate counters.
2. Run the targeted helper/V3 integration tests in the pinned build.
3. Obtain the owner-controlled public key and rerun the same seed with candidate-only Quick Ball root enabled and opponent policy unchanged.
4. Inspect exact Quick Ball source binding, exact donor acceptance, exact selected target retrieval, exact same-object Bench placement, pending Bench placements at end, actor-only boundary, and full game result before making any further policy or card changes.
