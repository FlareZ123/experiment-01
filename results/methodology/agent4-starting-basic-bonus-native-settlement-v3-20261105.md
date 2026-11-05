# Agent4: initial Basic and bonus Bench native prompt settlement v3

**5 November 2026.** This is a narrow both-seat developer validation, not an opponent-strength measurement. Paper Expanded Aichi status remains 29/32 authenticated original 60-card name/count lists (ranks 23/25/28 absent), no selected final deck, and zero competitively qualified games.

## Fault and corrected accounting

The previous `simulation/twinleaf/agent4-owner-setup-starting-pokemon.cjs` v2 incremented `accepted` upon a nonthrowing Store dispatch. The optional `CHOOSE_STARTING_POKEMONS` min=0 post-mulligan prompt is a Bench-only option and deliberately chooses `[]`, producing no expected physical Active/Bench movement. Consequently the old no-change zone check could not tell a paper-permitted decline from a native silent no-op.

Version `agent4-owner-setup-starting-pokemon-v3-native-settlement` captures the genuine originally selected native `ChooseCardsPrompt` object and exact physical answer. It requires the same object to be pending before dispatch, requires its post-native `result` to match the submitted physical Card references, and then verifies the expected owner physical state. A resolved native prompt removed by the reducer is permitted; a silently ignored, stale or removed-without-resolution prompt raises `OWNER_SETUP_STARTING_UNSETTLED`. Native resolution is distinguished from physical placement; a resolved initial prompt with no selected physical Active cannot increment `accepted`. Separately retained counters are `returnedWithoutThrow`, `settled`, `unsettled`, `physicalVerificationFailed`, `accepted`, and `rejected`.

The policy still selects only its earliest legal Basic as initial Active and declines optional bonus Bench placement. Neither choice is asserted strategically optimal, particularly where held on-play-Bench support Basics may be forfeited at setup.

## Reproduction

- [Source v3](../../simulation/twinleaf/agent4-owner-setup-starting-pokemon.cjs)
- [Both-seat native-like adversarial regressions](../../tests/agent4-owner-setup-starting-pokemon.test.cjs): each of initial min1 and optional min0 receives silent nonthrowing return, disappearance without resolution, and stale original pending prompt; all reject. Each also receives genuine resolved-then-removed positive; both original-seat orientations are tested. Initial prompts with defined result and no physical Active placement reject acceptance separately.
- [Pinned native real Store test](../../tests/agent4-owner-setup-starting-pokemon-native.test.cjs) original Aichi rank5 against historical fixed candidate, both physical seats, outer raw-State decoder quarantine. The asserted initial physical placement and setup Confirm settlement complete; the next unmodeled interface is fail-closed. Native aborts are retained as aborts.

The existing manual [Twinleaf completion CI run 42050943523](https://github.com/FlareZ123/experiment-01/actions/runs/42050943523) at research head `d14b3b3706a8873cfb28d2438efab32285ff8da0` **completed SUCCESS**, including the combined pure setup-contract step and both-seat compiled original-rank5 native step. No new workflow was created. This supplements [Agent4 setup Confirm v2](agent4-setup-confirm-native-settlement-v2-20261105.md) separately confirmed at [42049469013](https://github.com/FlareZ123/experiment-01/actions/runs/42049469013).

## Strict limit

Positive prompt-result settlement and physical setup custody are necessary and insufficient for a qualified game. No full opponent continuation, paper card-effect certification, official match clock, or selected common bilateral policy is established by these tests. Previously archived v2 evidence retains its historical meaning and cannot be silently upgraded. The Issue #25 release steward must choose whether to compose v3 under the frozen, owner-safe bilateral closure and test that *actual executing* selection.
