# Agent 50: opening mulligan donation against original rank 26

**3 November 2026. Exact opening combinatorics; no qualified games.**

The fixed Agent 5 ADP-Thorton-Regidrago v2 list has seven Basic Pokemon. The fixed Agent 43 Apex Alchemy v0 list has twelve Basic Pokemon. Original Aichi rank 26 Meloetta Donk has twelve Basic Pokemon. The printed lists and their card types determine these counts.

Using independent shuffled opening hands, simultaneous invalid hands reset without an offered draw. A player with the larger number of failed opening hands can offer the opponent optional extra cards. The source receives max(0, candidate mulligans minus source mulligans) bonus-card offers, capped by its deck size after setup.

For ADP v2 against rank 26, the probability of offering at least one card is 34.9633410557%, at least two is 13.9545844425%, and expected offered cards are 0.5818693797. Apex Alchemy against rank 26: 16.0120289149%, 3.0526403562%, and 0.1978373199. These are setup opportunity metrics rather than probabilities of drawing a particular combination, using that combination successfully, or winning.

Source rank 26 may choose to take fewer offered cards. It cannot automatically promote a bonus-drawn Basic to Active. Existing policy, exact source prompts, game clock and a naturally selected complete first-turn response still require testing. Neither challenger has a demonstrated competitive win rate.


## Stronger original-source counterexample: solo Active before the candidate's first turn

The original rank-26 deck has a conditionally proposed first-turn **280-damage Crisis Punch** line after deliberately awarding five own Prizes through Risky Ruins / Damage Pump / repeatedly recovered Exeggcute, then powering Meloetta ex. The intact printed list contains this path, but its complete naturally selected line has **not** been qualified in the native simulator. If it is executed against a lone 280-HP-or-less Active with no Bench, the final knockout would leave the candidate with no Pokemon in play. Candidate ADP v2 has only seven starting-eligible Basics: two 280-HP ADP-GX, three 220-HP Regidrago V, one Tapu Lele-GX and one Crobat V. No pre-turn attached Hero's Cape is assumed. All seven are within the nominal 280-damage threshold, excluding prevention/resistance/effects.

The exact chance of an **initially valid** seven-card candidate opener containing exactly one Basic is

`B*C(60-B,6)/(C(60,7)-C(60-B,7))`.

A stronger source-first setup model marginalizes over simultaneous mulligans and six disjoint Prize cards. We assume the candidate elects to draw all optional cards offered by the source's mulligans and Benches every additional Basic it finds before the first turn. Results condition on its initial seven containing a Basic, using source rank-26's twelve Basics:

| Frozen fixed sixty | Starting Basic count | Only one Basic in valid original seven | Only one Pokemon in play after accepting all source bonus cards |
| --- | ---: | ---: | ---: |
| Agent 5 ADP-Thorton v2 | 7 | **69.24920315%** | **68.07491908%** |
| Agent 43 Apex Alchemy v0 | 12 | **47.11087012%** | **45.26058717%** |
| Rank-1 champion reference | 14 | **39.41763348%** | **37.50679602%** |
| New Moon Lockbreaker v1 | 17 | **29.27817856%** | **27.46278939%** |

The champion and New Moon checks reproduce earlier published solo-exposure values in [Agent 47's original-rank26 comparison](agent47-rank26-opening-bench-and-ticket-20261102.md). Agent 3's prior [rank26 solo-risk methodology](agent3-meloetta-donk-lone-basic-setup-risk-20261030.md) already covered comparable Basic-count states. The **new contribution** is the direct frozen Agent 5 versus Agent 43 versus champion/New Moon candidate comparison and its exact rank-26 original-source admission meaning. Original-source lone-Active pressure is a serious structural objection to the ADP v2 proposal's seven-Basic composition; it is a setup exposure, with no estimate of the probability of rank26 actually assembling or winning with Crisis Punch.

## Marginal original-source Meloetta visibility from mulligan cards

Original rank26 contains **one Meloetta ex BLK44**, a Basic Pokemon. If the source takes every offered mulligan bonus card, then, conditional on its final valid seven, the exact probability that it sees this singleton **in the original seven or the additional pregame cards only** is **15.35441221%** versus Agent 5 ADP v2, compared with **14.73427144%** versus Agent 43 Apex Alchemy. The approximately 0.62014-percentage-point difference excludes the ordinary first-turn draw, search, Ultra/Quick Ball effects, prizes accessed through other effects, turn-one item sequences and physical execution. A bonus-drawn Meloetta may be placed on the Bench, but cannot replace the original starting Active.

Importantly, [Agent 3's independent source DCE/Lightning analysis](agent3-rank26-coupled-setup-mulligan-bonus-20261101.md) demonstrates that taking *more* optional draws can remove a Basic Lightning card needed in the deck for a particular Battle Compressor / Tapu Koko route. Bonus cards are an option with state-dependent value, and the rank26 source needs a valid decision policy for whether to take them.

## Exact model and reproduction

The general bilateral-mulligan algebra was established in [Agent 9's earlier methodology](bilateral-mulligan-externality.md); this report applies it to the two new unchanged challenger printings and the original rank26. With `p=C(60-Bc,7)/C(60,7)` and `q=C(60-Bs,7)/C(60,7)`, the source's at-least-one offered-card probability is `p*(1-q)/(1-p*q)`; at-least-two is the preceding probability times `p`, and the mean capped at 47 possible post-setup deck cards is `p*(1-q)/(1-p*q)*(1-p^47)/(1-p)`.

For the solo calculation, when exactly one candidate Basic is in its initial seven, the probability that `k` optional bonus cards reveal no other Basic (marginalizing the six Prizes) is `C(54-Bc,k)/C(53,k)`. The simultaneous-failure-reset distribution supplies the source-mulligan draw count `k`, with its negligible tail collected into the 47-card cap. Source bonus offers and candidate bonus offers are mutually exclusive in a single setup.

- Source: [exact original field ranks and printing IDs](full-decklists.json); frozen [Agent 5](candidates/agent5-adp-thorton-regidrago-60-v2.json) and [Agent 43](agent43-apex-alchemy-paper-expanded-v0.json) printings.
- Reproducible pure [CJS evaluator](../../simulation/evaluation/agent50-mulligan-transfer.cjs), with [source/card-ID and independent summation regression](../../tests/agent50-mulligan-transfer-source26.test.cjs).
- Native game outcomes: **zero**. A prospective pilot needs full candidate/source identity, both seats and actual start order, source initial Bench and owner decision, physical Prizes, all five self-KOs, paid TM/Energy, original-source first-turn settled attack, and an actual opponent reply when a Bench survives.

**Decision:** Candidate 5's proposed early ADP turn has an extreme count-driven solo-opening liability to the original rank-26 source if the complex source win line can be completed. The natural source-win frequency and overall candidate relative strength remain **UNKNOWN**, so the fixed list must stay unranked.


## Source-policy transportability warning: rank26 versus Ability lock is a different game

[Agent 3's natural v1.1 cohort](agent3-rank26-natural-prekoko-v11-result-20261102.md) reported **zero** source first-turn Crisis Punch in thirteen actual source-first setups, all from an original rank26 versus **rank6 Iron Thorns** source experiment. In [the independent unchanged-deal root census](agent3-rank26-owner-root-prerequisite-v12-native-20261102.md), **13/13** first-global-turn owner-root cohorts showed the opposing Active as **Iron Thorns ex or Klefki**. Both can disable critical Basic Ability paths in relevant states. The source held Canceling Cologne in **0/13**, and both its on-board and discard resource gates were unfulfilled. The baseline had no accepted first-turn Battle Compressor in those same setups; later separate source Compressor experiments improved an upstream gate without completing the combo.

**Do not transport the 0/13 locked-opponent observation into a rank26 versus ADP v2 estimate.** ADP v2's seven Basic starters are ADP GX, Regidrago V, Tapu Lele-GX and Crobat V; none has the active Iron Thorns Initialization or Klefki Mischievous Lock effect. Other counterplay, source Brick hands, paper engine faults and incomplete source actor decisions remain possible. The existing negative evidence is a truthful absence of selected source attacks against Ability-lock opposition, not a demonstrated source-first attack failure probability against an unprotected seven-Basic ADP opener.

The meaningful next source experiment must explicitly pre-register original rank26 versus the unchanged ADP v2 (and matched Apex Alchemy) both actual start orders, with source-first **unlocked or locked** board opportunities recorded separately. Count first-turn source attacks only after their physical self-KOs, Energy, Tool, GX/Ability restrictions, final Prize, Active-target damage and opposing Bench have been fully resolved under paper rules. Existing historical rank6 locked arms must remain developmental controls rather than evidence of ADP safety.
