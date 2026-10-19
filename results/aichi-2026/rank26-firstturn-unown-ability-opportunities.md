# Rank26 source-first legal Unown draw opportunities omitted by bot

**Agent 4, 19 October 2026.** Evidence class: source-dealt live setup-board census combined with exact printed card text. Strategic benefit and native effect dispatch not yet demonstrated for these five. They are **not** five wins, losses, or independent validation games.

## Source and denominator

The preregistered, completed [48-deal original-source rank26/rank6 integrated cohort](rank26-integrated-firstturn-source-cohort-v2.md), [GitHub Actions 39220575144](https://github.com/FlareZ123/experiment-01/actions/runs/39220575144), immutable artifact [12171872770](https://github.com/FlareZ123/experiment-01/actions/runs/39220575144/artifacts/12171872770), comprises 24 fixed repeated seed values 60–83 in both physical seats and uses both exact published original source 60s under pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

Among **20/48** games in which rank26 physically went first, I inspected every pre-first-action `opening.sourceBench` (observed after setup/mandatory draw but before any bot choice). **Five** had at least one genuine Benched `Unown AOR`. Source first-turn traces contained **zero** `UseAbilityAction` events among all 20 games, including these five. The source first-action hands and opponent boards were not constructed or selected by the observer.

| Genuine source seed | Source Active at first normal action | Benched Unown | Other own Bench | Source held Cologne | Opponent Active |
| --- | --- | --- | --- | --- | --- |
| `26947711` | Crobat V | 1 | none | No | Iron Thorns ex |
| `2178185041` | Unown | 1 | Bunnelby, Exeggcute, Meloetta ex, Crobat V | **Yes** | Iron Thorns ex |
| `2808863668` | Tapu Koko Prism Star | 1 | Exeggcute, Crobat V | No | Iron Thorns ex |
| `3860251945` | Squawkabilly ex | 1 | Exeggcute, Crobat V, Meloetta ex | **Yes** | Iron Thorns ex |
| `2308062544` | Squawkabilly ex | 1 | none | No | Iron Thorns ex |

## Rule and policy distinction

Official [Unown AOR 30/98](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/xy7/30/) has the **Farewell Letter** Ability: once during your turn, when Unown is on the Bench, it can discard itself with its attached cards without a Knock Out, **then draw one card**. It does not require Meloetta as Active. Paper Expanded permits Unown's firstturn Ability. Published [Iron Thorns ex TWM 77](https://www.limitlesstcg.com/cards/en/TWM/77) has **Initialization**, which suppresses Abilities of Pokémon **with Rule Boxes** except Future Pokémon; Unown AOR is a non-Rule-Box Basic, so its Farewell Letter remains available when Iron Thorns ex is Active. All five Unown are present from setup, with no attached resources, and each owner has a nonempty deck on turn one. Hence they are **five board-state legal draw opportunities** absent a contrary special game effect; no such effect appears in the frozen setup boards.

The existing [rank26 opt-in one-Farewell wrapper](../../simulation/twinleaf/rank26-farewell-source-draw.cjs) deliberately requires **own Active Meloetta ex** and defers when the source holds Cologne against active Iron Thorns. That narrow tactic can be valid for a specific combo line, but **all five** source-root Bench-Unown cases have some other Active, so this implementation would trigger **zero** of these five opportunities, even though the printed Ability is usable. The actual registered 48-deal cohort did not include the Farewell wrapper, and its stock bot never used any Ability on these 20 source-first first turns.

Using Farewell is discretionary and may cost a valuable Basic pivot or attached-resource line. The bot's inability to consider it is evidence of **missing strategic action coverage**, while its omission in a specific game is not automatically an error. In three of the five, the source held no Cologne; in two, the source held Cologne, so the timing of Cologne relative to Unown draw and opponent's other lines may matter. The source's exact next drawn card cannot be inferred from the first-action board and must be drawn physically in Store if a policy is tested.

## Proposed next discriminating test, without distorting performance

Implement a targeted, opt-in source policy on the five **retrospective development** seeds that asks the native Store to perform one Farewell Letter while Unown is already genuinely Benched, regardless of own Active, after considering immediate held Cologne priority; record the actual one-card deck-to-hand transition and Unown transfer to discard. Require an independently valid native `UseAbilityAction`, no hidden deck access in the tactic, and no opponent Prize change. Report all accepted/declined roots. This cannot estimate improved win rate because the opportunities were selected after inspecting the source sample. Further progress toward a competitive benchmark requires *one complete real attacking line plus rank6's legal response*, then a preregistered new cohort.

**Implication:** before using rank26 as part of a 32-opponent competitive baseline, a source bot must know about real legal Ability opportunities in addition to preserving DCE, Cologne and TM. Existing 48-deal zero-attack results are evidence about an incomplete **decision policy**, not about the actual strength of the published rank26 deck.
