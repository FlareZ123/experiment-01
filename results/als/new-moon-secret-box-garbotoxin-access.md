# New Moon versus early Garbotoxin: Secret Box raises first-response Field Blower access

**Agent 9, 18 October 2026.** Evidence type: exact conditional multivariate-hypergeometric combinatorics, source-locked card counts, independent shuffled-deal check and passing Node regression in a manual workflow. **No game was played or competitively qualified by this result.**

## Specific decision

The frozen [New Moon Lockbreaker v1](new-moon-lockbreak-60-candidate.md) carries two **Field Blower** (GRI 125) and one **Secret Box** (TWM 163, ACE SPEC). Its previously established [direct-access calculation](new-moon-lockbreak-60-candidate.md#mathematical-early-access-severe-limitation) gives only 24.3764594% visibility of a Field Blower in the legal opening seven plus the next compulsory draw. That misses an Item-to-Item search path: [Secret Box](https://asia.pokemon-card.com/sg/card-search/detail/12644/) permits discarding three other cards from hand to search for an Item along with other distinct card categories. An unprized Field Blower can be the Item selected.

This is particularly relevant if the opponent establishes an early Tool-equipped **Garbodor** with **Garbotoxin**. Agent 6's [rank-11 source fork](../aichi-2026/rank11-firstturn-boostshake-source-fork.md) supplies a genuine source-dealt first-turn lock opportunity; Agent 7's [Shadow Rider response analysis](../aichi-2026/rank11-garbotoxin-field-blower-response.md) shows why Blower access and subsequent retooling matter. The calculation below conditions on **Items being playable**. It cannot rescue a simultaneous Item lock.

## Frozen event and exact probabilities

Source-lock: [60-card candidate manifest](new-moon-lockbreak-english-proxy-60.json), sorted English proxy ID/count SHA-256 `a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4`.

Population: **17 Basic Pokémon**, **2 Field Blower**, **1 Secret Box**, and **40 other cards** in the fixed 60. Draw seven cards with at least one Basic, set six uniformly unknown Prizes from the remaining 53, and take the first mandatory draw from the other 47. The probability space is **conditioned on a legal initial seven**; repeated candidate mulligan hands and optional opponent-mulligan bonus draws are excluded.

| Disjoint first-response resource event | Exact conditional fraction | Probability |
| --- | --- | ---: |
| A Field Blower is already among the eight observed cards | 416435 / 1708349 | **24.3764593769%** |
| No Blower observed, Secret Box observed, and at least one Blower unprized | 49452231 / 493712861 | **10.0163951370%** |
| **Either of the two routes** | **169801946 / 493712861** | **34.3928545139%** |

The extra **10.0163951370 percentage points** results from a distinct, available search route. Both cards cannot be counted as independent successes when observed together: a hand already containing Blower belongs in the direct event. The resulting union is mathematically exact under this resource model.

## Proof sketch and reproduction

The first seven and first ordinary draw form an exchangeable unordered eight-card sample before the six Prize identities are assigned. For any feasible eight-card composition `(b,f,s,o)`, with Basic / Blower / Box / other counts summing to eight, its multiplicity is:

`C(17,b) C(2,f) C(1,s) C(40,o)`.

The chance that the first seven contain a Basic is **7/8** if exactly one Basic appears among these eight, **1** if two or more appear, and **0** otherwise. Multiply each composition by the corresponding factor and divide by `C(60,8)`, normalizing by `1-C(43,7)/C(60,7)` for valid opening hands.

Count a composition in the direct event when `f>=1`. The exclusive Secret Box route requires `f=0,s=1`. In that case both Blowers remain among the other 52 unknown cards before setting Prizes. Exactly `C(50,4)` of the `C(52,6)` six-card Prize subsets contain **both** Blowers. Therefore Secret Box has an unprized Blower with probability `1-C(50,4)/C(52,6)=437/442` in that exclusive case.

The exact `BigInt` reproducer is [new-moon-secret-box-blower-access.cjs](../../scripts/new-moon-secret-box-blower-access.cjs), using the shared source `choose` function. [Four regression tests](../../tests/new-moon-secret-box-blower-access.test.cjs) check the source hash, three exact fractions, Prize survival, independent direct calculation, disjoint additivity and zero-route controls. The existing **manual-only** opening audit [CI run 39090372678](https://github.com/FlareZ123/experiment-01/actions/runs/39090372678), head `3ff4435c64e4b33601e555395cd9a7010a5c4e0e`, **passed** all tests and preserved a machine-readable access output. No workflow runs on ordinary commits.

An independently written Python physical-deal check performed **250,000 seeded shuffles** of all 60 category-labeled cards (seed `20261018`), retaining **229,174** legal initial sevens. The observed conditional rates were **24.3614023%** direct, **10.0465149%** exclusive Box and **34.4079171%** union. This check placed six Prizes after the opening seven, then read the next draw, and tested for an unprized Blower; it was performed locally and is independent of the committed Node source.

## Active Move Realism, limits, and implication

- **Cost:** Secret Box requires three other hand cards to be discarded. If only one Basic is put Active, enough physical cards remain in hand to offer that cost, but **no DCI/AMR claim** has been made about whether those cards are strategically disposable. A route can be technically payable while making the deck lose its attack or recovery plan.
- **Timing:** An early first-own-turn Tool removal is one window. Source rank 11 was observed holding an additional Float Stone; retooling Garbodor on the next turn can restore its Ability lock.
- **Scope:** This counts only direct Blower and one Secret Box search. It leaves out other draw/search chains, extra mulligan draws, energy, Bench/Tool constraints, selection of the other Secret Box categories, an opponent's Item lock, policy choice, and any actual attack.
- **Interpretation:** **34.3929% is neither a total response success rate nor a game-win probability.** It is a conditional first-eight-card access opportunity under explicitly favorable Item-play assumptions. It does not provide comparative deck-strength evidence against the rank-1 or Hood lists, whose Basic counts and connectors differ.

**Next falsification:** On a genuinely dealt New Moon versus published rank-11 opener with Tool Garbodor, run a frozen automatic policy that weighs Secret Box's three-card discard cost and a competing first-turn attack. Preserve which Blower is unprized as K0 uncertainty until legal deck search, verify exact Store actions, and evaluate an opponent's held Float Stone retooling response. One synthetic search-availability rate must not be promoted to a matchup win.

**Field status: 29/32 known exact source 60s, zero competitively qualified games, no demonstrated 99.5% win rate.**
