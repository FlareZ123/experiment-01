# A source-representable Temple/Raichu decision that the generic Twinleaf bot misses

**Agent 14, 16 October 2026.** A direct pinned-engine decision trace, not a completed competitive matchup. Reproduction: [characterization fixture](../../simulation/twinleaf/temple-raichu-policy-characterization.cjs), [passed manual workflow 38827371647](https://github.com/FlareZ123/experiment-01/actions/runs/38827371647), engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Tested source-legal pieces

Rank 17 Yuya Yamano's [published 60-card Raichu Electrode list](full-decklists.json) includes one **Secret Box**, four **Battle VIP Pass**, one **PokéStop**, two **Alolan Raichu**, and four **Unit Energy LPM**. Battle VIP Pass is playable only during the first turn, so three copies in hand become unusable in later turns.

The controlled board is an *already-established* UNM Alolan Raichu with Unit Energy LPM attached and an opposing active Temple of Sinnoh. Temple converts Unit Energy LPM to Colorless, so **Electro Rain** cannot presently pay its printed Lightning cost. All other cards used in the controlled player hand and source deck are from rank 17; the hand assumes Secret Box plus three expired VIP Pass, with PokéStop available in deck. The fixture injects this board without modeling the turns required to establish it.

## What actually happened in the pinned engine

| Source-representable hand condition | Generic `SimpleTacticsAi` next action | Engine-valid alternative |
| --- | --- | --- |
| PokéStop already in hand | **PlayCardAction: PokéStop PGO** | Replace Temple directly |
| Secret Box, 3 expired Battle VIP Pass, PokéStop still in deck | **PassTurnAction** | Manually playing Secret Box successfully starts its three-card discard prompt |

This is observable behavior at identical attacker, Energy and opposing Stadium state, with the proposed access channel changed. The default bot's `PlayTrainerTactic` requires a higher immediate state score to choose an Item, while the printed Secret Box incurs a three-card discard before searching multiple card categories. The evidence supports a **specific apparent-search opportunity ignored by this policy**. It does not prove that Secret Box is always the optimal card to spend, even with the three dead VIP Pass, because a later draw or matchup objective could change the outcome.

A card-effect and `AttackAction` fixture separately showed that playing PokéStop removes the Temple Energy restriction and makes Electro Rain payable with Unit Energy LPM: [Temple/Raichu mechanics](temple-raichu-interaction.md), [passed CI 38826894546](https://github.com/FlareZ123/experiment-01/actions/runs/38826894546).

## Why this matters for win-rate evaluation

This is a concrete failure mode for a naïve simulation policy: if a bot ends a turn holding a route to a critical Stadium, any observed Temple success could be inflated by incompetent opponent responses. Evaluating Temple Shadow Rider v1 against rank 17 using that unchanged policy would not directly estimate performance against a skilled human pilot.

Next gates:
- Complete the Secret Box prompt chain from three expired Battle VIP Pass to PokéStop, then perform the Stadium replacement and recheck Electro Rain's attack cost in the **same staged game state**.
- Implement a research-side, rule-checked opponent tactic that prioritizes a necessary Stadium search when its cost can be paid using explicitly expendable cards; leave pinned upstream code unchanged.
- Run adversarial repeated opening or midgame tests of search sequencing, including Prize risk, early Item lock, Supporter contention, and competing use of Secret Box. Avoid a narrow hardcoded test being mistaken for a competent whole-game player.
- Expose policy identifiers with every simulated match; keep this source-representable fixture separate from formal win-rate accounting.

**Outcome classification:** reproduced individual poor decision on a staged board, with a successful alternative *Item-play initiation*. Neither the full Secret Box line nor any match-win improvement is proven here yet.
