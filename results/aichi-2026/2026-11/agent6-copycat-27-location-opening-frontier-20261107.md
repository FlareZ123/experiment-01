# Copycat counterline: 27 exact initial hand, Prize and deck locations

**Agent 6 | 7 November 2026 | exact finite combinatorics, developmental only.**

The Aichi rank1 reference 60 and the Hood Shield candidate each contain 14 starting-eligible Basic Pokémon. The Temple candidate has 15. Each carries exactly one Mimikyu GRI58 Basic, Dialga-GX UPR100 Basic, and Hisuian Heavy Ball ASR146 Item. Printed identities and counts were independently established in [the initial Prize min-cut study](agent6-champion-copycat-two-basic-prize-mincut-20261107.md). This continuation resolves **all 27 labelled location states** of those three named cards immediately after a legal initial seven-card hand and six Prize cards.

The immediate Prize obstruction of 2.37% from the prior study hides an important implementation distinction. When **exactly one** of the Mimikyu/Dialga Basics is Prized and the Ball remains outside Prizes, the Ball may be **already held in the opening hand** or **still in the 47-card draw deck**. The latter demands subsequent draw/search access before the player can even attempt the Ball rescue. This is an initial card-location observation. It supplies no evidence that those subsequent actions are actually playable or strategically worthwhile.

## Exact opening probabilities

All percentages condition on drawing at least one Basic Pokémon in the starting seven. Opponent mulligan compensation cards, K1 deck-search knowledge, draw/search actions, legal Item opportunity, other Prize access, and attacks are excluded.

| Event | Rank1 / Hood (14 Basics) | Temple (15 Basics) |
| --- | ---: | ---: |
| Exactly one core Basic Prized, Ball **in opening hand** | 2.016149% | 2.033175% |
| Exactly one core Basic Prized, Ball **in draw deck** | 14.383282% | 14.421848% |
| Exactly one core Basic Prized, Ball **also Prized** | 1.558238% | 1.562553% |
| **Exactly one** core Basic Prized, total | 17.957670% | 18.017576% |
| **Both** core Basics Prized, Ball anywhere | 0.808671% | 0.815359% |
| Both core Basics in initial seven (no Prize obstruction) | 1.377325% | 1.344410% |
| Immediate **Prize-only** cut (both core Prized OR Ball Prized with exactly one core) | 2.366909% | 2.377913% |

Conditioned further on **exactly one core Prized and the Ball not Prized**, the Ball is already in the initial hand only **12.294020%** of the time for the 14-Basic original, or **12.355955%** for the 15-Basic Temple. For the other 87.71% / 87.64% of that conditional event, obtaining the Ball requires future access to its copy in the draw deck. This may happen through normal draws or other legal access paths. The model deliberately does not assert that any route succeeds.

## Exact method and reproduction

Let zones be **H** (initial seven), **P** (six Prizes), **D** (47-card remaining draw deck). Enumerate all \(3^3=27\) assignments of the singleton Mimikyu, singleton Dialga-GX, and singleton Hisuian Heavy Ball to H/P/D. For each assignment, enumerate how many of the other \(B-2\) Basics and \(59-B\) non-Basics occupy H and P. The total number of ordered hand-then-Prize deals is

\[
\binom{60}{7}\binom{53}{6}.
\]

If the assignment already has \(h\) named cards in the opening hand and \(p\) named cards in Prizes, and the unnamed Basic counts in those zones are \(x,y\), its valid hand-then-Prize combination weight is

\[
\binom{B-2}{x}
\binom{59-B}{7-h-x}
\binom{B-2-x}{y}
\binom{59-B-(7-h-x)}{6-p-y}.
\]

Count this term only when the opening contains at least one Basic, including any named Basic already assigned to H. Divide the sum of each named-card state over all valid-hand assignments. An independent enumeration in Python using integer \`math.comb\` and the repository's JavaScript \`choose\` calculation agree at the displayed precision. The 27 probabilities sum to one. The legality-conditioned total agrees with \(1-\binom{60-B}{7}/\binom{60}{7}\). The sum of both-core Prized plus single-core-and-Ball Prized reproduces the previous exact min-cut.

Reproducer: \`scripts/agent6-copycat-opening-locations.cjs\`. Pure Node test: \`tests/agent6-copycat-opening-locations.test.cjs\`. Four tests passed locally, covering exact 14/15-Basic numbers, zone exchange symmetry, normalization, min-cut consistency, and invalid input rejection. The code is CommonJS, makes no network calls, and leaves Twinleaf untouched. The committed text was independently tested with the same local implementation; a compiled native CI run is **not** claimed.

## Decision relevance and qualification limits

- The early-game **Ball-in-deck dependency** is much larger than the structural 2.37% immediate Prize cut, making it a useful resource-path and lock-sensitive action-realism research target. A count of theoretically retrievable Basics overstates automatic turn-level access.
- The 1.38% both-core opening-hand probability measures a distinct direct-possession event. It is **not** required for successful play, since subsequent draws, searches and discards often matter. In particular Dialga-GX must reach the appropriate zone for the proposed attack-copy sequence.
- Against Item lock, a physically held Ball may itself be unusable. Other Prize-recovery methods, already taken Prizes and alternate Regidrago match plans can circumvent these specific access dependencies. No field win or loss can be deduced from the percentages.
- The proposal is to instrument original-rank1 games with an opening-state annotation \`{mimikyuZone,dialgaZone,heavyBallZone}\` followed by actual K0/K1 search, Ball acquisition, usable Item window, and opponent reply, and measure the observed line completion separately from the structural category. No deck change is recommended on this evidence alone.

**Overall research status:** 29/32 original opponents have authenticated name/count sixties; ranks 23, 25 and 28 remain missing. No competitively qualified games, no selected final fixed 60 and no demonstrated 99.5% field win rate.
