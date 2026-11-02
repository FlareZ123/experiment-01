# Agent 32: exact Prize-aware G&H/Tag/Artazon access to Bunnelby double Evolution

**2 November 2026 | exact combinatorial resource access for a fixed 60 | no native games or qualified wins.**

## Question and source

The original Aichi rank-2-derived [Exeggutor/Vileplume exploratory v2 sixty](agent18-exeggutor-vileplume-native-v2.json) contains 4 Guzma & Hala, 4 Tag Call, 2 Artazon, 2 Technical Machine: Evolution, 2 Bunnelby, 2 Oddish, 2 Exeggcute, 2 Exeggutor, 2 Gloom, 2 Vileplume AOR and 3 Jet Energy. Agent40's [staged native test](agent40-exeggutor-blockade-two-turn-native-and-direct-access-20261102.md) verified the Bunnelby Omega Barrage double-Evolution mechanical chain, followed by later Jet promotion of Exeggutor for Blockade. Agent40's previous 0.037106703875% conditional physical access screen deliberately restricted its first nine owner cards to an untutored two-Jet/held-TM conjunction. This study analyzes a separate, source-specific G&H plus Artazon search route, with six Prize cards treated jointly with the eight visible owner cards.

## Exactly which opening event is counted?

The owner is going second. The initial seven plus the first ordinary draw must hold (i) a Jet Energy to reserve for the second own turn; (ii) a G&H Supporter, or Tag Call with G&H remaining in the deck; (iii) at least two distinct Basic species of Bunnelby, Exeggcute and Oddish. If all three are held, no Artazon is needed. With exactly two, Artazon PAL171 must be held or available in the deck, and the one absent non-Rule-Box Basic species must remain deck-searchable. The source deck after the opening eight and Prizes must also retain at least one copy each of the first-turn Jet to search, TM Evolution PAR178, Exeggutor PLF5, Gloom UNB7 and Vileplume AOR3. These are five disjoint physical search-target groups.

Under the absence of opponent interference, the owner could use Tag Call to obtain G&H if necessary, discard two other cards to obtain TM Evolution plus first Jet, use held or searched Artazon to Bench one missing Basic, and attach TM and first Jet to Bunnelby. Omega Barrage can use the Evolution attack twice, leaving Exeggutor and Vileplume on the Bench. The originally held Jet is conserved for the next own turn and can promote Exeggutor for Blockade. The eight-card hand has enough physical remaining cards for the two-card G&H payment after reserving the planned pieces. Strategic discardability, opponent response and actual native actions remain unmodeled. The separately published staged native test, rather than this access calculation, is the relevant mechanic witness.

## Exact probability conditioned on an initial Basic-valid seven

| Disjoint G&H resource route | Probability |
| --- | ---: |
| All three Basic species in first eight; held Jet, G&H/Tag and required search targets | **0.142687678536%** |
| Exactly two Basic species held; Artazon supplies the third; other search targets present | **2.258147510181%** |
| **Union** | **2.400835188717%** |

The union has reduced fraction **89,772,393,489,231 / 3,739,215,166,086,400**, or approximately one favorable physical card-location event in 41.65 Basic-valid opening hands. Its unconditional first-seven probability is **2.068101805253%**. Hands with G&H directly held account for **1.404916041359 percentage points**, and Tag-only hands requiring G&H in the deck account for **0.995919147358 percentage points**. These channels are disjoint.

The union is 16.83 times the all-three-Basics G&H event. Its numerical probability is about 64.70 times the earlier *different* untutored direct two-Jet screen; the events overlap and have different access definitions, so this comparison has **no win-rate or complete setup-rate interpretation**.

## Derivation

Partition the exact printed 60 into disjoint physical copy-count categories, in order: Bunnelby 2; Exeggcute 2; Oddish 2; G&H 4; Tag Call 4; Jet Energy 3; TM Evolution 2; Exeggutor 2; Gloom 2; Vileplume AOR 2; Artazon 2; Other 33. The owner has 14 Basics in total.

Under the authentic setup order of seven cards, six Prizes, then one draw, the unordered set H of the first eight cards and unordered disjoint Prize set P are jointly uniform. Each pair (H,P) has probability one divided by [C(60,8) times C(52,6)]. Every favorable H has at least two different Basic species, so removing whichever one was the eighth ordinary draw leaves at least one Basic in the initial seven. Consequently, conditioning on a Basic-valid initial seven simply divides by its exact probability 1 - C(46,7)/C(60,7) = 252032/292581.

For each first-eight category-count vector h, count its physical realizations by multiplying C(n_i,h_i). To compute Prize availability, define r_i as the count of each required search target outside H. Inclusion-exclusion over subsets S of target groups gives the number of Prize sets that do not exhaust any target:

A(h) = sum over S of [(-1) raised to |S| times C(52 - sum r_i in S, 6 - sum r_i in S)].

Use zero for impossible binomials. Include G&H among required deck targets when only Tag Call is held. In the two-Basic case also include the absent Basic species, and include Artazon when it is not already held. No statistical independence approximation is made.

There are **464** eligible grouped eight-card compositions for the three-Basic branch after separating Artazon, and **2,664** for the exactly-two-Basic branch. The shared total number of disjoint hand/Prize pairs is **52,089,733,645,349,400**. Exact favorable numerators are **64,024,791,791,328** for all three Basics and **1,013,243,930,079,444** for the Artazon branch; union **1,077,268,721,870,772**.

## Reproduction and scope

[Core grouped enumerator](../../simulation/evaluation/agent32-gh-prize-search-window.cjs), [five tests](../../tests/agent32-gh-prize-search-window.test.cjs), [Artazon union enumerator](../../simulation/evaluation/agent32-gh-artazon-prize-window.cjs), and [four tests](../../tests/agent32-gh-artazon-prize-window.test.cjs) verify exact source printed-copy counts, integer enumeration, and G&H/Tag partitions. Independently coded exhaustive literal physical-index enumeration on toy 16- and 17-card decks matches the grouped approach. Independent Python math.comb and Fraction code reproduced the rational results. A separate NumPy shuffle check with fixed seed 2026110206 and 500,000 randomly permuted 60s observed 596 three-Basic and 9,561 two-Basic-Artazon hits, versus exact expected unconditional probabilities 0.1229125% and 1.9451893%, consistent with sampling variation.

**Actual repository CI succeeded:** [manual workflow 41398700889](https://github.com/FlareZ123/experiment-01/actions/runs/41398700889), source head a1c281afd6e55ead92105b071c5ef7a1d7604c3f, executed both Node test files against the actual registered experimental 60. The named G&H/Artazon regression step and entire lightweight card-coverage job concluded SUCCESS. Zero native games were executed for this result.

This is a conservative, specifically enumerated **physical resource-access screen**. It omits mulligan bonus draws, alternative searches or extra draw, prohibiting opposing effects, public board sequencing, the cost of discarding strategically valuable cards, actual policy selection, opponent continuation, and paper time limit. It is neither an estimate nor a lower bound for full Blockade setup or game wins. The full-field challenge still lacks three authenticated exact original 60s (ranks 23/25/28) and has zero competitively qualified match results.

## One-card sensitivity of this exact access window

The separate [source-count-asserting counterfactual evaluator](../../simulation/evaluation/agent32-gh-artazon-slot-sensitivity.cjs) recomputes the same six-Prize first-eight event after a **one-card swap with the Other group**. The original Other group contains **eight non-target Basic Pokémon and 25 nonbasics**. Swapping another Basic for a target Basic preserves 14 Basics overall; swapping a nonbasic for a target Basic increases the count to 15, altering the Basic-valid-opening denominator.

| One-card modification | Basic total | Conditional route access | Relative to 2.400835% |
| --- | ---: | ---: | ---: |
| Nonbasic Other to fourth **Jet Energy** | 14 | **3.133374%** | **+0.732539 pp** |
| Different Basic to third Bunnelby, Exeggcute or Oddish | 14 | **3.068825%** | **+0.667990 pp** |
| Nonbasic Other to third Bunnelby, Exeggcute or Oddish | 15 | **2.995487%** | **+0.594651 pp** |
| Nonbasic Other to third TM Evolution, Exeggutor, Gloom or Vileplume | 14 | **2.470883%** | **+0.070048 pp** |
| Nonbasic Other to third **Artazon** | 14 | **2.422113%** | **+0.021278 pp** |
| Third Jet Energy to a nonbasic Other | 14 | **1.440231%** | **-0.960604 pp** |

The G&H and Tag Call four-copy sets cannot be increased under the ordinary deck limit. For this *particular* search-access event, Jet is the largest tested legal single-slot addition and Artazon's third copy has a small local marginal effect. The latter can be more valuable in actual games after Stadium removal or opposing constraints: the analysis excludes these possibilities and any opportunity cost of the removed card.

The [five independent tests](../../tests/agent32-gh-artazon-slot-sensitivity.test.cjs) verify source-category composition, exact probabilities, Basic-denominator differences, target-species symmetry and four-copy ceiling. Full [manual GitHub Actions 41400021623](https://github.com/FlareZ123/experiment-01/actions/runs/41400021623) ran all 14 exact-regression tests against the authentic source 60 at head bc042a6d3c5f5ef6a7b3964f774acd290b818aa7. The named test step and whole lightweight job passed.

**Scope:** a hypothetical one-copy gradient of physical resource access, with no complete alternative 60 nominated, no native games and no paper match wins measured.
