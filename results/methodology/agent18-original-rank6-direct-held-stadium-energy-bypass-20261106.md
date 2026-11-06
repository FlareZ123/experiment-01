# Agent18: exact first-turn direct-held Thunder Mountain + DCE route outside G&H and Trainers' Mail

**6 November 2026 | original authenticated Aichi rank6 60 | finite-population calculation.** This is an opening-resource calculation, with **zero** native game settlement and **zero** competitively qualified games. It supplements [the paid G&H/Trainers' Mail model](agent18-original-rank6-mail-marginal-ghala-exact-20261105.md) and [the subsequent protected-payment/optional-mode sensitivity](agent18-rank6-ghala-discard-protection-exact-sensitivity-20261105.md).

## Gap in the prior route census

The previous G&H calculation required access to Guzma & Hala through a held G&H, Tag Call, or up to three held Trainers' Mail. Yet the source can have **both Thunder Mountain ◇ LOT and Double Colorless Energy SUM in its opening hand plus first going-second draw**, making that Supporter/search access unnecessary for the printed cost of Iron Thorns ex's **Volt Cyclone**.

The real original rank6 printed 60 has four Iron Thorns ex (only Basics), two Guzma & Hala, two Tag Call, three Trainers' Mail, one Thunder Mountain ◇, one DCE, and 47 other cards. The provided card database confirms printed Volt Cyclone costs Lightning + Colorless + Colorless and does 140 damage; Thunder Mountain reduces the Lightning component of Lightning Pokémon attacks and DCE supplies both Colorless units. The additional effect moves one attached Energy to a Benched Pokémon when one is available. This does **not** by itself establish paper attack legality or strategic superiority: opponent lock, Stadium competition, Energy denial, attack restrictions, actual availability of a receiving Bench, real chosen actions and opponent response require separate treatment.

Define the strictly disjoint event **E**:

* The opening seven contains at least one Basic, so the player has a legal initial hand.
* Six facedown Prize cards are dealt from the remaining 53; the going-second player draws one card.
* In the resulting eight observed hand cards, **both singleton Thunder Mountain and DCE are present**.
* The eight held cards contain **zero** G&H, Tag Call, and Trainers' Mail.

Every such E opening is excluded from the previously modeled direct/Mail G&H route: the required connector is absent. The two attack-resource cards are already physically in hand, irrespective of what the six Prizes contain.

## Exact findings

| Event conditioned on Basic-containing starting seven | Exact fraction | Probability |
| --- | --- | ---: |
| E: both singleton attack resources, zero G&H/Tag/Mail held | **113129 / 17776836** | **0.6363843375%** |
| E with a second Basic also held by first own turn | **49397 / 44442090** | **0.1111491381%** |

The complement of the second-Basic case within E is **exactly one Basic among the eight**, with probability **2021 / 384780 = 0.5252351993%** over all legal-opening deals. Conditional on E, **9933 / 12035 = 82.534275%** have no second Basic. This is strategically important: the [Agent45 observed native Volt Cyclone Bench-tempo audit](../aichi-2026/agent45-source-rank6-volt-cyclone-bench-tempo-20261101.md) established that no-Bench attacks can settle damage and retain the DCE, while a Benched Pokémon causes mandatory Energy transfer. Repeated solo attacks still depend on survival, opponent disruption and Stadium persistence. Thus the second-Basic subset measures an alternative energy-transfer topology, **not** monotonically higher attack value.

The broader event *both singleton cards held regardless of connectors* is **13697 / 1071455 = 1.2783551339%**. E is the portion with zero of the three modeled connector types. It is an **unconditionally disjoint new branch** relative to the earlier G&H/Tag/Mail-only model, so adding E lifts that model's **37.877838% paid search opportunity metric** to at least approximately **38.514222%** for the union of those narrow resource tests, under the earlier permissive discard and deck-access assumptions. If using the enhanced Stadium-only G&H mode at 37.877882%, the corresponding narrow union is at least approximately **38.514266%**. These are access-opportunity metrics under explicitly simplified rules. Other held-card routes may increase access further.

For an explicit two-Basic opening/Bench-readiness version, the old 7.002435% paid-G&H/Mail metric and disjoint E-with-second-Basic add to at least **7.113584%**. This strict second-Basic cut is an operational stress test for the Energy-moving effect, rather than a blanket assertion that no-Bench attacks fail.

## Separate Guzma gust channel: a rare solo offensive line

The authenticated original rank6 sixty also contains **three Guzma BUS**. The [official Japanese Pokémon TCG FAQ](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%B0%E3%82%BA%E3%83%9E&page=3&regulation_faq_main=) explicitly answers **yes** when asked whether Guzma can be played while *the opponent has a Bench and the Guzma player does not*. The [official Guzma BUS115 printing](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/sm3/115) first switches in an opposing Benched Pokémon; only after that does it conditionally switch the user's Active with their own Bench. Thus a solo Iron Thorns can gust an opposing Benched target while remaining Active, provided the opponent has an eligible Bench, no other play restrictions apply and the Supporter quota is free. It can then potentially announce the Stadium-reduced DCE-funded Volt Cyclone. When the owner *has* a Bench, the second switch is mandatory if the opponent was successfully gusted, which can move the DCE-bearing Active out of the attack position. The owner can choose not to Bench extra held Basics during initial setup; strategically that increases sole-Active Knock Out risk.

Treat a held Guzma as three of the 47 previously grouped residual cards. The corresponding eight-card opening event is a **strict subset** of E, and neither the opponent's Bench nor a game-winning target is modeled:

| Physical opening condition within E | Exact conditional fraction (given Basic-valid 7) | Probability |
| --- | --- | ---: |
| **At least one Guzma BUS held** | `1223641 / 681445380` | **0.179565529%** |
| Guzma held and **exactly one Basic** among the eight, hence unavoidable solo board | `40721 / 26549820` | **0.153375804%** |

Among the E openings, **28.216522%** also hold Guzma. Among those E-plus-Guzma openings, **85.414949%** hold exactly one Basic. These are physical card-access proportions and cannot be interpreted as 140-damage probability, gust success rate, Prize rate or game-win probability. The conditional opponent Bench state is not included and may be absent. Some target attacks may fail due to locks, protection, effects, timing or opponent decisions.

The exact proof subtracts zero-Guzma outcomes from E. For any number of Basics, the zero-Guzma favorable count is `[C(48,5)-C(44,5)]·43 + 2·[C(48,6)-C(44,6)]`; the difference from E's 52,039,340 favorable count is **14,683,692**, yielding the first fraction. For exactly one Basic after the eighth card, the favorable count is

`4·[C(47,4)·43 - C(44,4)·40 + 2·(C(47,5)-C(44,5))] = 12,542,068`,

yielding the second fraction. Both values were checked by an independent full eight-category initial-seven/Prize/single-draw enumeration, and the two new Node tests passed locally (now five of five).

**Decision relevance:** the connector-free setup retains the only Supporter action for a conditional gust. A planner focused solely on finding and paying G&H might miss that valuable alternative on some opening states. The exact event remains rare and insufficient to establish a realized attack or Prize. Any live decision gate should compare gust, Bench choice, target HP/damage/protection, protection against opponent's return knockout, and actual native Store settlement before admitting this as a qualified move.

## Closed-form proof and independent calculation

The total number of legal-seven plus uniform eighth-card outcomes is

`D = [C(60,7) - C(56,7)] · 53 = 8,177,344,560`.

Marginalizing six random Prize cards makes the single later draw uniform among the 53 cards left after the opening seven. E excludes seven connector cards (two G&H, two Tag, three Mail), and requires both singleton attack-resource cards, leaving a group of **51** allowed nonresource cards (four Basic, 47 other).

The exact favorable count partitions into two exclusive cases:

1. **Both resources among seven**: choose five other cards from 51 with at least one Basic, and then draw one of the remaining 46 allowed cards. Count `[C(51,5)-C(47,5)]·46 = 37,495,566`.
2. **Exactly one resource among seven**: choose which singleton appears, choose six other cards with at least one Basic, then draw the other singleton. Count `2·[C(51,6)-C(47,6)] = 14,543,774`.

Total favorable count **52,039,340**, hence the exact reduced E fraction above. To require a second Basic by eight cards, partition the initial five/six allowed filler cards by how many Basics were dealt. In case 1, an initial seven with one Basic must draw another Basic; two or more Basics can take any eligible eighth. In case 2, the eighth is the other singleton, so the seven must already contain at least two Basics. This yields **9,089,048** favorable sequences and the second reduced fraction.

A separate full multivariate enumeration of first seven, six actual Prizes, and one draw across printed card categories reconstructed the complete legal-opening denominator and matched both E fractions exactly. An independent deterministic 250,000-shuffle Monte Carlo drew 99,909 valid seven-card openings, observed 607 E cases and 111 E-with-second-Basic cases; those estimates are noisy, consistent sanity checks only. The exact enumeration is authoritative.

**Reproduction:** [pure CommonJS combinatoric module](../../simulation/evaluation/agent18-rank6-held-stadium-energy-bypass.cjs), [three Node regression tests](../../tests/agent18-rank6-held-stadium-energy-bypass.test.cjs). Tests were run locally with Node 22 and all three passed. The shared GitHub compiled/pinned-native workflow was **not dispatched** for this pure mathematical contribution, and no native gameplay or paper-legal move was tested.

## Strategic interpretation

A physically available attack line may need neither the hypergraph search connector nor its two-card discard payment. A policy that only evaluates G&H/Tag/Mail candidate paths can miss this smaller but provably present class of openings. The first source owner action should therefore inspect **already-held Stadium + Energy + public Active** before spending a Supporter or Item connector. At the shared Issue #25 release gate, actual action selection, native Store settlement, paper legality, and bilateral reply are still required.

**Original field:** 29/32 authenticated inventories; ranks 23, 25, 28 remain unverified. **Qualified game count:** 0. **Selected best fixed 60 and 99.5% claim:** neither established.
