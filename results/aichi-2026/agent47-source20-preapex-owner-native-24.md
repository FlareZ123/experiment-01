# Original rank-20 native source games: six earlier-than-ready Dragon-discard alternatives, five naturally dealt games

**Agent 47 | 30 October 2026 | observational actor-only legal alternatives, no new policy action, no competitively qualified game.**

## Strategic question and pre-existing negative control

The first 24-pair original rank20 Apex payload-discard experiment recorded
**zero** actual alternative discard proposals because its bounded
candidate-specific policy insisted on Apex Dragon already being directly
payable. That is intentionally a strict gate, but it could miss a
strategically important **earlier discard**: depositing a copyable Dragon
in the discard pile during Regidrago V's setup, before evolution and
Energy attach complete. The direct-ready requirement tests the
immediate payoff and may be too narrow for a setup-oriented deck.

This follow-up classifies those possibilities **without changing an
action**. A legitimate actor-only `ChooseCardsPrompt` may expose a
menu of source-legal hand-discard multisets. The detached observation
includes only the owner's hand and publicly visible state. A candidate
is counted if (a) Regidrago V or VSTAR is already visibly in play for
that owner, (b) Apex Dragon is not currently directly payable, (c) the
baseline conservative native-safe chooser would **not** discard a
Dragon donor, and (d) another native-validated legal discard choice
would include a printed Dragon attack donor. This is a possible
setup opportunity, **not** an expected-value or play-optimality claim.

- Pure observation and tests:
  [`agent47-preapex-payload-opportunity.cjs`](../../simulation/twinleaf/agent47-preapex-payload-opportunity.cjs),
  [tests](../../tests/agent47-preapex-payload-opportunity.test.cjs).
- One-arm native 24-cell source-controlled
  [runner](../../simulation/twinleaf/agent47-preapex-owner-opportunity-24-native.cjs):
  rank20 original source 60 vs original ranks1/11, six original seeds
  `1847000101..1847000106`, both physical source seats, 160 roots.
  Symmetric narrow mandatory min2/3 attachment bot correction remains
  available, no Apex payload policy selection enabled, **baseline
  choices unchanged**.
- Compiled native [CI 41135066842](https://github.com/FlareZ123/experiment-01/actions/runs/41135066842)
  succeeded, raw
  [artifact 13017320999](https://github.com/FlareZ123/experiment-01/actions/runs/41135066842/artifacts/13017320999),
  ZIP SHA-256 `02bd21ec75bd1b0c528540b5800d52753ca62deb48424b9fca623b48744cf689`,
  pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Exact first-stage actor-only census

| Denominator or mutually exclusive actor-prompt classification | Count |
| --- | ---: |
| Original registered native source games | **24** |
| Native returned games | **24** |
| All actor-owned eligible source/opponent hand-discard decisions | **40** |
| No Regidrago yet in that owner's public in-play board | 16 |
| Regidrago in play but no native-legal alternate Dragon donor discard menu | 14 |
| Native-safe conservative baseline itself already discards a Dragon | 4 |
| **New pre-Apex native-legal alternative donor-discard menus** | **6** |
| Distinct original source games containing at least one such new menu | **5 / 24** |
| Opponent-owned corresponding early donor alternatives | **0** |
| Competitively qualified games | **0** |

The six true alternatives all concern the **original source Regidrago
owner**, none the rank1/rank11 opponent. All have `activeVstar:false`,
so a Regidrago V/VSTAR line was visibly in play but the active Pokémon
was not an attack-ready Regidrago VSTAR. All six alternative selections
would discard **at least one sole remaining copy of its printing from
the owner's hand**; the alternative is materially costly by ordinary
hand-retention heuristics and must be evaluated through DCI/AMR and the
actual connector it enables.

| Source original match | Owner physical seat | Global turn(s) with alternatives | Required discard count |
| --- | ---: | --- | --- |
| Rank20 vs rank1, seed 1847000101 | 1 | 2 and 6 | One each |
| Rank20 vs rank1, seed 1847000105 | 1 | 22 | One |
| Rank20 vs rank11, seed 1847000101 | 1 | 2 | One |
| Rank20 vs rank11, seed 1847000104 | 0 | 21 | One |
| Rank20 vs rank11, seed 1847000106 | 0 | 23 | Two |

Three of the six prompt records already had some other candidate
Dragon publicly in the discard pile; three did not. Therefore a
candidate may be relevant to unlocking *specific missing attacks*
rather than simply the first Apex copy donor. The six-offer count
includes the print `Regidrago V SIT` in the conservative original
candidate Dragon set; treating an unevolved Basic attacker as a
safe donor is especially questionable when bench development is
still incomplete.

## Decision consequence

The earlier **zero-intervention** direct-ready result accurately
describes that particular bounded policy. It does **not** imply the
deck lacked legal useful earlier Dragon-discard opportunities.
**Six such legal alternatives** were actually exposed in the
original 24 naturally dealt source games, and a purely observational
owner-safe classifier found them without touching decisions.

A separate **retrospective five-game native connector-ancestry
study** was dispatched to distinguish whether the early choices
originate in Quick Ball/Ultra Ball or other competing search effects
and to retain the exact donor printing choices. Its results must be
reported separately; this initial 24-game census establishes the
full denominator and candidate frequency. In particular, opening
alternate access to a donor may consume the sole print necessary for
another role, an important connector-domination concern.

The same pinned game engine is known to mishandle Special Energy
and can physically lose cards in Regidrago V's Celestial Roar,
as [independently native-proven](agent47-rank20-24-natural-settled-physical-loss-20261030.md).
This observation therefore cannot validate any projected matchup
win increase and cannot promote the 24 native engine outcomes.
The benchmark still has **29/32 authenticated exact original
opponent 60s and zero competitively qualified games**.
