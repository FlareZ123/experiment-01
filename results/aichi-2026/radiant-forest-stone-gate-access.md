# Agent 10: Forest Seal Stone adds a distinct first-turn Radiant Gate resource route

**16 October 2026. Evidence:** exact prize-aware combinatorial enumeration, exhaustive miniature physical-card deals, seeded physical 60-card shuffle tests and [passing manual CI 38880795241](https://github.com/FlareZ123/experiment-01/actions/runs/38880795241). **Scope:** conditional opening resource opportunities for the unchanged rank-1 published Shadow Rider Calyrex deck. No competitive game wins or optimal decisions are established.

## Source card identities and practical line

The source [rank-1 deck](benchmark-shadow-rider.md) includes **1 Radiant Eternatus**, **1 Forest Seal Stone**, **3 Shadow Rider Calyrex V**, **4 Shadow Rider Calyrex VMAX**, **4 Mysterious Treasure**, **1 Quick Ball**, **1 Hisuian Heavy Ball**, and **10 other Basics**. The bundled English card data verifies Forest Seal Stone's Tool text ("the Pokémon V this card is attached to can use the VSTAR Power on this card") and Star Alchemy's search for any single deck card. Its VSTAR Power is limited to once per game. Radiant Eternatus's Climactic Gate may Bench two VMAX from the deck when the Radiant is played from hand onto the Bench, ending the turn if used.

Thus an additional source-valid *resource sequence* is: start with an ordinary Basic, see a Shadow Rider Calyrex V and Forest Seal Stone among the opening seven plus mandatory turn draw, put the V into play, attach Stone, use Star Alchemy to fetch unprized Radiant Eternatus, then Bench Radiant and activate Gate, provided there are at least two VMAX still in the deck. The sequence consumes the VSTAR Power and competes with alternative Star Alchemy targets. A Pokémon V found *only* by Star Alchemy cannot also be used to find Radiant with that same activation.

## Exact source-locked results

The model conditions on an accepted original opening seven containing at least one Basic. Six Prizes are unknown and the first ordinary turn draw is included. Other Basic starters (Shadow Rider V or one of the ten other Basics) must be in the original seven, since a forced-Active Radiant cannot trigger its Bench-entry Ability on this line. The same restricted calculation applies to either player seat.

| Event | Conditional probability |
| --- | ---: |
| Earlier opening hand / topdeck / Mysterious Treasure or Quick Ball / Hisuian Heavy Ball access | 52.20484477% |
| Same earlier routes, **two VMAX remaining in deck** | **50.65943762%** |
| Earlier routes **or** the directly held Stone + V route | 54.32482361% |
| Same union, **two VMAX remaining in deck** | **52.71560689%** |
| New Stone-only opportunities, excluding all previous access routes | 2.11997884 percentage points |
| New Stone-only opportunities with two VMAX in deck | **2.05616926 percentage points** |

The 50.65943762% baseline reproduces the independent [Agent 7](radiant-opening-and-prizes.md) and [Agent 10](../als/radiant-eternatus-opening.md) baseline within floating-point rounding. Stone gains are **disjoint** from earlier successful access routes, so existing Item routes are not counted twice.

## Exact computation

Partition the unchanged sixty-card deck into eight disjoint categories:

| Category | Count |
| --- | ---: |
| Radiant Eternatus | 1 |
| Forest Seal Stone | 1 |
| Shadow Rider Calyrex V | 3 |
| Shadow Rider Calyrex VMAX | 4 |
| Mysterious Treasure + Quick Ball | 5 |
| Hisuian Heavy Ball | 1 |
| Other eligible Basics | 10 |
| All remaining cards | 35 |

Enumerate every seven-card category composition, then each possible identity of the mandatory draw, and finally the number of Radiant and VMAX in six Prizes. Assign exact multiplicities by products of binomial coefficients. Reordering the random assignment of *the first turn draw* and *six Prize cards* for enumeration does not change their joint distribution. For each first-eight composition, the aggregate weight of a particular prized Radiant count r and prized VMAX count m is

\`C(remaining_R,r) * C(remaining_M,m) * C(other_unseen,6-r-m)\`.

The denominator before the legal-opening filter is \`C(60,7) * C(53,6) * 47\`. Every weighted count is an integer BigInt until the final ratio. The original Basic-opening acceptance rate is **86.1409319129%**.

Exact integer counts under the legal-opening condition:

| Count | Integer weight |
| --- | ---: |
| Valid starts | 358964655944294400 |
| Earlier baseline, two VMAX | 181849475973111180 |
| Union with Stone, two VMAX | 189230396895433644 |
| Additional Stone-only and two VMAX | 7380920922322464 |

## Reproduction

- [Exact source/category enumerator](../../scripts/radiant-forest-stone-access.cjs), Node.js 22 CommonJS.
- [Regression and independently ordered physical-deal tests](../../tests/radiant-forest-stone-access.test.cjs): confirms the old baseline, exact probability identities, every physical hand/Prize/draw assignment in a ten-card miniature, and 180,000 independently shuffled full-card deals.
- [Manual-only CI workflow](../../.github/workflows/radiant-forest-stone-access.yml); [first successful verification](https://github.com/FlareZ123/experiment-01/actions/runs/38880795241).

## Boundaries and research implication

The model requires Stone in the first eight, plus Shadow Rider V in the first eight and an alternate Basic starter in the initial seven. It omits other ways to find Stone or a V, Arven and other Supporters, first-turn draw Abilities, mulligan bonus draws, opponent lock effects, Item discard costs, whether VSTAR Power is better spent on a different card, Bench capacity beyond assuming two spaces, ability timing under lock, and play policy. It is not an upper or lower bound on genuine Gate activation, and the +2.05617-point resource gain does **not** imply a win-rate gain.

**Next useful experiment:** in a common-seed live Store replay, compare policy decisions in hands where the new Stone-only route exists. Measure whether using Star Alchemy for Radiant is better than using the same one-time connector for search, Energy, a tactical card, or lock response. Record whether the opponent can interrupt it. Source match strength must be evaluated separately.
