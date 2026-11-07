# Agent 2: exact FSS-first plus Float co-held opening opportunity across 29 Aichi originals

**7 November 2026. Research-grade source census, no simulated wins.** This extension of [the original-29 FSS-first-any-Tool collision study](../../simulation/evaluation/agent2-original29-fss-first-tool-collision.cjs) separates the physically co-held **Float Stone BKT** route from other competing Tools. It addresses a real measured first-held-Tool weakness in the pinned native bot, while avoiding the mistaken assumption that every Tool collision produces a strategically useful Float attachment.

## Original-source inventory and exact event

Among the authenticated **29 of 32** Aichi 2026 Top32 original paper lists, 12 contain Forest Seal Stone SIT, and **11 also contain Float Stone BKT**. Rank4 has Forest Seal Stone but no Float Stone. The eleven ranks are **1, 3, 5, 8, 9, 11, 16, 19, 22, 26, 30**.

For each original 60, the [exact source calculator](../../simulation/evaluation/agent2-original29-fss-first-float-opening.cjs) parses printed Tool and Basic classifications from the existing original-29 census, then counts all unordered seven-card initial hands with:

1. At least one Forest Seal Stone and one Float Stone in the hand.
2. Forest Seal Stone is the **earliest physically held Pokémon Tool**, including all other Tool names, under uniform hand order. If held FSS count is \(f\), total held Tool count \(t\), weight the hand by \(f/t\).
3. At least one Basic Pokémon in the opening seven, making the hand a valid first hand.
4. **No Basic Pokémon V held in the opening seven**. This last condition tests lack of an immediate hand-held FSS attachment recipient, not inability to obtain one through search or later draws.

Each event probability conditions on a valid Basic opening hand of **that particular source deck**. The all-cards and Basic counts are exact 60-card combinations; combinatorial numerators use a common 420 denominator to represent the Tool-order fraction without floating-point rounding. The initial Prize cards, mulligan bonus draws, actual play choice, active/bench positions and future changes to hand are outside this calculation.

## Ranked results

| Source rank | Archetype | FSS copies | Float copies | Chance given valid initial seven |
| --- | --- | ---: | ---: | ---: |
| 11 | Absol Garbodor | 2 | 3 | **1.65214%** (1 in 60.5) |
| 8 | Absol Garbodor | 1 | 4 | **1.43783%** (1 in 69.5) |
| 16 | Absol Garbodor | 1 | 4 | **1.26158%** (1 in 79.3) |
| 22 | Absol Garbodor | 1 | 4 | **1.11347%** (1 in 89.8) |
| 9 | Absol Electrode | 1 | 1 | 0.43042% |
| 26 | Meloetta Donk | 1 | 1 | 0.42757% |
| 19 | Raging Bolt | 1 | 1 | 0.42674% |
| 30 | Lillie's Clefairy | 1 | 1 | 0.42674% |
| 3 | Snorlax Stall | 1 | 1 | 0.41942% |
| 1 | Shadow Rider Calyrex | 1 | 1 | 0.35962% |
| 5 | Mew Genesect | 1 | 2 | 0.11069% |

The four original **Absol Garbodor** rank entries 8, 11, 16 and 22 account for **67.752% of the sum** of these eleven exact source-specific opportunity probabilities. If the 29 authenticated ranks were assigned equal weights solely as a descriptive opening-opportunity census, the across-source mean would be **0.27815%** of a valid initial seven. Across the eleven FSS-plus-Float ranks alone, the mean is **0.73329%**; across the four Absol Garbodor ranks, **1.36625%**. These averages are not matchup rates or game outcome statistics, and three original source decks remain unauthenticated.

The low rank5 Mew Genesect rate despite two Float copies is explained in part by the explicit **no-opening-Pokémon-V** constraint. Conversely, the high Absol Garbodor rates largely reflect multiple Float copies and fewer Basic V starter opportunities. These are quantitative hand-composition phenomena.

## Strategic interpretation and critical restrictions

The broad source-29 result suggests a higher **frequency** of possible Float-versus-FSS Tool contention in the original Absol Garbodor family than in the previously staged rank3 Snorlax/Bunnelby case. Whether Float has value is a separate question. On a Bench Garbodor with Garbotoxin, attaching a Tool may be a lock-enabling line, but doing so depends on the evolution's actual presence, whether opposing/own Ability lock changes the effect, whether a Tool is already attached, and the opportunity cost of consuming the Tool slot. On rank11, Latias ex SSP's **Skyliner** can already confer free Retreat to eligible Basics without Float, an earlier verified false-positive for a Float mobility policy. Other Tool attachments may be superior in the same state.

This is precisely why the new opening probability should be used as a **screen for where native A/B/A state observations are worthwhile**, not as a direct utility score. In particular, selecting FSS-first and holding Float with no V in the opening does **not** prove that the native policy tries either Tool at that time, has evolved Garbodor, can legally attach Float to its chosen recipient, changes a lock, enables a paid attack, or increases winning probability. Conversely, a valuable Float later in the game can be drawn or searched without this opening event.

A useful preregistered continuation would sample original ranks 8/11/16/22 under native initial physical deals; identify genuine FSS-first/Float co-held acting-owner roots; compare an exact untreated versus actor-only Float proposal with root noninterference; verify the actual Tool attachment, Ability-lock effect, opposing decision and proper paper-clock outcome. Do not substitute the high theoretical opening probability for such evidence.

## Reproduction

- [Source29 exact Tool-order and valid-Basic calculator](../../simulation/evaluation/agent2-original29-fss-first-float-opening.cjs), preserving source originals.
- [Regression tests](../../tests/agent2-original29-fss-first-float-opening.test.cjs): all 29 ranked source rows represented; FSS-free deck classification marked uninspected; source rank3 **scaled numerator 529011945** matches the independently developed ten-category original-rank3 opening enumeration exactly; a synthetic one-Basic case matches an explicit \(\binom{57}{4}/2\) half-Tool-order identity.
- [Manual-only CI run 42349293303](https://github.com/FlareZ123/experiment-01/actions/runs/42349293303) **SUCCESS**, with an auditable eleven-rank opportunity roster in the \`AGENT2_ORIGINAL29_FSS_FIRST_FLOAT\` log record. No native matches were run, no upstream engine code or default bot policies were changed.

**Benchmark status:** all identified source frequencies are combinatorial opening statistics; **zero competitively qualified games**, no fixed selected 60-card deck, and no supported estimate of a 99.5% Aichi-wide win rate.
