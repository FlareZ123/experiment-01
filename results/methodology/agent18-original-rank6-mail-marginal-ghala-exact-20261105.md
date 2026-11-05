# Agent18: exact marginal Trainers' Mail access to Rank 6 paid G&H, Thunder Mountain and DCE

**5 November 2026 | independent exact finite-population count, source-grounded and reproducible.** This extends [Agent18's original direct G&H access model](agent18-original-rank6-ghala-thunder-dce-exact-access-20261105.md) with the three exact `Trainers' Mail ROS` in Aichi Top32 rank6 Kazuma Kashi's authenticated original 60. This models **resource access**, not actual gameplay or a field game win.

## Printed card text, rules and original counts

Read the provided complete card ZIP, `cards/en/xy6.json`, printing `xy6-92`, English `Trainers' Mail`: look at the top four cards of your deck, optionally reveal one Trainer other than Trainers' Mail and take it into your hand, then shuffle the other cards into your deck. It is an Item. Both **Guzma & Hala CEC** (Supporter) and **Tag Call CEC** (Item) satisfy this printed Trainer category. The Advanced Player's Rulebook describes normal deck search and the shuffle, Item usage, and the once-per-turn Supporter gate. This model does not search the deck with Mail: it uses the printed **top four** only.

Original rank6 exact 60 categories are `[4 Iron Thorns ex TWM, 2 G&H CEC, 2 Tag Call CEC, 1 Thunder Mountain ◇ LOT, 1 Double Colorless Energy SUM, 3 Trainers' Mail ROS, 47 other]`. The full deck has only four Basic Pokémon and the original 60 is unchanged.

## Exact fractions, conditioned on initial seven containing ≥1 Basic

| Narrow route event | Exact conditional fraction | Probability |
| --- | --- | ---: |
| Direct held G&H, or held Tag Call accessing deck G&H, and both singletons unprized, physically two-card-payable | `148690835231 / 451798286940` | **32.910890%** |
| Additional eligible access from a held Mail finding G&H or Tag Call in 1–3 successive shuffled four-card looks, without direct route already available | `2036962192386516832799 / 41010331343049635767200` | **+4.966949 percentage points** |
| Combined direct route or Mail-assisted route | `15533827047272343835079 / 41010331343049635767200` | **37.877838%** |
| Combined with a second Iron Thorns ex already available to Bench from the opening-plus-draw eight | `7179304406648793452273 / 102525828357624089418000` | **7.002435%** |
| Marginal first available Mail alone, when a direct route is missing | `4497386169583 / 98391626933600` | **+4.570903 percentage points** |
| Marginal second/third Mail attempts beyond the first | `682435227029797541 / 172312316567435444400` | **+0.396046 percentage points** |

The relative increase in access from the three Mail cards over the direct line is approximately **15.0921%**; this is a narrow resource metric and not marginal competitive win probability. The chance all needed pieces are available can still fail under Item lock, Supporter contention, Stadium lock, attack constraints, harmful discard choice, an opposing response, or Prize complications elsewhere.

## Sampling model and derivation

Take the original 60, deal a **Basic-containing seven**, set **six face-down Prizes** from the remaining 53, then draw **one card** at the beginning of the going-second source's first turn, leaving 46 cards in the owner's deck. Ignore extra mulligan cards, further natural draws, alternative Items/Supporters, opponent actions, and additional turn cycles. The exact weighted legal-opening sample space is

`D = [C(60,7)-C(56,7)] · C(53,6) · 47`.

For each distribution `x` among hand, `y` among Prize, and drawn category `z`, use the integer multiplicity

`W(x,y,z) = ∏ᵢ C(nᵢ,xᵢ) · ∏ᵢ C(nᵢ-xᵢ,yᵢ) · (n_z-x_z-y_z)`.

The BigInt implementation exhaustively enumerates the 107,022 possible nonzero category assignments and **verifies that the sum of all multiplicities is exactly `D`**. This proof of denominator coverage guards against omitted Prize/hand configurations, rather than relying on a Monte Carlo estimate.

For no direct G&H/Tag route, the source has `k ∈ [1,3]` held Mail cards, at least one G&H still in its deck, and two accessible unprized singletons. Its remaining deck contains `a` eligible direct targets, meaning all remaining G&H and Tag Call. One `Trainers' Mail` look has

`K = C(46,4) = 163185` possible four-card sets,

`P(fail) = C(46-a,4) / K`.

After an unsuccessful Mail, its selected eligible target is absent and the inspected cards are shuffled back; each next physically held Mail can examine another independently shuffled four-card sample of the **same 46-card** deck. Thus the first successful Mail at index `j` has probability `[C(46-a,4)/K]^(j-1) · [1-C(46-a,4)/K]`, restricted to `j≤k`. Each term is multiplied by the same exact opening/Prize/draw multiplicity `W`. All numerators share an integer denominator `D·K³`, then are reduced using exact GCD.

**Physical two-card payment accounting:** for a *direct* held G&H/Tag route, one original hand card is spent to access G&H, so there must be `7-B-M-DCE≥2` nominal other physical hand cards after playing all held Basics and protecting held Thunder Mountain/DCE. For the Mail route, the G&H or Tag is **gained from deck** and then spent, while `j` original held Mails were consumed; the payment count is therefore `8-j-B-M-DCE≥2`. This distinction matters in very full Basic and singleton hands. Other hand cards are counted as physically payable regardless of strategic importance; this is a strict resource-only, DCI-unaware model.

The already-present direct fraction remains exactly the earlier result `148690835231/451798286940`. The Mail extension is added only to hands lacking the direct channel to avoid double counting.

## Evidence boundary

- The analysis is based on actual original printed source counts, the explicit Trainers' Mail text in the provided card database, and exact independent Python `math.comb`/`fractions.Fraction` enumeration. Exact fractions were also checked against a deterministic 250,000-opening Monte Carlo as a coarse sanity test, with expected sampling error.
- The committed independent JS BigInt implementation is [`simulation/evaluation/agent18-rank6-ghala-trainers-mail-exact.cjs`](../../simulation/evaluation/agent18-rank6-ghala-trainers-mail-exact.cjs), with [exact-fraction regression tests](../../tests/agent18-rank6-ghala-trainers-mail-exact.test.cjs). The JS code and tests have **not yet run in CI**; their native reproducibility remains outstanding because the separate v10 native workflow launch was blocked. The Python exact calculation itself was executed and independently recomputed with corrected direct/payment accounting.
- The successful real [Agent18 rank6 v9 physical DCE witness](agent18-v9-original-rank6-dce-active-physical-custody-20261105.md) is a different kind of evidence from the mathematical access estimate. The simulation has **zero actual source attacks in the two v9 target arms** and no demonstrated native Thunder Mountain placement. A genuine paper-legal first-turn Volt Cyclone, the post-attack mandatory Energy transfer, and an opponent's meaningful reply all remain outstanding.
- **Competitive games qualified:** 0. **Field coverage:** 29/32 authenticated original decklists, missing ranks23/25/28. **99.5% field win rate:** unproven.

This exact result identifies where a measurable consistency gain arises from a real search Item, while retaining the distinction between theoretical access and tactically worthwhile actual plays.
