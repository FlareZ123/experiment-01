# Pinned native replay leaves first Prize advantage nonterminal

**Agent 3, 21 October 2026. Evidence class: pinned reducer source, official Aichi 2026 May event rules, bounded compiled native test.** No competitive qualification.

## Applicable paper rule

The [official Champions League 2026 Aichi May event rules](https://www.pokemon-card.com/info/005445.html) specify **six-Prize tiebreak games in the Open League knockout**, deciding the game when a player satisfies a win condition or obtains a smaller number of remaining Prizes. The supplied [Advanced Player's Rulebook, E. Win and Loss](../../resources/manual/EN_advanced_manual-2025-transcription-structured.md) independently prescribes a fresh six-Prize tiebreak and first fewer remaining Prizes. The official Aichi Swiss qualifier separately uses a 25-minute time limit and can result in *both players losing* when unfinished; this analysis concerns the knockout tiebreak rule, not all possible clocks.

## Pinned engine code-path mismatch

Read the **exact pinned upstream** `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` at [`ptcg-server/src/game/store/effect-reducers/check-effect.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/effect-reducers/check-effect.ts), function `checkWinner` (~lines 333–381). It computes wins from (1) an opponent lacking Active Pokémon and (2) a player having **no Prizes left**. If neither condition holds, it leaves the game in progress. There is no branch comparing unequal, nonzero Prize counts when `state.isSuddenDeath` is true. `initiateSuddenDeath` then explicitly sets `state.isSuddenDeath=true` before a new setup; [`setup-reducer.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/setup-reducer.ts) places six Prizes by default.

Concrete counterexample with both Active Pokémon alive: in a restarted tiebreak, [5,6] remaining Prizes requires **seat 0 wins under the supplied and Aichi event rules**. The native `checkWinner` instead sees neither side with zero Prizes and leaves `GamePhase.PLAYER_TURN`. Likewise [6,5] for seat 1. The ordinary nonreplay game correctly continues on either arrangement.

The independent genuine Store [rank-6 native replay](agent3-native-replay-new-six-prize-deals-20261021.md) records a legitimate new six-Prize opening, so this is a material potential **winner-adjudication defect** for long replay simulations. Native end-of-game results can differ from paper tiebreak outcomes. This discrepancy is separate from the already enforced strict source/reply epoch crossing ban.

## Compiled characterization and scope

[`tests/agent3-paper-tiebreak-native-check.test.cjs`](../../tests/agent3-paper-tiebreak-native-check.test.cjs) calls the **compiled pinned native exported `checkWinner`** for both physical seats with a six-Prize array containing exactly one taken Prize and both Active Pokémon present, first in replay mode and then ordinary mode. It asserts the engine remains in PLAYER_TURN for the replay; this is a **negative fidelity test**, not a fix. The test was added to the existing canonical manual workflow **after pinned compilation**, without editing the vendor submodule. At publication, its compilation/CI outcome must be reported separately from the source-derived counterexample.

**Go/no-go:** replay adjudication under Aichi paper rules is **NO-GO** until a research-owned version-pinned adapter hook or a separate evidence-safe tiebreak adjudicator passes genuine Store fixture and bilateral tests. Simulations using unmodified native replay terminals must never be promoted as paper game wins. Current total remains **0 competitive-qualified games**, 29/32 verified exact opposing decks, no 99.5% demonstration.


**Compiled confirmation (21 October):** [manual CI 39536897214](https://github.com/FlareZ123/experiment-01/actions/runs/39536897214) at `1ba203afd9b665634f270e4fdfacd9fdc36fa909` **PASSED** its pinned native `checkWinner` first-Prize replay-control test for both seats; the entire manual canonical workflow succeeded. This demonstrates the native first-Prize stopgap, with 0 competitive-qualified games.
