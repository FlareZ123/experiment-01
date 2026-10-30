# Agent22: before-search K0 expected marginal owner-deck access value

**30 October 2026. Mathematical model, exact hypergeometric Prize partition; not native gameplay or competitive performance.**

## Problem

A root chooser deciding whether to spend Steven's Resolve, Guzma & Hala or another scarce search connector cannot legitimately inspect unknown face-down Prizes or the physical owner deck before the first authenticated search. Existing `owner-k0-search-access.cjs` estimates probability that specified target classes survive in the unknown deck. The new `agent22-k0-search-bundle-value.cjs` estimates the **conditional expected value of the best accessible printed cards** for a narrowly specified *unrestricted owner-deck search that must select at least one card*, without reading any hidden physical positions.

It shares the existing research belief schema: `inventory.pool` is the unseen owner deck + unrevealed Prize multiset assembled from a known source list after removing observed physical zones, while `inventory.observedDeckPrintings` are cards with genuinely known owner deck membership. The caller must explicitly supply `uniformUnknownAllocation:true`. This premise asserts that every allocation of the `P` unknown Prizes among the unseen `N` cards is equally likely. It is **a conditional K0 belief, not permission to read private game-state truth**.

## Important paper-rule correction (30 October 2026)

The uploaded **Advanced Player's Rulebook v3.4 (2025)**, Section H, says unrestricted any-card deck searches must select the specified number. The newer Pokémon Professor Program explanation of the **February 2026** rulebook update clarifies that an effect searching for any card without a type restriction must select **at least one**. Steven's Resolve CES specifically searches for **up to three cards**. Therefore the current paper Expanded model enforces **one through three**, rather than treating a zero-card unrestricted search as optional. The developer source is [Pokémon Professor Program, February 2026 rule updates](https://professorprogram.pokemon.com/news/11473085), published February 26, 2026. The older supplied manual and newer clarification are separately identified because their minimum selection wording differs. The native Twinleaf prompt validator can be more permissive than this paper rule; accepting an empty native response is insufficient as paper-legality evidence.

The first version of this utility model incorrectly allowed selecting zero cards if all scores were negative. That version was superseded before any competitive-qualified games. Tests now require one selected card and negative utility when an unrestricted search has no positive reward.

## Exact calculation

For up to six positively weighted target printing names, enumerate the number of Prized copies `p_i` of each target. Let `K_i` be its unseen copy count, and `U=N-sum(K_i)` the unknown unweighted cards.

The exact number of equally likely Prize allocations associated with the vector is:

`ways(p) = choose(U, P-sum(p_i)) * product_i choose(K_i,p_i)`.

Every nonzero allocation vector is retained, and their BigInt counts must sum exactly to `choose(N,P)`. For each allocation, the owner deck has `known_i+K_i-p_i` copies of target i. The best compulsory selection of **at least one** and at most `maxCards<=3` is obtained by taking the highest marginal reward followed by additional positive marginal rewards:

`w(i)/(1+already-held(i)+copies-selected(i)) - perCardCost`.

The reward ordering is valid for this explicit **separable diminishing-return utility**, because each further copy of the same printing has no larger incremental reward than its predecessor. If all marginal rewards are negative, the paper unrestricted search still takes the best available one, so its conditional utility can be negative. Weighting the optimum by exact allocation probability gives the expected utility, the probability that positive utility is available, and the expected number of chosen cards.

This optimization assumes every selected card is independently eligible under the particular search. There is **no native prompt validator** here; search filters, card-type quotas, lock effects, Supporter contention, attacks, prize recovery, downstream action costs, the future value of a combo, and real opponent replies require additional models or actual native tests. Do **not** apply its output to a restricted Guzma & Hala category-specific search without an appropriate constraint model.

## Deterministic examples independently calculated

For unseen multiset A/B/C, one uniformly Prized card, one unrestricted search slot, and positive marginal values A=10, B=6:

- Prize A gives best available reward 6.
- Prize B gives best available reward 10.
- Prize C gives best available reward 10.
- Expected search value is **26/3**. With two search slots the three rewards are 6, 10 and 16, giving **32/3** and expected **4/3** cards chosen.
- If the actor already holds one A, its next-copy value becomes 5. The three possible best available payoffs become 6, 5, 6, giving **17/3** expected utility.
- For A/A/B and one Prize, an A always remains in the deck; maximum one-card utility stays **10** in every allocation.
- A known-in-deck A provides deterministic payoff 10 even if the remaining unknown pool consists of B/C with one Prized.

These values are exact conditional combinatorial facts *under the stated synthetic model*. They do not certify a card swap, a Supporter play or win probability.

## A published-source multiplicity illustration (explicitly hypothetical hand)

The rank7 Hiroto Fuji Snorlax Stall exact registered 60 contains **three VS Seeker PHF, three Counter Catcher PAR and two Capture Energy RCL**. Assume a hypothetical known seven-card opening hand contains **none** of those three printed target types, and the remaining **53** cards are uniformly allocated between a 47-card deck and **six** unknown Prize cards. Give those three printed types weights **10, 8 and 6**, respectively, with a per-selected-card cost of **1**, and allow a purely unrestricted search for up to three cards.

Independent exact multivariate hypergeometric enumeration over `choose(53,6)=22,957,480` allocations yields conditional expected marginal search score **9830137/468520 = 20.981254…**, and expected selection count **2459729/819910 ≈ 2.999999**. The chance that the deck contains at least one of each of the three target types is **1743729/1765960 ≈ 98.7411%**. These numbers use published multiplicities and a **synthetic hand premise**, not an observed rank7 starting hand.

Despite the high access probability under those artificial weights, the [retrospective authentic rank7 native search follow-through](../aichi-2026/agent22-rank7-steven-followthrough-retrospective-20261030.md) records no accepted post-search source-root **Counter Catcher** or **VS Seeker** play within its small set of capped, weak-bot trials. The conditional probability and replay observations concern **different epistemic settings and populations**; comparing them is a methodological illustration of how nominal search access can fail to predict actual resource use, not a causal performance estimate.

## Implementation and status

- `simulation/twinleaf/agent22-k0-search-bundle-value.cjs` exports `expectedK0UnrestrictedSearchValue`; BigInt exact combinatorial state counts reuse `redeal-posterior.cjs` `choose`.
- `tests/agent22-k0-search-bundle-value.test.cjs` checks the analytical examples, paper-mandatory one-card selection even with negative utility, empty-deck rejection, unknown-pool permutation invariance, explicit uniform belief premise, legal range and finite weight contracts. Numerical expected values were independently checked against brute-force enumeration of all small Prize combinations.
- The pre-K1 expectation is complementary to the [post-access marginal owner-hand bundle scorer](agent22-marginal-owner-search-value-20261030.md) and the [native exact rank7 search choice study](../aichi-2026/agent22-rank7-dealt-steven-paired-native-20261030.md). A real root chooser must compare its expectation **against a competing Supporter or no-Play line**, then prove the chosen resource was actually used on a later accepted owner root. An access score alone is insufficient.

**Competitive status unchanged:** exact original Aichi Top32 60s are available for 29/32 entrants; ranks 23,25,28 remain missing; zero qualified wins and no demonstrated fixed 60 at 99.5%.
