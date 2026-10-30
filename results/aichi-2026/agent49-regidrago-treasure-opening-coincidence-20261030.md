# Original Aichi Regidrago first-seven Treasure + Dragon-donor opportunities

**Agent 49, 30 October 2026. Exact opening combinatorics on authenticated original source 60s.**

The [reproducible pinned-source script](../../simulation/evaluation/agent49-regidrago-treasure-openers.cjs) joins nine Regidrago source 60s from `results/aichi-2026/full-decklists.json` with actual pinned Twinleaf **printed Pokémon type** identities. A qualifying seven-card starting hand contains at least one **Mysterious Treasure**, at least one **Regidrago V**, and at least one **Dragon Pokémon other than Regidrago V/VSTAR** (potential Apex Dragon donor). The latter counts only genuine printed Dragon Pokémon verified by actual `publicCatalog().dragonPokemonPrintings`, not untyped name guesses.

For disjoint category counts `T,R,D`, the number of eligible 7-card hands is

```text
favorable = sum over masks M of {T,R,D}:
              (-1)^|M| * C(60 - sum(counts in M), 7)

all = C(60, 7) = 386,206,920
P(all three in 7) = favorable / all
P(all three | valid Basic opening) =
  P(all three in 7) / [1 - C(60-B, 7) / C(60, 7)]
```

The conditioning is correct because every all-three opener already contains **Basic Regidrago V**, so every all-three opener is a valid Basic setup, and the tournament rules require mulligans to continue until a valid Basic hand.

| Source final rank | Treasure copies | Regidrago V copies | Printed Dragon donor copies | Basic Pokémon copies | Chance among valid seven-card starting hands |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 3 | 4 | 5 | 15 | **5.0024%** |
| 12 | 4 | 4 | 6 | 15 | **7.4232%** |
| 13 | 4 | 4 | 5 | 11 | **7.2884%** |
| 14 | 4 | 4 | 6 | 14 | **7.6049%** |
| 18 | 4 | 3 | 5 | 16 | **4.9009%** |
| 20 | 3 | 4 | 5 | 14 | **5.1249%** |
| 21 | 4 | 3 | 6 | 14 | **5.9258%** |
| 27 | 4 | 4 | 6 | 15 | **7.4232%** |
| 32 | 3 | 4 | 6 | 13 | **6.0975%** |

**Source of computed values:** the actual compiled pinned CardManager log `AGENT49_TREASURE_OPENERS` in [manual CI 41133516227](https://github.com/FlareZ123/experiment-01/actions/runs/41133516227), at checked-out source SHA `74a7f6c33e1e8a1f53410a2c49f1c7ff36b6a3f6`. The math step executed and recorded all nine rows. **That workflow as a whole failed at a later, separate native prompt test**, which is under repair. All [five pure combinatorics regressions](../../tests/agent49-regidrago-treasure-openers.test.cjs) **executed and passed** in the independently successful [manual benchmark-statistics CI 41134046978](https://github.com/FlareZ123/experiment-01/actions/runs/41134046978). These tests certify the inclusion-exclusion implementation on known exact cases, not card sequencing or a competitive game.

This probability estimates only a strict *opening-hand co-occurrence*, so it does **not** measure how often a good player should play the Item. It omits opponent mulligan bonus cards, all in-turn draw/search, any Trainer or donor already in play, discard target value/UDP, Prize configurations, support competition, lock effects and correct follow-up action choices. The actual human may decline to discard a particular donor based on matchup, and the retrieved card may be Prized. These figures are neither consistency success rates nor win rates.

## Strategic interpretation and prior art

A **~5–7.6%** first-hand coincidence means a narrow Regidrago donor discard line could be meaningful without dominating every opener. Midgame access and discard-benefit rates are unknown. The research-owned [Agent49 frontier](../../simulation/twinleaf/agent49-mysterious-treasure-frontier.cjs) requires a public Regidrago V/VSTAR board and an owner-visible discardable Dragon payload (or dead post-first-turn Battle VIP Pass), and is enabled only by an explicit optional root. It does not inspect the private owner deck before the actual prompted search.

The repository already contains a complementary [Agent9 generic Mysterious Treasure owner chain](../../simulation/twinleaf/agent9-mysterious-actor-chain.cjs) based on an extra Treasure or two Psychic Energy cards; it should **not** be overwritten or interpreted as disproved by this narrower donor-centric analysis. A future canonical two-seat chooser should compare their shared resource opportunity costs and preserve only actions that actually improve source-dealt games.

**Field qualification:** 29/32 authenticated original opponent 60s, zero competitively qualified games, no evidence for the 99.5% goal. The present calculation covers nine Regidrago source lists, not the full 32-opponent field.
