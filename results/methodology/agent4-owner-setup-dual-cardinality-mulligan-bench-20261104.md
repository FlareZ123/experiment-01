# Agent 4: explicit owner-only opening Active and post-mulligan optional Bench decisions

**4 November 2026 | normal Agent 4, real pinned source review and compiled native regression.** This is a bounded, default-off development-policy component. It does not select the common Issue #25 policy or certify a game.

## Failure mode and pinned semantics

At upstream Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, [`setup-reducer.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/setup-reducer.ts) issues the *same* `CHOOSE_STARTING_POKEMONS` `ChooseCardsPrompt` for two distinct owner decisions.

| Native path | Selection count | Actual physical meaning |
| --- | --- | --- |
| `setupSinglePlayer` | `min=1,max=6` | First chosen hand card to face-down Active, subsequent choices to Bench. |
| `allowExtraBenchPlacement` after optional mulligan-compensation draw | `min=0,max=newBasics.length` | Choices go to remaining empty Bench slots, with `[]` leaving those Basics in hand. |

Both prompts set `allowCancel=false`; the `min=0` prompt nevertheless permits a zero-element result by its count contract. Pinned [`ChooseCardsPrompt.validate`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prompts/choose-cards-prompt.ts) enforces the minimum and maximum. The [Advanced Player's Rulebook, Section I.G.6](../../resources/manual/EN_advanced_manual-2025-transcription-structured.md) explicitly treats initial Bench placement as optional. Agent30 independently identified this overload in [the source review](agent30-opening-setup-message-overload-and-cardinality-20261104.md).

The original [Agent 4 one-Basic adapter](../../simulation/twinleaf/agent4-owner-setup-starting-pokemon.cjs) intercepted only `min=1`, leaving the `min=0` second use to the external fail-closed native decoder quarantine. Our **v2** differentiates those forms before producing an actual `ResolvePromptAction`.

## Implemented developer policy and physical checks

1. `min=1` initial setup: preserve the established policy of exactly the first native-validated owner-hand eligible Basic. Verify that the genuine Store placed that exact physical Card object into Active. This may forgo useful early Bench attackers; no claim of optimality.
2. `min=0` bonus-only setup: permit this path only if the owner already has an Active Pokémon, return `[]`, and preserve all preexisting owner-hand cards and Active/Bench physical Card identities. This conservatively reserves newly drawn Basics for possible **during-turn** play, including potential from-hand Bench trigger Abilities. It can sacrifice useful immediate Bench occupancy. Because completing the final setup prompt may automatically draw a card for the first turn, the post-Store owner-hand check permits additional cards while requiring every original hand card to remain in order.
3. Other prompt classes, messages, cardinalities and target ownership still delegate to the outer [raw-State decoder quarantine](../../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs), which refuses to allow the unmodified scorer to inspect hidden State. The owner decision functions receive a detached actor observation and a source-bound eligible hand-index menu, without raw native Card references.

The change is in [`agent4-owner-setup-starting-pokemon.cjs`](../../simulation/twinleaf/agent4-owner-setup-starting-pokemon.cjs), with [pure and injected-Store regressions](../../tests/agent4-owner-setup-starting-pokemon.test.cjs). The tests exercise both responding seats, two permutations of concealed opposing cards, empty/partly occupied/full Bench, `min=0` zero-card selection, optional turn-start topdeck draw, `min=2` rejection via quarantine, and exact initial Active placement.

## Native and mathematical test evidence

The existing **manual-only** `agent4-rank5-special-energy-root-prospective.yml` smoke branch compiled the pinned original Twinleaf Store and passed [CI run **41860483599**](https://github.com/FlareZ123/experiment-01/actions/runs/41860483599) at repository head `421185c665ccfe5baba756fd1534cb5811a7b69e`: **38/38 tests passed, 0 failed**. Native original rank-5 source against rank-1 reference under both physical source seats authenticated 2 initial owner Active selections in each smoke, with 2/2 actual native physical Active placements and subsequent previously characterized fail-closed unsupported prompts. The new `min=0` cases passed the injected-Store tests; **this run did not capture a naturally triggered native `min=0` bonus-Bench choice**. Do not claim native min-zero closure from those mock tests.

An initial smoke [CI run 41859833523](https://github.com/FlareZ123/experiment-01/actions/runs/41859833523) correctly remained **red (35/37)** due to two preexisting mathematical test assertions with five-decimal literal expectations and a `1e-7` tolerance. Actual 7-card combinatorial probabilities for at least two Basics among valid opening hands were `0.6058236652488573` (14-Basic rank1) and `0.48778311490570747` (11-Basic rank5), not the rounded `0.60582` / `0.48778` constants. Fixed all four rounded literals to exact computed combinatorial expectations in [`agent4-opening-basic-role-hypergeom.test.cjs`](../../tests/agent4-opening-basic-role-hypergeom.test.cjs), retaining the strict tolerance. The subsequent native run above passed all 38. These are opening probabilities, **not** game win rates.

## First naturally triggered native bonus cohort: positive one-seat reachability, insufficient bilateral coverage

An independently frozen [16-attempt real Store probe](../../tests/agent4-owner-bonus-bench-native.test.cjs) was added to the same manual smoke workflow after the original green run. At the [first execution, CI 41861598272](https://github.com/FlareZ123/experiment-01/actions/runs/41861598272), all sixteen native rank6-original versus rank1-reference attempts resolved two initial Active selections and ended at explicit nonqualified fail-closed original-decoder boundaries. **Four distinct actual native `min=0` bonus-Bench prompts were accepted and physically preserved in source physical seat 0**, for frozen seeds `20261126`, `20261128`, `20261130`, `20261132`. The originally registered eight seeds for source physical seat 1 yielded **zero** native `min=0` prompts, despite successfully passing its other setup components. Therefore the test correctly **failed its bilateral natural-prompt witness assertion**. Neither absence nor frequency is a game-performance statistic; a bonus-choice prompt occurs only when earlier mulligan and extra-draw transitions expose a Basic.

A separately labelled **prospective 32-seed extension**, `20261134` through `20261165`, was committed after observing this red eight-seed result and queued independently. Those later seeds cannot retroactively make the first preregistration green. The value of the first run is the direct same-Store positive physical `min=0` receipt for one seat, together with transparent lack of coverage in the other.

## Source-derived reoffer nuance and exact independent-paper lower bound

The pinned `allowExtraBenchPlacement` helper searches **all eligible Basics still in the owner's current hand** after an optional bonus draw. This includes valid additional Basics deliberately kept in hand by the earlier one-Basic initial setup choice. It does **not** restrict the next prompt to cards first obtained in the bonus draw. That is compatible with the manual's permission to add Bench Basics until the game begins, and is strategically relevant: even when bonus draws find no new Basic, a player with an initially retained second Basic can receive the optional `min=0` choice.

For a purely mathematical ideal-paper initial shuffle, let candidate have `K=14` Basics (historical rank1 reference), source have `L=4` Basics (published rank6), and `C(n,k)` denote a binomial coefficient. The event

`candidate's first seven contain at least two Basics AND source's first seven contain no Basic`

is sufficient to produce an eligible retained Basic when a bonus card is elected under this exact one-Basic setup strategy. With independently shuffled physical decks, its **unconditional exact probability** is

`[sum_{i=2}^7 C(14,i) C(46,7-i) / C(60,7)] × [C(56,7) / C(60,7)] = 0.3133784169816411`.

Conditioning on the candidate's initial seven being valid gives `0.36379733771467726`. These are **lower bounds** on possible actual prompt opportunity under an all-bonus-draw policy, because a first seven with exactly one Basic can also gain another eligible Basic from bonus cards. They are **independent ideal-paper combinatorics**, not estimates of this deterministic native xorshift seed cohort, not claims that every prompt will be strategically accepted, and never win probabilities. These numbers contextualize the first natural 4/8 versus 0/8 seat-specific fixture differences without claiming stochastic significance.

## Remaining integration and evidence vetoes

- This policy remains an **alternative** to Agent50's all-eligible-Basic and Agent21's separate opening policies. Issue [#25](https://github.com/FlareZ123/experiment-01/issues/25) must explicitly pick and freeze one opening contract and symmetric two-seat wrapper order, then actually execute it.
- A genuine pinned Store **mulligan-bonus native `min=0`** event, subsequent turn play or retained hand activation, original full physical deal fingerprints and owner-information noninterference against concealed-zone permutations remain to be captured.
- Source opening Bench strategy remains a nontrivial tactical choice. Agent8's [29-original on-Bench-trigger census](agent8-aichi-29-source-pregame-bench-trigger-option-census-20261104.md) documents genuine tradeoffs; no demonstrated policy superiority is implied by selecting zero extra Basics.
- The rest of the inherited policy may still read hidden State or commit paper-invalid costs. This component never claims whole-policy safety, full-paper match validity or a qualified game.

**Status:** 29/32 authenticated Aichi original name/count 60s, missing ranks 23,25,28; zero competitively qualified games, no selected fixed best 60 and no demonstrated 99.5% field win rate.

**Agent 4**
