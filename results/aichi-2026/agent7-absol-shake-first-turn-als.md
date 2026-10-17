# Rank-11 first-turn Garbotoxin: source plan and simulation warning

**Agent 7, 17 October 2026.** [First-person May 12 account](https://note.com/watayowatayoni/n/n464ff659a257) by わたよ describes a Mega Absol/Garbodor list with two Oranguru V, two Boost Shake, two Forest Seal Stone and two Shopping Center. That package matches the published final **rank-11 Wataru Yano list**. The author's rank-eight statement refers to the Swiss preliminary standing. It must not be confused with final rank-eight Yusuke Kobayashi.

The documented planned line is `Active Oranguru V Back Order → Forest Seal Stone → Star Alchemy → Secret Box → Boost Shake + Float Stone → attach Tool to Trubbish → Boost Shake evolves Trubbish into Garbodor`. The intent is opening-turn Garbotoxin, followed by turn-two Marnie and Claw of Darkness. The player reports completing opening Garbodor in nearly every tournament match, but provides no full independent gameplay replay.

[Official Boost Shake card text](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/swsh7/229/) permits first-turn evolution, including a newly played Basic, and ends the turn. Thus the Tool must be attached before Shake. Back Order needs Oranguru Active; Secret Box demands three other cards discarded; Trubbish must be accessible, and Garbodor must remain available to search. The article identifies Shopping Center as a Tool retrieval method for disabling one's own Garbotoxin on later turns. These are costs and timing constraints that a decision model must represent.

The previous simple turn-two opening probability report omits this crucial first-turn ALS. Its narrow event remains arithmetically valid but cannot represent the deck's intended opening speed.

## Exact direct-only first-turn resource opportunity

[Exact BigInt model](../../scripts/aichi-absol-boost-shake-direct.cjs) with [tests](../../tests/aichi-absol-boost-shake-direct.test.cjs) enumerates a valid opening seven, first draw, and all six Prize cards. It requires Trubbish, Float Stone, Boost Shake visible by the first draw, with at least one Garbodor left in deck.

| Final rank | Shake copies | Conditional direct access |
| --- | ---: | ---: |
| 8 | 1 | 1.34893377% |
| 11 | 2 | 1.93831587% |
| 16 | 2 | 2.54619736% |
| 22 | 0 | 0% |

All source counts and exact fractions passed [manual CI 39042675600](https://github.com/FlareZ123/experiment-01/actions/runs/39042675600). This counts only direct hand availability; Oranguru, Quick Ball, Battle VIP Pass, Star Alchemy and Secret Box search greatly enlarge the opportunity. It is no full line-execution probability.

## Actual source-60 pilot exposes weak-bot inability

[The source-pilot runner](../../simulation/twinleaf/absol-hardmatchup-source-pilot.cjs) passed [compiled manual CI 39042133324](https://github.com/FlareZ123/experiment-01/actions/runs/39042133324), with [archived eight-game JSON](https://github.com/FlareZ123/experiment-01/actions/runs/39042133324/artifacts/12103783612). One decorrelated seed in each physical seat against each final rank 8, 11, 16 and 22, under pinned Twinleaf and generic SimpleTacticsAi, produced eight finished games: seven reference Shadow Rider engine winners, one rank-11 Absol opponent engine winner. **Zero are qualified for competitive strength.**

The rank-11 opponent actually went first in the game where Shadow Rider held physical seat B and the source seed was `1244180408`. The live opponent's first-turn decisions include **Back Order, Secret Box, Shopping Center, Retreat and Pass**, without playing Boost Shake. On Shadow Rider's next turn, the observed opposing board had Crobat V Active and Oranguru V Benched, both holding Float Stones, with no Trubbish or Garbodor. The opponent later won using Mega Absol after a slow development. In the other rank-11 pilot, first observed Tool-bearing Garbodor appears around global turn 14, many turns after the intended turn-one lock.

Other hard-matchup pilot failures expose similarly unrealistic choices. One rank-eight source opponent never attacked before losing; rank-sixteen opponents spent many turns on Terminal Period without reaching the advertised early lock. The seven nominal Shadow Rider engine victories **must not enter a competitive win-rate ledger**.

The immediate test is to capture the rank-11 opponent's own hand and full Secret Box prompt choices on the *exact* first-turn source state, identify the first failed requirement for Trubbish and Shake, and compare with a legal corrected decision followed by a real opponent response. The current report establishes a representative-strategy coverage blocker, and does not diagnose whether the original missed line was resource-forced or poor action evaluation. Full hidden-information, paper-effect and opponent-policy qualification remain outstanding.

**Frozen evidence:** Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; exact source 60s; `decorrelated-slots-v3` seeds; generic unqualified decision policy; eight finished engine games, **0 qualified competitive games**.
