# Agent18: state-dependent discard protection can dominate physical G&H access in original Rank6

**5 November 2026 | exact protected-resource sensitivity, no competitive outcomes.** Supplements the [direct plus Trainers' Mail exact resource-access model](agent18-original-rank6-mail-marginal-ghala-exact-20261105.md) and the [authenticated source Active DCE receipt](agent18-v9-original-rank6-dce-active-physical-custody-20261105.md).

## Strategic question

The original rank6 G&H setup line can search `Thunder Mountain ◇`, `Double Colorless Energy` and a Tool only after two additional hand cards are actually discarded. The earlier exact access rate **37.877838%** counted every card outside held Basics, held Thunder/DCE and the route card spent as physically discardable. The human-provided DCI/UDP model warns that many such cards can be strategically protected, including singleton tactical cards. Here we quantify how far this precise nominal model depends on treating the remaining hand as discardable. No card effect or player action is altered.

The authenticated rank6 printed sixty has **19 distinct additional singleton cards** outside its four Basics, two G&H, two Tag Call, one Thunder, one DCE and three Trainers' Mail. They are: Cynthia & Caitlin, Team Skull Grunt, Faba, Eri, Sidney, Gladion, Lillie's Determination, Team Rocket's Handiwork, Palace Book, Captivating Poké Puff, Echoing Horn, Megaton Blower, Handheld Fan, Tool Jammer, Palace Belt, Tropical Beach, Player's Ceremony, Wondrous Labyrinth ◇ and Spiky Energy. The other 28 cards in the 47-card residual group appear in multiple copies. Treating all nineteen as protected is a **counterfactual heuristic**; it does not mean every singleton should always be retained.

## Exact predicted access by number of protected residual cards

The following sensitivities use the same Basic-containing seven, six Prizes, one going-second draw, direct G&H/Tag and up to three Mail four-card searches. A `protected` card is ineligible to pay the G&H discard cost whenever it is held. Apart from the directly required Basic/Thunder/DCE and the consumed G&H or Tag, all remaining unprotected held cards are allowed as nominal discard choices.

| Number of the original 47 residual cards protected | Direct/Mail combined physical access | Access with a second Basic ready to Bench |
| ---: | ---: | ---: |
| **0** (original permissive model) | **37.877838%** | 7.002435% |
| 10 | 37.756563% | 6.932582% |
| **19** (protect all actual other singletons) | **36.299686%** | 6.421121% |
| 25 | 33.170603% | 5.602074% |
| 30 | 28.447536% | 4.574158% |
| 35 | 21.596899% | 3.284412% |
| 40 | 13.180671% | 1.887985% |
| 45 | 4.978580% | 0.669869% |
| **47** (all other residual cards protected) | **2.484485%** | 0.325725% |

Two exact anchor fractions:

- At 19 protected, the nominal paid route is `1577689993897662481522657 / 4346290998219280025916000` (**36.29968620%**), including `6364523227663 / 20125560054600` (**31.62408008%**) direct and `493523231416242490321787 / 10555278138532537205796000` (**4.67560613%**) Mail rescue.
- At 47 protected, route access is `22000728063599 / 885524642402400` (**2.48448513%**). Remaining eligible cards include surplus original G&H, Tag and Mail copies: this is a formal hypothetical rather than an actual sensible deck policy.

The calculation is monotonic: making more cards ineligible to discard cannot create a new paid G&H route. Yet the drop is strongly nonlinear. Protecting the 19 other singletons alone subtracts **1.578152 percentage points** from the permissive 37.877838% access rate, while protecting 40 of 47 reduces it to **13.180671%**. The resource count model still does not price opportunity costs among cards marked eligible. Real discardability depends on the opponent, Prize composition, the tactical plan and next turns.

## Printed G&H optional-payment exception: strategically consequential

The *actual* `Guzma & Hala CEC` text in the provided card pool, `cards/en/sm12.json` printing `sm12-193`, first searches for a Stadium **unconditionally**. Discarding two other cards is optional; paying them unlocks the Tool and Special Energy searches. When the exact singleton Double Colorless Energy was already in the eight opening-plus-draw cards, the owner may **skip discarding altogether** and fetch only Thunder Mountain as Stadium. This is a materially different legal mode of the same Supporter. The [official Japanese Pokémon card entry](https://www.pokemon-card.com/card-search/details.php/card/37151/regu/BW) independently confirms the Stadium-first baseline and conditional additional Tool/Special Energy search. The [Cosmic Eclipse card FAQ](https://pokegym.net/wp-content/uploads/2019/10/FAQ-SM12-Cosmic-Eclipse.pdf) clarifies that the optional payment occurs when playing G&H, before the Stadium search, so a newly fetched Stadium cannot be used as one of the discards. The model accordingly uses existing physical hand cards for any paid search. In particular, the stricter all-paid model overconstrains source hands in which DCE is already held.

The same exact opening/Prize/draw + Mail calculation adds the alternative free Stadium-only mode for hands with DCE already held. That alternative does not claim a better native policy, Stadium acceptance, or successful attack.

| Protected other cards | Paid G&H model | Optional G&H Stadium-only mode allowed when DCE held | Added access |
| ---: | ---: | ---: | ---: |
| 0 | 37.877838% | **37.877882%** | +0.000044 percentage points |
| **19** actual other singletons | 36.299686% | **36.681201%** | +0.381515 percentage points |
| 30 | 28.447536% | **30.042009%** | +1.594473 percentage points |
| 40 | 13.180671% | **16.541667%** | +3.360996 percentage points |
| 47 | 2.484485% | **6.873626%** | +4.389141 percentage points |

For 19 protected, the exact optional-mode total is `392791589553272470125463 / 1070825318401851600588000`. Under maximum residual protection, it is `36019238122028573159941 / 524020900494523123692000`. The recorded numbers are exact enumerations followed by decimal display rounding.

Method: retain all direct/Mail histories with original DCE **already held** and without Prized Thunder Mountain. For these states alone, replace the requirement for two eligible discard cards with the printed Stadium-only option. All otherwise identical states still require the optional two-card payment when DCE is deck-resident and must be searched. The difference in access is exactly the probability of a DCE-held source line whose hand lacks enough unprotected discard targets. This exception is now included in the reusable sensitivity module and checked against a second full eight-category enumeration.

**Interpretation:** multi-mode Supporters can create discrete access routes that become more important as other hand cards become strategically protected. The mathematical approach still omits direct already-held Thunder + DCE attacks without a G&H line, alternate acceleration, and the opponent's responses.

## Exact method and reproducibility

Preserve each of the original seven categories and their true source counts, `[Basic4, G&H2, Tag2, Thunder1, DCE1, Mail3, other47]`. Exhaustively allocate seven initial cards, six Prize cards and the single subsequent draw by category and verify their exact integer multiplicities against the legal-Basic-opening denominator

`D = [C(60,7)-C(56,7)] C(53,6) 47`.

For a fixed coarse state with `h` residual other cards among the eight seen, label `P` of the original 47 residual cards as protected, chosen without bias from the source deck's physical card identities. The protected count in hand is hypergeometric. The exact probability of obtaining no more than `s` ineligible residual cards, where `s` is the number of spare cards above the two-card G&H payment threshold, is

`Pr(payable | h,P,s) = ∑_{p=0}^{s} C(P,p) C(47-P,h-p) / C(47,h)`.

For a direct held G&H/Tag route the slack is `s=7-B-M-DCE-2`; for first successful Mail number `j` it is `s=8-j-B-M-DCE-2`. Each term receives the exact four-card Mail fail/retry probability defined in the parent report, and its original combinatorial opening weight. This integrates discard-protection outcomes without resampling or changing the physical 60.

The exact `P=0` implementation reproduces the parent direct and Mail fractions. Independently, a full eight-category Python integer enumeration that treats `P` residual cards as a separate protected deck population produced the same rounded results at 19 and 47 protected, and the entire displayed nine-point sweep was computed with that directly verified model.

**Reusable implementation:** [source-specific exact hypergeometric sensitivity module](../../simulation/evaluation/agent18-rank6-ghala-protected-discard-sensitivity.py) and [six source and numeric regression tests](../../tests/agent18-rank6-ghala-protected-discard-sensitivity.test.py). They use only Python standard library and the original authenticated `full-decklists.json`, with no native Store, GitHub CI or external downloads. The Python full eight-category exact calculation was actually executed in the local interpreter. The committed Python module and regression file have **not yet executed in GitHub CI**, a separate reproducibility status.

## Decision relevance and caveats

The two selected true original v9 rank6 source hands actually paid G&H by discarding **Tool Jammer BST and Team Rocket's Handiwork FCO**, both singleton cards that the `P=19` policy would protect. The native Store accepted the discards and then physically placed DCE on the source Active Iron Thorns, yet the source passed before playing Thunder Mountain or using Volt Cyclone. This sensitivity analysis cannot retroactively certify that a different pair of payment cards was available in either recorded hand, and it cannot establish that either observed payment was good or bad.

The all-singletons-protected scenario may overvalue some irrelevant singletons in certain matchups, while even the 47-protected scenario unrealistically permits discarding spare G&H/Tag/Mail without state-based valuations. The proper next decision gate is a complete owner-visible native line that evaluates **specific** payment alternatives under relevant matchups, reaches a paid attack or control payoff, and records a meaningful opponent response. Merely increasing theoretical graph access remains a weak optimization target.

**Competitively qualified complete games: zero.** **Exactly authenticated field originals: 29/32.** **A fixed deck with demonstrated 99.5% game wins: absent.**
