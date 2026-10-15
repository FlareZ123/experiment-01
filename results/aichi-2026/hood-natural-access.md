# Natural Stealthy Hood access under champion's opening Basic-Pokémon count

**Agent 11, 15 October 2026.** This is an exact combinatorial computation for hypothetical Hood inclusion at fixed 14 opening Basic Pokémon, with [`hood-natural-access.cjs`](../../scripts/hood-natural-access.cjs) and [deterministic tests](../../scripts/test-hood-natural-access.cjs) verified in [manual CI 38824523922](https://github.com/FlareZ123/experiment-01/actions/runs/38824523922). This analysis does **not** specify or validate a 60-card candidate. It isolates naturally drawing the counter card before search effects.

## Baseline evidence

The source-audited [Aichi rank-1 Shadow Rider Calyrex list](full-decklists.json) has 18 Pokémon card slots: four Shadow Rider Calyrex VMAX and fourteen Basic Pokémon slots, and **zero Stealthy Hood**. Any hypothetical h-card Hood package considered here must replace non-Basic slots, keeping 14 Basics unchanged. The baseline also has a Forest Seal Stone, Float Stone, Quick Ball, Mysterious Treasure and other connectors, whose alternative uses are strategically important. No connector is assumed to search the Hoods in this narrow model.

## Exact chances, conditional on a legal Basic opening

| Hypothetical Hood copies | In valid seven-card starting hand | In hand after first turn draw |
| ---: | ---: | ---: |
| 0 | 0.0000% | 0.0000% |
| 1 | 11.0954% | 12.7728% |
| 2 | 21.1399% | 24.1158% |
| 3 | 30.2152% | 34.1653% |
| 4 | 38.3980% | 43.0472% |

The event being conditioned on is that the initial seven cards contain at least one of the fourteen Basic Pokémon. With `C(n,k)` the binomial coefficient and `h` the number of Hoods:

`P(no Hood | valid seven) = [C(60-h,7) - C(46-h,7)] / [C(60,7) - C(46,7)]`.

After six face-down Prize cards have been uniformly allocated from the remaining 53, the single turn draw misses a Hood with probability `(53-h)/53`, conditional on the original hand missing all Hoods. The resulting after-draw probability is therefore `1 - P(no Hood | valid seven) × (53-h)/53`.

All values are mathematically exact finite-population probabilities before rounded display. The code computes the combinatorial terms as BigInt, then evaluates their bounded ratios as floating-point numbers. The six Prize cards are accounted for in the turn-draw marginal probability; their exact identities are otherwise unknown and no searches occur.

## Strategic implication

A single unsearchable Hood would naturally appear in only **12.77%** of valid starting hands by the opening draw, despite its potentially decisive protection against Ability lock. Even the maximum four copies naturally appear by that point in just **43.05%**. This makes connector routes, strategic discardability, Supporter contention, and whether the protected VMAX can be established on the Bench central to a viable plan. These percentages measure card possession only; possession does not imply that the VMAX is evolved, that the player may attach the Tool, or that opposing Faba or Megaton Blower cannot remove it.

The positional Hood counterline has already passed a [full Underworld Door attachment-and-draw state test](https://github.com/FlareZ123/experiment-01/actions/runs/38824274582). Its target-draw ceiling above demonstrates why that tactical effect alone is insufficient evidence to edit the champion deck. In the Aichi field, four Absol Garbodor lists carry Tool-activated Garbotoxin, an additional possible matchup application currently undergoing separate pinned-game-state validation.

## Model limitations

Excluded: mulligans (and opponent bonus draws), prize-taking, further draws or top-deck manipulation, Ultra Ball/Arven/Adventure Bag or other search chains, Garbodor and Iron Thorns specific play histories, turn order, evolution requirements, Tool attachment opportunities, and card choice/opportunity cost. The source rank-1 14 Basic Pokémon are counted by source-listed stages only. Results cannot be extrapolated to a list with altered Basic count. No gameplay win rates were measured.

**Evidence classification:** exact mathematical opening distribution with a published baseline Basic count; tactical effect separately validated in a constructed engine state; competitive strength remains unknown.
