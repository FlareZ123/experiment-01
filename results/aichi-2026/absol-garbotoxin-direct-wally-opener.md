# Absol/Garbodor first-turn Garbotoxin: direct opening route with Wally

**17 October 2026, Agent 8, invocation 202.** This report extends the existing exact Boost Shake analysis in [aichi-absol-boost-shake-direct.cjs](../../scripts/aichi-absol-boost-shake-direct.cjs) by modeling **Wally as an additional immediate Stage 1 enabler when going second**. The candidate under evaluation remains the fixed rank-1 Shadow Rider reference. These are opening-access probabilities, **not** win probabilities or observed games.

**Compiled verification:** [Manual Aichi opening audit 39046678134](https://github.com/FlareZ123/experiment-01/actions/runs/39046678134) completed **successfully** from repository head **bb8155e5f50a5c0937f9973775df51644b432be1**. [Output artifact 12105553089](https://github.com/FlareZ123/experiment-01/actions/runs/39046678134/artifacts/12105553089), ZIP SHA-256 **05ca72b1bdb0abee98f2f0fa98a04b3afe87e2a924b8c6b04fcb0cce7a348d71**, contains exact machine-readable **absol-garbotoxin-direct-lock.json** and the pre-existing independent model's data. All six tests, including four-source BigInt equality, passed in this workflow.

## Exact source registrations

[Full published Aichi Top32 manifest](full-decklists.json), as presently available for ranks 8, 11, 16 and 22. Their card counts are source-specific. "Garbodor" below sums its LTR and BKP printings, each of which requires a Pokémon Tool for Garbotoxin.

| Aichi rank | Player | Basic Pokémon | Trubbish | Garbodor | Float Stone | Boost Shake | Wally |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 8 | Yusuke Kobayashi | 10 | 2 | 2 | 4 | 1 | 1 |
| 11 | Wataru Yano | 11 | 2 | 2 | 3 | 2 | 0 |
| 16 | Takumi Matsumoto | 11 | 2 | 3 | 4 | 2 | 0 |
| 22 | Haruya Mori | 12 | 2 | 2 | 4 | 0 | 1 |

## Definition and results

The exact event is: conditioned on the player's opening seven containing at least one Basic, the **first seven plus their first compulsory turn draw** contain Trubbish, Float Stone and at least one permitted first-turn Stage 1 enabler, while at least one Garbodor remains in the deck after setting six unknown Prize cards. The line is: put Trubbish into play; attach Float Stone to it; evolve to a deck-accessible Garbodor with Boost Shake (which ends the turn), or with Wally on the second player's first turn. This represents *potential direct access* under an uncontested board.

| Rank | Acting first: Boost Shake only | Acting second: Boost Shake or Wally | Wally-related gain when acting second |
| ---: | ---: | ---: | ---: |
| 8 | **1.34893%** | **2.57604%** | +1.22711 percentage points |
| 11 | **1.93832%** | **1.93832%** | 0 |
| 16 | **2.54620%** | **2.54620%** | 0 |
| 22 | **0%** | **1.24959%** | +1.24959 percentage points |

The going-first player cannot play Supporters on their first turn under current rules, including Wally, despite the old printed wording that permits evolution on the first turn. The going-second player can use Wally's printed first-turn evolution exception. See [Pokémon's rules PDF](https://www.pokemon.com/static-assets/content-assets/cms2/pdf/trading-card-game/rulebook/par_rulebook_en.pdf), [Wally's current card listing](https://limitlesstcg.com/cards/ros/94) and the [documented Wally-specific post-2020 ruling](https://bulbapedia.bulbagarden.net/wiki/Wally_%28Roaring_Skies_94%29).

## Exact method

The [source-rank script](../../scripts/absol-garbotoxin-direct-lock.cjs) enumerates six mutually exclusive card populations: Trubbish, evolution-enabling Trainer, Float Stone, Garbodor, other Basics, all other cards. It enumerates multivariate-hypergeometric opening-seven counts with at least one Basic, then the compulsory eighth draw from the remaining 53 cards. After those eight cards, for the unseen Garbodor count g, it multiplies by the probability that six Prizes do not contain *all* remaining copies:

- P(at least one Garbodor left in deck | g unseen) = 1 - C(52-g, 6-g)/C(52, 6).
- Final result conditions on a Basic-containing seven: divide by 1 - C(60-B, 7)/C(60, 7), with B the source-list Basic count.

This matches the repository's pre-existing, independently implemented **BigInt** [Boost Shake direct-access model](../../scripts/aichi-absol-boost-shake-direct.cjs) in all four source registrations. [Regressions](../../tests/absol-garbotoxin-direct-lock.test.cjs) check exact source quantities, impossible events, going-first Wally exclusion, and agreement with the independent implementation. The separate source BigInt program [also models first-eligible normal evolution on turn two](../../scripts/aichi-absol-garbotoxin-window.cjs); that is a different access event and must not be compared numerically to this first-turn line.

## Scope and strategic consequence

This strictly limited calculation omits search and draw engines (Quick Ball, Ultra Ball, Battle VIP Pass, Secret Box, Forest Seal Stone, Oranguru and other connectors), opponent mulligan bonus cards, Item/Tool/Supporter lock, prize recovery, board occupation, player decisions, attack/Ability suppression, and whether enabling Garbotoxin is even the best choice. The real rate of **getting Garbotoxin online** in a competent match cannot be estimated from these values alone.

The direct path is particularly sensitive to first-player status in the rank-22 source: without Boost Shake it lacks a direct first-own-turn Garbotoxin evolution when playing first, while rank-22's single Wally provides a direct route when playing second. Rank 8 gains a second enabler in that seat. This creates useful source-specific test cases for any opponent decision policy: correctly distinguish Wally's going-first prohibition, its going-second first-turn permission, Trubbish Tool attachment before Boost Shake ends the turn, Garbodor access after the Prize deal, and opponent ability-lock response.

No actual source-dealt game was qualified or played by this mathematical audit. **Competitive qualified games remain zero, with 29/32 exact field lists and no demonstrated 99.5% win rate.**
