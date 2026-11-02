# Hard-cluster Garbotoxin: exact literal first-turn Boost Shake opening

**Agent 4 | 2 November 2026 | exact combinatorial research, not native games.**
This study targets four original Aichi Open League 2026 Absol/Garbodor printed 60s, ranks **8, 11, 16 and 22**, which the 18:30 Critic identified as an underrepresented hard matchup cluster. The aim is to set a realistic opportunity denominator for a precisely described first-turn Ability-lock line and avoid treating small native samples as proof the source policy lacks the line. **Zero whole-paper competitive games are qualified.**

## Exact line and source inventory

The literal line is **Trubbish in play -> Float Stone attached -> Boost Shake from hand searches a Garbodor still physically in the deck, evolves Trubbish and ends the turn -> Garbotoxin becomes active**. Boost Shake EVS 142 explicitly permits first-turn or same-turn evolution; the Advanced Player's Rulebook confirms attached Tools remain through evolution. The supplied card archive prints Garbotoxin on Garbodor LTR 68 and BKP 57. This is raw **opportunity** accounting: an opponent's Item lock, opposing effects, the action-selection policy and all other game-state restrictions may prevent or alter actual execution. The self-lock can also disable the source's own valuable Pokémon Abilities.

| Rank | Printed-60 SHA-256 | Trubbish | Float Stone | Boost Shake | Garbotoxin Garbodor | Total Basic |
| ---: | --- | ---: | ---: | ---: | ---: | ---: |
| 8 | 6d955f821a0ae206110189adf53621a29c2d49afdeade1206dee46a2a50f8541 | 2 | 4 | 1 | 2 LTR | 10 |
| 11 | d0d46361d79e93b4f4a2da061fed10b474cf5bc10909225983c81acb040d6258 | 2 | 3 | 2 | 2 BKP | 11 |
| 16 | 2de4e0481b76278020b1221a25458ab1783cb1edd5f19af3b83596af7262f733 | 2 | 4 | 2 | 2 LTR + 1 BKP | 11 |
| 22 | 9a3b5299ed6c45860904619b7be29785a2c8e4cca898ef8800dc24b4340e775e | 2 | 4 | **0** | 2 BKP | 12 |

Source is [original unchanged 60s](full-decklists.json) and [printed-identity ledger](original-printed60-admission-v1.json). Basic classifications of these four small Pokémon inventories were cross-checked against the supplied English card archive. Do not generalize the rule "every listed Pokémon except Garbodor is Basic" to other decks.

## Exact probability and assumptions

Condition on **one valid initial seven-card hand**, then six random face-down Prizes from the remaining 53 and one turn-one draw from the remaining 47. Accept **zero optional opponent-mulligan bonus cards**. A source opportunity is counted iff, by the first owner's turn, all three distinct needed card names appear among the owner's eight visible hand cards and at least one suitable Garbodor remains *in the searchable deck*, rather than in hand or among the six Prizes. Trubbish can be the initial Active or a Bench Pokémon. No automatic search/draw acceleration is modeled.

The calculation partitions the physical 60 into six disjoint categories: Trubbish, Float Stone, Boost Shake, Garbodor, other Basic, other card. Let h be their counts in the owner's unordered eight-card sample. Each composition has weight product of binomial coefficients C(population_i, h_i). Among the eight equally likely choices of which card was drawn last, **7/8** of samples with exactly one visible Basic have a valid initial seven; samples with two or more visible Basics have **8/8** valid choices. For a given h with g Garbodor already in hand, all remaining G Garbodor are Prized in C(52-(G-g),6-(G-g)) of the C(52,6) Prize placements. Subtract those failures. Divide by P(valid initial seven) = 1 - C(60-B,7)/C(60,7). Every combination and numerator is exact BigInt before decimal conversion.

| Rank | P(valid initial seven) | P(literal line given valid seven) | Exact rational conditional probability | P(at least one in four independent valid starts) |
| ---: | ---: | ---: | --- | ---: |
| 8 | 74.13708% | **1.34893377%** | 2661125507 / 197276216280 | 5.28754% |
| 11 | 77.75789% | **1.93831587%** | 68180030335 / 3517488113568 | 7.53074% |
| 16 | 77.75789% | **2.54619736%** | 13570028727 / 532952744480 | 9.80236% |
| 22 | 80.93533% | **0%** | 0 | 0% |

The rightmost column assumes **four independently shuffled openings**. Four candidate-versus-reference games sharing two original-source physical deals contain only **two independent source openings**, and must not use that four-opening column as a native cohort estimate. The Rank-22 zero says *only* that the Boost Shake route is unavailable from its printed list. Natural next-turn evolution, other search and different control routes remain possible.

## Strategic and experimental consequence

The strongest literal route still appears in only about **one of 39 valid rank-16 opening deals**. Ranks 8 and 11 are rarer still. Consequently, failure to observe a first-turn Float Stone / Boost Shake Garbotoxin activation in a four- or eight-arm native canary is compatible with the printed list even if the source policy is perfect *for this one literal line*. A policy can establish Garbotoxin through searched Items, direct drawn Garbodor on the following turn, other resource paths, or altered turn sequences, none of which this narrow probability measures.

For the next hard-cluster native release, distinguish these stages in the same physical-deal lineage: (1) owner-visible literal opportunity, (2) other owner-visible legal search paths and target Garbodor in deck, (3) chosen Trubbish/Tool/Boost Shake sequence, (4) native paid Item and evolution settlement, (5) Garbotoxin actually active and any source self-lock, (6) opponent consequential action and resulting qualification status. Stratify observations by rank; a generic "Absol/Garbodor opponent" masks meaningful source differences. Rank 8 is the high-priority missing original-source cohort per the Critic, while rank 22 requires a separate non-Boost-Shake opening-policy model.

## Reproduction and limits

- [Exact Node.js CJS BigInt enumerator](../../scripts/agent4-garbotoxin-literal-open.cjs), reading the original roster and asserting all four source lists total 60.
- [Five pure regressions](../../tests/agent4-garbotoxin-literal-open.test.cjs) cover exact binomial counts, the three reduced exact fractions, the zero-Boost-Shake case, monotonic Garbodor deck access and fail-closed source Pokémon classification. Locally all **5/5 pass** on Node v22.16.0. The numerical fractions were also independently evaluated by a separate Python exact-integer combinatorial script.
- No Twinleaf/native gameplay or GitHub Actions run was performed for this study; it establishes no action-policy competence, source attack, candidate success, matchup performance or win rate.
- Broader search access, card discard ability, opponent Item lock and bonus-mulligan draws are excluded deliberately. Use existing native source witnesses for those questions.

**Global decision status stays 29/32 authenticated original sixties, zero qualified full-paper competitive games, no justified fixed 60 at 99.5%.**
