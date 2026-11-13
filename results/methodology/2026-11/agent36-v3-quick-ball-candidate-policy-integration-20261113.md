# Agent36 V3 candidate-only Quick Ball policy integration

**Status:** candidate-only Quick Ball root and source-bound continuation are integrated as V3 policy v17. Agent50 has added exact selected-object-to-Bench follow-through and separate completed-setup accounting to the shared helper, with positive and same-printing/different-object negative regression coverage. The existing Agent36 contract-only lane ran as [43508487195](https://github.com/FlareZ123/experiment-01/actions/runs/43508487195) and failed before native compilation: three Quick Ball helper test assertions need correction, plus 23 unrelated Agent44/Agent34/Agent45 suite failures. Native rerun remains blocked by the owner-controlled diagnostic-key prerequisite. No game-performance result is claimed.

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

The root-intent preconditions are also supported by the pinned observation and candidate sources. The fixed candidate JSON contains four Shadow Rider Calyrex V CRE 74 and one Quick Ball FST 237. Twinleaf setup creates five empty `PokemonCardList` Bench slots; the actor observation maps each empty slot to `null`, so the Quick Ball root's open-Bench check is satisfied. The reconstructed hand has three Psychic Energy copies, satisfying the root's requirement for a duplicated non-Quick-Ball donor; the observation exposes the nonempty deck count and Item/Pokémon lock flags. The continuation's default search priority begins with Shadow Rider Calyrex V CRE, and selection is restricted to cards actually offered by the live owner-deck prompt. This establishes source-level eligibility for the reconstructed hand, not an executed native action.

One policy tradeoff remains untested: v17 enables `quickBallRoot` without `quickBallPayableAttackPriority`, so the root is evaluated before the printed-attack branch. The optional flag can make a payable attack take precedence. Leave the current ordering unchanged until the first native trace shows whether setup-first priority is appropriate for this candidate.

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

## Physical evidence boundary: retrieval and setup completion are separate

The helper binds the exact physical Quick Ball Card, a specific physical duplicate donor from the candidate's own hand, the owner-scoped mandatory discard prompt, and the authenticated owner-deck search prompt. It invokes the native validator and checks that the exact payment object reaches discard and the exact selected Basic object leaves the deck and reaches hand.

The implementation now distinguishes three stages:
- `completedPhysicalChains` counts the cost-plus-search retrieval chain; it does not mean the target reached Bench.
- `targetPhysicalBenchPlacements`, `targetPhysicalBenchPlacementFailures`, and `pendingBenchPlacementsAtEnd` report the subsequent same-object Bench transition.
- `completedSetupChains` increments only when physical cost settlement, exact target retrieval, same-object Bench placement, and Quick Ball item finalization have all occurred.

Agent50 added the follow-through in [helper commit a1cd4c3](https://github.com/FlareZ123/experiment-01/commit/a1cd4c380d8b1ef3a7d5781fa0f60fc2d18162b3) and added a positive end-to-end unit case plus a negative same-printing/different-physical-object case in [test commit a60e4f5](https://github.com/FlareZ123/experiment-01/commit/a60e4f5972b3d682e81a21346ee9478af0a8e35d). The pinned Twinleaf source supports the identity test: the PlayCard reducer passes the actual hand-card object into `PlayPokemonEffect`; the Basic-Pokémon reducer moves that same object from hand to the target `PokemonCardList` using `CardList.moveCardTo`; and `PokemonCardList.getPokemonCard()` returns the stored object. This is source-level support for the observer, not native-run evidence.

The existing Agent36 `contract_only=true` lane includes the helper test and avoids compiling Twinleaf or executing a game. [Run 43508487195](https://github.com/FlareZ123/experiment-01/actions/runs/43508487195) executed 369 tests (342 pass, 26 fail, 1 skip). The three Quick Ball helper failures are localized test defects: the positive case contradicts its earlier assertion that the selected target left hand; the same-printing negative case references `samePrintingCopy` outside its callback scope; and the source-binding negative case expects zero even though the helper correctly increments `sourceCardBindingFailures` for the deliberate mismatch. The other 23 failures are in unrelated Agent44 V3 bundle, Agent34 policy-composition and Agent45 adapter-version tests. Agent50 has been sent the exact failures for correction. The Quick Ball helper suite is not yet green, and no native Twinleaf compile or game occurred. It remains incorrect to count retrieval to hand alone as a completed setup line.

## Execution gate and limitations

The only encrypted fixture dispatch so far, [run 43492137408](https://github.com/FlareZ123/experiment-01/actions/runs/43492137408), failed before Twinleaf compilation because repository Actions variable `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` was empty. No game ran and no artifact was uploaded. Do not redispatch until the repository owner configures the RSA public-key variable; keep the matching private key offline.

Consequently:
- policy v17 has not been executed;
- the Quick Ball root, payment and search have not been accepted by native Store in this V3 fixture;
- the target-to-Bench follow-through is not yet instrumented in the shared helper;
- no board-survival, match outcome, matchup win rate, deck legality or 99.5% claim follows;
- no card or deck-list change has been made.

## Next actions

1. After Agent50 corrects the three Quick Ball helper test defects identified by run 43508487195, rerun the same existing `contract_only=true` lane and confirm the helper tests pass; do not add a workflow or change unrelated Agent44/Agent34/Agent45 tests under this task.
2. After pure validation passes and the owner configures the public RSA key, use the existing encrypted fixture workflow with only `agent36_v3_fixture_game=true`; do not bypass the key gate or upload plaintext hidden zones.
3. Inspect exact Quick Ball source binding, exact donor acceptance, exact target retrieval, same-object Bench placement, item finalization, pending counters, actor-only boundary, and full game result before making any further policy or card changes.
