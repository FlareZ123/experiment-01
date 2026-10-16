# Solo Snorlax Block: source-locked opponent exposure and Hood escape resources

**Agent 19, 16 October 2026.** Source: [29 printed Aichi Top 32 lists](full-decklists.json) from [Limitless event 566](https://www.limitlesstcg.com/tournaments/566/decklists). Reproducible [enumerator](../../scripts/aichi-snorlax-solo-block.cjs) and [regressions](../../tests/aichi-snorlax-solo-block.test.cjs). Manual [benchmark CI 38839592103](https://github.com/FlareZ123/experiment-01/actions/runs/38839592103) passed at commit `7811c994372f8e32565a7786cc7e0e5a24bcc543`.

## Why the single-Active opening matters

Both published Snorlax Stall lists contain **Snorlax PGO 55**, whose *Block* Ability prevents the opposing Active Pokémon from retreating while Snorlax is Active. The player may put an eligible Basic Snorlax in their own Active Spot during setup and decline to place other Basics on the Bench. If the opposing Bench is empty, the printed Guzma line cannot begin its required first step of moving an opposing Benched Pokémon Active. Float Stone and Latias ex's free-retreat assistance only affect retreat **cost**, so they cannot override the categorical prohibition on retreating.

Acerola can return an eligible damaged own Pokémon and its attached cards to hand, potentially opening a different line, but requires its damage condition. In a clean undamaged Active state against a passive Block, it provides no immediate escape. Opposing attacks, evolving, using other effects to remove Snorlax, KOing Snorlax, and draw/search sequences are outside this narrow analysis. Solo Block is therefore a meaningful constraint to analyze, **not evidence of a forced loss or permanent lock**.

Stealthy Hood's text protects its attached Pokémon from effects of opposing Abilities. Against *Block* specifically, a usable Hood on the trapped Active should make retreat legally available subject to other retreat requirements and any additional prohibitions. In contrast, Tool Jammer on the opposing Active Pokémon suppresses opposing Active Pokémon Tools, including Stealthy Hood, while applicable. Both published stall lists carry one Tool Jammer. This is a printed-text, state-dependent counterplay hypothesis; an end-to-end pinned-engine legal-retreat fixture remains to be executed before claiming implementation fidelity.

## Exact published inventories and conditional opening opportunities

| Opponent rank | Snorlax PGO copies | Total opening Basics | P(Snorlax in valid starting seven) | Tool Jammer | Faba | Megaton Blower | Field Blower |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 3, Haruto Miki | 3 | 11 | 40.56561% | 1 | 1 | 0 | 0 |
| 7, Hiroto Fuji | 2 | 12 | 27.36369% | 1 | 2 | 1 | 1 |

The probability conditions on having drawn at least one Basic in the initial seven. The Snorlax lead event is **feasibility**: if a Snorlax appears, its pilot may choose it as the Active and leave the Bench empty. It excludes opponent setup, prizes, mulligan bonus draws, later search, Supporters, planned opponent decisions and actual Block activation persistence.

Let `C(n,k)` be the binomial coefficient, `s` the Snorlax count and `b` the Basic count in a 60-card source list:

`P(Snorlax in seven | legal seven) = [1 - C(60-s,7)/C(60,7)] / [1 - C(60-b,7)/C(60,7)].`

A feasible Snorlax lead does **not** imply the player will choose it. Its true adoption frequency requires a validated opening policy and matchup decisions.

## Fixed candidate inventory

| Fixed candidate | Starting Basics | Guzma | Acerola | Float Stone | Stealthy Hood | Switch, Switch Cart, Escape Rope, Jet Energy |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Champion reference | 14 | 1 | 1 | 1 | 0 | 0 each |
| Hood Shield v1 | 14 | 1 | 1 | 1 | 2 | 0 each |
| Temple v1 | 15 | 1 | 1 | 1 | 0 | 0 each |

The two Hood copies in Hood Shield v1 give **21.13991%** probability that at least one Hood appears in an initial seven containing a Basic. That is direct access only, leaving all Arven and other draw/search routes out of the numerator. Conditional on a legal initial seven, the probability that **both copies** lie in the six unknown Prize cards is **0.85842%**. These events are different: the first describes one immediate possible protective tool; the second describes complete Prizing of the package, before any Prize-taking effects.

For `h` Hoods and `b` Basic cards, because these labels are disjoint:

`P(Hood in legal seven) = [1 - C(60-h,7)/C(60,7) - C(60-b,7)/C(60,7) + C(60-b-h,7)/C(60,7)] / P(legal seven).`

`P(all h Hoods in six Prizes | legal seven) = [C(6,h)/C(60,h)] × [1-C(60-h-b,7)/C(60-h,7)] / P(legal seven).`

The source inventory also confirms rank 7 has three Counter Catcher and rank 3 two, so even a one-Active situation can change after opponent-induced switching if legal. Opponent benches, gusting, attached Tool location, damage status, and setup policy must all be included in any realistic board model.

## Interpretation

Hood Shield v1 contains an additional credible response *category* to a solo Block Active that the champion and Temple inventory lack. It costs two fixed slots and has known counteranswers in both source lists, so this is **no comparative deck endorsement**. Tool Jammer, Tool removal, future search, Prize risk, Bench availability, other Ability lock, and opponent adaptation alter the line's active-move realism. A successful full-match response must actually deploy Hood to the relevant Active and legally retreat before the opposing game plan converts the stall to a win.

The next experiment should test a pinned Twinleaf Store state at minimum in four configurations: no Hood/Tool Jammer, Hood only, Hood plus opposing Active Tool Jammer, and Hood while the opponent has a Bench. Observe legal retreat resolution, not merely a displayed retreat cost. After those conditional mechanics pass, test realistic sequencing against ranks 3 and 7 with both the control opponent policy and the candidate policy instrumented.

No match win rate has been measured; the 99.5% objective remains unsubstantiated.
