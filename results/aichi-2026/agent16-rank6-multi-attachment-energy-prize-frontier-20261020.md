# Rank-6 Iron Thorns: a Prized DCE obstructs the shortcut, not every eventual Volt Cyclone

**Agent 16, 20 October 2026. Exact mathematical card-location result, development-only.** The published rank-6 Aichi 2026 Iron Thorns 60 contains four Iron Thorns ex, one Thunder Mountain Prism Star, one Double Colorless Energy (DCE), four Speed Lightning Energy, two Capture Energy, and one Spiky Energy. Card identities are bound in [the exact published source roster](full-decklists.json); the searchable source card-text pool is `resources/cards/en/`. The first attack, **Volt Cyclone**, costs Lightning + Colorless + Colorless, does 140 damage and moves one Energy to a Benched Pokémon if applicable. Speed Lightning provides Lightning, Capture and Spiky provide one Colorless each, DCE supplies two Colorless, and Thunder Mountain reduces the Lightning cost by one.

## Distinguishing two physical-resource claims

[Agent 7's genuine historical source-first rank-6 K1 failure](agent7-canonical-actor-composed-native-fourarm-20261020.md) observed **zero DCE** in the source owner deck, hand, discard, in-play Energy and Lost Zone during the actual Guzma & Hala search. The exact source 60 has just one DCE, so its location is consistent with the face-down Prizes without directly inspecting them. The selected scripted line **DCE + Thunder Mountain on a single manual-attachment turn** cannot complete on that deal by the attempted normal search. Keep the abort and selected-seed status intact.

A different, slower attack-resource path exists from the printed types: with **Thunder Mountain in play**, any two available one-unit Special Energy cards supply the reduced two-Colorless attack cost; without it, **one Speed Lightning plus DCE** can provide all three units, or **one Speed Lightning plus two further one-unit Energy cards** can supply the original cost. These take two or three normal attachments where no other acceleration applies. Having cards somewhere outside Prizes is a necessary-resource observation, and it does **not** establish hand/deck access, legal sequencing within a turn, a playable or efficient strategy, survival, or an attack.

## Exact six-Prize model

Draw a uniformly random six-card Prize subset from the exact 60. For the conditional statistic, independently draw a uniformly random opening seven from the remaining 54 and condition on at least one Basic Iron Thorns ex in that legal opening. No extra mulligan-bonus draws, attacks, discard, opponent interference, recovery or search are modeled. Declare the static energy-cost route *unavailable without Prize recovery* only when neither the 2-unit Thunder path nor the 3-unit non-Thunder path can be financed from the other 54 cards.

There are exactly **55** losing Prize subsets: **Thunder Mountain and all four Speed Lightning Energy in the six Prizes**, with any one of the other 55 cards as the sixth Prize. If Thunder remains accessible, at least two of the seven one-unit Energy cards remain; if Thunder is Prized but at least one Speed Lightning remains, the remaining six-card Prize budget ensures enough other Energy units for the original attack. DCE may be unavailable in either scenario.

| Resource-location event | Exact probability | Decimal probability |
| --- | --- | --- |
| Thunder plus all four Speed Lightning Prized, unconditional | `1/910252` | **0.000109859687%** |
| Same event, conditioned on valid opening seven | `1395/1181171992` | **0.000118103037%** |
| Sole DCE Prized, conditioned on valid opening seven | `79029/779240` | **10.141804835%** |

The last row independently reproduces [Agent 1's established DCE-Prize calculation](agent1-iron-thorns-dce-prize-collapse-conditional-20261020.md). This is a crucial sanity check, because the condition on starting at least one of four Iron Thorns changes the unconditioned 10% figure.

**Independent closed-form check.** Of the 55 failed six-Prize subsets, four have another Iron Thorns ex as the sixth Prized card and 51 do not. Let `H_b = C(54,7)-C(50+b,7)` be the number of opening sevens containing a Basic given `b` Iron Thorns ex in the Prizes. Then the exact failure probability given a Basic-valid opening is

```text
  (4 * H_1 + 51 * H_0)
  -----------------------------------------------
  [C(60,7) - C(56,7)] * C(53,6)
  = 1395/1181171992
```

The [standalone CommonJS enumerator](../../scripts/aichi-rank6-energy-prize-frontier.cjs) independently sums the complete six-category multivariate Prize configurations with BigInt combinations and exact rational reduction. It checks the source name/copy counts and the first-seven legality condition. Its [Node 22 tests](../../tests/aichi-rank6-energy-prize-frontier.test.cjs) check the unconditional numerator/denominator, the opening-conditioned fraction, agreement on Agent 1's DCE result and a source-inventory mutation veto. A temporary isolated Node 22 test run with an exact-count synthetic copy of the rank-6 roster passed **3/3** on 20 October; the code is committed for repository CI, but no compiled engine or GitHub Actions result is claimed here.

## Immediate common-policy consequence

The [five-component canonical actor policy](../../simulation/evaluation/agent7-canonical-actor-composition.cjs) delegates roots to [Agent 34's actor-only root selector](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs), which by default attaches **Basic Energy** from hand or plays a much narrower opt-in DCE/Thunder first-attack line. This rank-6 published 60 has **zero Basic Energy**, so the generic actor root component by itself has no Special Energy attachment strategy for this source. The existing source-specific scripted Guzma & Hala route aborts on the observed singleton-DCE Prize loss. Both are **decision-policy coverage limits**, independent of the static physical availability calculation.

For the next **integrated, development-only** common-policy work, use an actor-visible source-owner plan for legal multi-turn Speed/Capture/Spiky attachment sequencing in the *existing canonical two-seat runner*. Begin with the authentic DCE-missing K1 regression, honor one hand attachment per turn and Stadium/Supporter opportunity cost, retain source and candidate legal actions and next source continuation, and record Store rejections and opponent interactions. Prefer a true source-owned decision path to a post hoc forced line. Do not condition future winning samples on DCE accessibility, retrofit favorable seeds or silently substitute the rank-24 three-DCE source roster.

**Boundaries:** An ultra-small Prize-only resource-collapse probability is **neither a lower bound on attack execution nor a win rate**. Opposing denial, damage, Prize recovery, all applicable Pokémon and Trainer rules, six-Prize transitions, attached Energy redistribution, searchability, discard costs, multiple turns and tournament timing all remain outside this model. The conditional static event does **not** justify deck selection. Repository benchmark still has **29 of 32 exact source lists, zero competitively qualified games and no demonstrated 99.5% fixed deck**.
