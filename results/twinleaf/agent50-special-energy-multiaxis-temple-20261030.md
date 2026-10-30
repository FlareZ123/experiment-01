# The Special Energy opportunity matrix: attack costs, immediate effects, and Temple timing

**Agent 50 | 30 October 2026 | Development evidence, not a competitive win-rate estimate.**

## Why this changes the single-deck study

The common owner policy has modelled Special Energy primarily through whether another printed attack becomes payable. That scalar misses immediate effects that occur on attachment **before the turn-ending attack**. One live native two-seat experiment found `Speed Lightning Energy RCL` could add no attack-cost progress after Thunder Mountain's reduction and yet genuinely draw two cards when attached to a Lightning Pokémon. This permits a player to change hand information and subsequent choices without consuming a Supporter. A blanket attack-first rule based on Energy-cost gain alone is unproven.

Our earlier paper hypothesis that Speed would still draw under `Temple of Sinnoh ASR` was **falsified by the pinned native Store** in [failed diagnostic CI 41011866974](https://github.com/FlareZ123/experiment-01/actions/runs/41011866974): under a genuine native Lightning target with Temple, the expected draw of two was **zero**. The Japanese [official Temple of Sinnoh FAQ](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%B7%E3%83%B3%E3%82%AA%E3%82%A6%E7%A5%9E%E6%AE%BF&regulation_faq_main_item1=all) also expressly rules **Jet Energy does not switch** when Temple is active. The source wording suppresses effects of cards **attached** to Pokémon; effects required to play an Energy while it is still in hand (e.g. Aurora Energy's discard cost) are a different timing window. Do not overgeneralize the latter exception to Speed/Capture/Jet's after-attachment triggers.

## Original 29-list source population: reproducible card-frequency census

Exact counts below come solely from `results/aichi-2026/full-decklists.json`. They are *registered original copies*, not the probability of an effect happening on any turn.

| Printed hand-attachment channel | Source lists (final ranks) | Card copies | Printed effect and conditions |
| --- | --- | ---: | --- |
| Speed Lightning Energy | 6, 24, 29 | 12 | When attached from hand to a Lightning Pokémon, draw 2; actual drawn cards depend on public deck count |
| Capture Energy | 2, 3, 6, 7, 15, 24, 29 | 13 | Attach from hand, search Basic Pokémon and put it on Bench; depends on Bench room and deck membership |
| Jet Energy | 2, 7, 15 | 5 | Attach from hand to a Benched Pokémon, switch that Pokémon into Active; position choice changes turn |
| Telepathic Psychic Energy | 9, 30, 31 | 6 | Attach from hand to a Psychic Pokémon, search for up to two Basic Psychic Pokémon into Bench |
| **Total** | **10 distinct original lists** | **36** | Categories overlap within source lists; no effect frequency inferred |

The source roster also contains **nine Temple of Sinnoh copies across five lists**, ranks 3 (1 copy) and 8/11/16/22 (2 copies each). Rank **3** has *both* three Capture Energy and one Temple, which gives its own player a sequencing conflict: if Capture's Basic-search value matters, resolve that on-attach opportunity before playing Temple, absent another way to replace Temple. This is a printed-setup constraint, not an observed rank-3 line.

## Code and tests

- `simulation/twinleaf/agent50-special-attachment-effect-axes.cjs`: pure actor-only `collectSpecialAttachmentEffectAxes(view,catalog)`, enumerating exact visible held printings and Active/Bench recipients. Returns `maximumKnownAttackCostGain`, `onAttachChannel`, `publicEffectOpportunity`, `potentialDrawCap`, `potentialBenchCap`, reason, and unverified native statuses. Uses the same `effectivePublicAttackCost`, `publicEnergyContext` and one-unit-deficit matcher as the corrected cost planner; no private physical deck/Prize/opponent-hand identities. Strongly separates `0` known immediate attack-cost gain from unknown or positive other benefit.
- Recognizes exactly four printed source families: Speed, Capture, Jet and Telepathic/Pinned `Telepath [P] Energy M3`. Unknown Special Energy effects remain **unmodeled**, never assumed to be worthless. When public Temple is up, all four modeled post-attachment channels are suppressed even though a Special Energy card can still attach to supply one Colorless.
- `tests/agent50-special-attachment-effect-axes.test.cjs`: public Bench/type conditions, one- versus two-card search, hand quota and source-only privacy invariance, unknown attached-Energy fail closed, Temple suppression, and **Speed drawing with zero incremental attack-cost benefit under Thunder**.
- `tests/agent17-conditional-special-native.test.cjs`: genuine pinned Store trials in both physical seats, using exact printed cards. [CI 41011297459](https://github.com/FlareZ123/experiment-01/actions/runs/41011297459) **passed** Speed draw-two positive when Temple absent, despite cost-neutral attack-affordability under Thunder. [CI 41012357154](https://github.com/FlareZ123/experiment-01/actions/runs/41012357154) **passed** the corrected Speed under Temple negative and initial actor-only three-axis pure logic. [CI 41012466616](https://github.com/FlareZ123/experiment-01/actions/runs/41012466616) **passed** the genuine pinned both-seat Temple suppression cases for Speed, Capture and Jet, plus the revised four-channel pure observer. A subsequent run for the newly added Telepath Temple case, cost-gain annotation and source-rank3 Capture/Temple sequencing contrast remains pending validation.

Primary card text: [Speed Lightning (official)](https://asia.pokemon-card.com/my/card-search/detail/514/), [Capture](https://limitlesstcg.com/cards/rcl/171), [Jet (official)](https://asia.pokemon-card.com/my/card-search/detail/7002/), [Telepathic Psychic (official)](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/me03/88), [Temple of Sinnoh](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/swsh10/155).

## Research qualification and next integration

1. The pure opportunity matrix is **read-only**. No agent may count its offers as Store-accepted plays. The `potential` fields are upper-bound descriptions of printed opportunities, subject to actual game state and mandatory prompts.
2. The pinned tests stage genuine printed cards in synthetic board states. They do **not** use authentic source first hands or establish opponent responses, game completion, payoff against one of the missing lists, or a fixed 60-card win rate.
3. A successor integrated actor chooser should compare nonterminal Energy preparation before terminal attack, preserving distinct cost, draw, search, switching and disruption-resilience channels. The next stronger causal experiment uses actual source deals from rank3, rank6 and rank30 and an unchanged candidate deck with both seat orders. Native post-dispatch receipts and full action traces are mandatory.
4. More generally, don't put a numeric utility score on a print family solely because it is common in the field. A Speed draw may change nothing important or unlock decisive protection; a Capture search may fail because all relevant Basics are Prized. Use K0/K1 information, Bench contention and active-lock state.

**Benchmark unchanged: 29 of 32 original 60s authenticated; final ranks 23, 25, 28 remain missing; zero competitively qualified games; 99.5% objective unproven.**
