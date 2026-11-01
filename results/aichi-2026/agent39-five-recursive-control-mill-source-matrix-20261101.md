# Agent 39: five independently published mill-recursion sources with two different physical terminal races

**1 November 2026 | Evidence class: 29 exact original source 60s, printed rule text, deterministic counting and conditional exact Prize arithmetic. No native complete matches or qualified game wins.**

## Source census

The published Aichi Top32 dataset [`full-decklists.json`](full-decklists.json) contains **29** exact opposing sixties. Of those, **six** have one or more explicit mill Supporters (`Team Rocket's Handiwork` or `Bellelba & Brycen-Man`), and **five** have two distinct Lusamine copies plus at least one such Supporter:

| Original rank | Published archetype | Lusamine | Handiwork | Bellelba | VS Seeker | Prize retrieval |
| ---: | --- | ---: | ---: | ---: | ---: | --- |
| 2 | Vileplume Control | 1 | 0 | 1 | 0 | Gladion 1, Peonia 1 |
| **3** | Snorlax Stall | 2 | 1 | 0 | 3 | Gladion 1 |
| **6** | Iron Thorns | 2 | 1 | 0 | 3 | Gladion 1 |
| **7** | Snorlax Stall | 2 | 1 | 1 | 3 | Gladion 1 |
| **24** | Iron Thorns | 2 | 0 | 1 | 3 | Gladion 1 |
| **29** | Iron Thorns | 2 | 1 | 0 | 3 | Peonia 1 |

Thus **four** (3,6,7,29) have the same three-card two-Lusamine/Handiwork recursion resource, and **two** (7,24) have a different two-Lusamine/Bellelba recursion resource. Rank7 has both types, with significant context-dependent decision contention. These are physical registered inventory facts, not proof any loop is reachable in a natural tournament game. Missing exact ranks23,25,28 are excluded.

## Mechanics and the key difference

Original `Team Rocket's Handiwork FCO112` mills **two cards from the opponent's deck per heads** on two independent coin flips. [The exact conditional source-rank6 construction](agent39-rank6-lusamine-handiwork-control-horizon-20261101.md) produces an attempted mill variable `M=2 Binomial(2k,1/2)` after `k` plays. It spends two Supporter permissions per Handiwork in the two-Lusamine cycle, plus the turn-start draw budget and the turns needed to initially position all three cards.

Original `Bellelba & Brycen-Man CEC186` instead puts **three cards from the top of each player's deck** into their respective discard piles. A repeated Bellelba line therefore shortens both deck stocks simultaneously. In a simplified interval containing `k` Bellelba effects with adequate card supplies, the equal `-3k` change preserves the **signed difference between owner and opponent deck size at matched phase**. Once either deck is low, truncation and the alternating player's next mandatory draw determine the actual outcome. It is not automatically superior to Handiwork's stochastic opponent-only mill: if the controller's deck is already shorter, symmetric milling can hasten its loss. If the opponent's deck is shorter, it can accelerate the opponent's failed-draw condition, provided the controller gets through its current mandatory draw. Rank7's mixed printing permits a branch choice; rank24 has the symmetrical source without Handiwork.

This distinction changes valid opponent tactics and benchmark evidence. A source control bot needs an owner-visible **two-deck count comparison**, compulsory draw steps, clock and exact available Supporter responses. An attack-only or flat mill-count scorer will not capture the relevant survival race. Conversely, our probability approximations do **not** show that mill is preferable to attacking, Energy denial or trapping in any actual source state.

## Single-Gladion versus recoverable-Peonia Prize frontier

Ranks3/6/7/24 each contain one Gladion. Its printed effect allows **looking through all face-down Prize cards, taking one selected Prize, and shuffling Gladion into the Prizes**. It can directly target a known Prized Lusamine/Handiwork after one deck search but can rescue **at most one** core member through that copy if the deck never takes a Prize and has no other Prize effect. For three critical physical copies in original rank6, 6/60 uniform Prizes, the exact fraction with **at most one** core inaccessible and available Gladion when needed is **95.37358885%**. See the [independent three-core combinatorics](agent39-rank6-lusamine-handiwork-control-horizon-20261101.md).

Original rank29 instead registers **Peonia CRE149** (one) and **zero Gladion**. Its printed effect takes *up to three face-down Prize cards* into hand and replaces each with a chosen card from hand, leaving the Prize stack unshuffled. The player may know *which* core cards are Prized after a legal deck search, but that does **not** reveal their starting Prize-slot positions. One blind three-of-six Peonia choice is qualitatively different from Gladion's targeted retrieval. There are four physically important cards: L1, L2, H and Peonia itself.

The following deliberately idealized rank29 source arithmetic conditions on a uniform random six-Prize set and treats the first blind Peonia three-slot selection as uniform among its 20 possible three-position selections. It assumes adequate replaceable owner-hand cards and no earlier Prize movement.

| Conditional structural accessibility | Exact favorable cases | Fraction |
| --- | ---: | ---: |
| No L1/L2/H initially Prized | 36,288,252 of 50,063,860 Prize sets | **72.48392753%** |
| Every initial Prized core found by **one** blind three-slot Peonia selection, if Peonia is not Prized | 844,794,720 of 1,001,277,200 Prize-set/selection paths, including the no-core case | **84.37171245%** |
| Every initial Prized core *potentially* recoverable through **two** complementary Peonia selections of original Prize slots, if Peonia itself remains available | 48,877,290 of 50,063,860 Prize sets | **97.62988711%** |
| Peonia itself and ≥1 essential core simultaneously Prized (no self-rescue possible via Peonia alone) | 1,186,570 of 50,063,860 Prize sets | **2.37011289%** |

The one-selection path numerator follows

`20 C(57,6) + sum_{x=1}^3 C(3,x) C(56,6-x) C(6-x,3-x) = 844,794,720.`

For a second Peonia visit, the owner can choose the other three original Prize positions after the first three are replaced by known, safe hand cards, provided Peonia can be **recovered from discard** (for example via Lusamine) and played on a later turn, the owner has enough safe payment replacements and the Prize pile has not been randomized or otherwise changed. The 97.63% is an **idealized structural frontier**, not a measured success probability or bound on games: the same cards compete for Supporter turns and may never be accessed in time. The first Peonia use takes one Supporter, retrieving it with Lusamine takes another, and the second Peonia takes a third, further delaying Handiwork control. If Peonia itself is Prized with a core, other Prize-taking and effects might still provide access, so this is only an obstacle for a **no-Prize-taking, Peonia-only** rescue plan.

**Rules qualification:** The supplied Advanced Player's Rulebook section E-34 requires respecting face-down Prize choice, and section E-35 clarifies that an instruction to shuffle face-down Prize cards loses known position information. Peonia's printed text does not direct such a shuffle. A true K0/K1 paper player may only use actually observed identities and positions; a simulator that peeks at hidden Prize identities when selecting Peonia slots leaks information and overstates its accessibility.

## Benchmarks and immediate policy implications

The single fixed-deck optimization needs a **single common opponent evaluation profile** with these five engines recognized as separate potential win conditions, contingent on their actual physical hands, Prized card recovery, lock plans and the opponent's possible answers. In particular, benchmark ranking must not promote a candidate based on 'no attack' from original rank24 or rank29: the control player could be seeking a mill terminal. Keep separate witnesses for actual presented Supporter options, physically accepted Lua/Handiwork/Bellelba/Peonia actions, card conservation, opponent draw failures, turn count, official paper match clock and win adjudication. Reconcile cancellations and all censored/error arms.

Reproducible source census and exact BigInt combinatorics: [`agent39-original-control-mill-census.cjs`](../../scripts/agent39-original-control-mill-census.cjs), [four Node22 tests](../../tests/agent39-original-control-mill-census.test.cjs). The associated [owner-visible rank6 selector](../../simulation/twinleaf/agent39-rank6-control-owner-selector.cjs) is a pure default-off policy interface with no native Store match qualification.

**Current release status remains 29/32 authenticated original 60s, zero competitive-qualified games, and no demonstrated 99.5% fixed 60.**
