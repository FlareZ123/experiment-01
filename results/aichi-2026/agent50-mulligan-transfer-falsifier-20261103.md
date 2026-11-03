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


## Equal-rank setup-card externality across all 29 published originals

The source-locked [29-original opening-hand audit](opening-hand-audit.json) records exact starting Basic counts for every authenticated original printed 60, with **zero unresolved Pokémon printings in that source**. A second calculation now applies the same simultaneous-mulligan model independently against every one of the 29 original ranks, then gives each rank equal weight. The three unavailable original sixties **23, 25, 28** remain outside the denominator. Values are *expected optional cards offered before turns*, including rounds in which both players first mulligan, and under the 47-card post-setup draw cap; none assumes offers are accepted.

| Fixed 60 | Basics | Candidate offered ≥1 | Original source offered ≥1 | Mean candidate cards offered | Mean source cards offered | Net card opportunities (candidate minus source) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Agent5 ADP→Thorton v2 | 7 | **14.39449%** | **34.16691%** | **0.238633** | **0.568615** | **−0.329982** |
| Agent43 Apex Alchemy v0 | 12 | **17.96223%** | **15.64023%** | **0.291934** | **0.193244** | **+0.098690** |
| Champion reference | 14 | 18.78752% | 11.25529% | 0.304018 | 0.130661 | +0.173357 |
| New Moon Lockbreaker | 17 | 19.63703% | 6.70528% | 0.316369 | 0.073157 | +0.243212 |

**New cross-candidate delta:** ADP v2 gives away a net **0.428673 more setup card opportunities per source-rank encounter** relative to Apex Alchemy, in this equal-weight 29-original reference. The ADP net is negative because it expects to offer the opponent more optional cards than it receives. This is an *opening-information and hand-size externality*, with no game-turn model, no assumption that a source always wants the extra cards, and no inference of a competitive candidate ordering. The distribution is especially relevant under active first-turn acceleration, but whether it benefits each source deck depends on card quality and starting state.

The 14-Basic champion's **+0.17336** result independently reproduces the [earlier Agent9 field-wide bonus calculation](bilateral-mulligan-externality.md), providing a useful arithmetic cross-check. The new [Agent50 test](../../tests/agent50-mulligan-transfer-source26.test.cjs) asserts the original 29-rank identity and zero unresolved source counts, each of the new b7/b12 means, and the historical b14/b17 controls. The candidate rosters remain hash-frozen. These results should inform the shared proposal gate as a **real cost of sparse-Basic structural design**, alongside the existing ADP opening attack probability, Prize losses and Supporter contention. The absence of three original source sixties prevents generalization to the full exact Top32 without additional evidence.


## Start-order collision and a conditional 99.5%-target stress threshold

ADP v2's defining enhanced GX is **most naturally attempted going second** on the candidate's first own turn. The original rank26 Meloetta ex's special **Debut Performance** enables an attack on the rank26 player's first turn **going first**; rank26 also gets a normal attack opportunity going second, but then the ADP candidate may have already prepared a Bench, Tool or counterattack. Thus their headline ALS preferences can *align on the same order*: **original rank26 first, ADP second**. The setup coin winner chooses turn order **before** revealing mulligan hands (supplied Rulebook §I.G). A fixed policy choosing ADP second whenever it wins the toss, facing a rank26 opponent that chooses first when it wins, would put rank26 first **regardless of coin winner**. This is a **conditional policy scenario**, not an observed tournament order or a proof either preference is optimal given source matchup uncertainty.

A useful purely algebraic target stress test assumes **uniform weighting across all 32 source ranks**, that the other 31 ranks are each won perfectly, and that the original rank26 loses the game for the candidate whenever its completed source-first Crisis Punch is legally decisive against a candidate solo Active. The 99.5% aggregate target then allows at most `32*(1-0.995)=0.16` loss probability in the *single rank26* matchup. Let `a` be the candidate's chance of an exposed solo Active after setup (the observed list-count model), `f` the frequency rank26 goes first under the chosen first-player policies, and `r` the still **unknown** conditional probability the original rank26 source completes a legal winning firstturn line given both preceding events. The model contributes a rank26 loss probability `f*a*r`, so a **necessary target condition** is `r <= 0.16/(f*a)`, if the specified donk is the only loss mode. It is emphatically not evidence of a particular source `r`.

| Candidate | Solo `a` | Maximum `r` if source goes first **always** (`f=1`) | Maximum `r` if source goes first half (`f=0.5`) |
| --- | ---: | ---: | ---: |
| ADP v2 (seven Basics) | 0.680749 | **23.50%** | **47.01%** |
| Apex Alchemy v0 (twelve) | 0.452606 | 35.35% | 70.70% |
| Champion reference (fourteen) | 0.375068 | 42.66% | 85.32% |
| New Moon v1 (seventeen) | 0.274628 | 58.26% | No nontrivial restriction from this single mode |

Actual ranking and order policies are unknown, and the full field has three missing original 60s. If other ranks have nonzero loss probability, rank26's permissible share shrinks below 0.16. Equally, real rank26 may be unable to assemble this demanding five-own-KO line frequently, other defensive effects may prevent the attack or survive its damage, and a second opening Benched Pokémon defeats the immediate lone-KO terminal. This budget calculation is a **prioritization device for an unlocked source-first prospective experiment**, with no rank26 win-rate estimate and no proof that 99.5% can or cannot be reached.


## Public invalid-hand signature exposure, separate from optional card draws

The supplied Rulebook §I.G also requires a player to show a **seven-card hand containing no Basic** during a mulligan, including when **both players** have no Basic and both restart. The other player may therefore know some *card names* before the ordinary turns. This channel does **not require** an opponent bonus-card offer. The general probabilistic method and its information-policy caveats were established by [Agent31's earlier Iron Thorns mulligan-signature study](agent31-paper-mulligan-public-signature-20261030.md). Here it is applied specifically to the unchanged fifth-candidate 60s.

Agent5 ADP v2 has **four Thorton** and **four Tag Call**, all non-Basic. Across all physically revealed invalid seven-card hands prior to its first Basic-valid opening, exact probabilities are:

- At least one **Thorton** revealed: **22.72429444%** of setups.
- At least one **Tag Call** revealed: **22.72429444%**.
- At least one card from **either family** revealed: **31.91160450%**.
- At least one copy of **both families**, potentially across different failed hands: **13.53698437%**.

For a concrete alternative *different-sized* card family, the frozen Apex Alchemy v0 has **three Boost Shake** plus **two Alolan Muk Evolution** cards: at least one of those five non-Basics is publicly revealed in **11.69688394%** of setups. This last percentage is an exposure of a five-copy signature versus an eight-copy signature, with different informational specificity. It does **not** establish that ADP is intrinsically more identifiable or exploitable than Apex. A source opponent might classify a deck or change its policy from publicly shown names, but no classifier, Ranger policy, or actual opponent response is demonstrated.

With `b` starting Basics and `t` designated non-Basic copies in a sixty, let `p=C(60-b,7)/C(60,7)` and `s=1-C(60-b-t,7)/C(60-b,7)`. Independent complete redraws yield `P(ever publicly reveal a designated card)=p*s/(1-p+p*s)`. The both-family probability uses inclusion-exclusion of four-copy, four-copy and eight-copy events. The new evaluator [`mulliganReveal`](../../simulation/evaluation/agent50-mulligan-transfer.cjs) and [frozen-SFT assertions](../../tests/agent50-mulligan-transfer-source26.test.cjs) also reproduce Agent31's previously published four-Basic/eight-target control **50.63964993%**. Conditional Basic-valid setup composition and first-player choice are left unchanged.

The original rank18 Regidrago has a previously documented source-owned Ranger-preload line ([Agent30 exact first-eight source audit](agent30-original-ranger-erases-adp-gx-five-source-ranks-20261102.md)), so seeing distinctive combo resources earlier could in principle inform an owner-visible Supporter choice even before ADP appears in the Active Spot. There is no quantified increase in the legal Ranger selection rate from this disclosure, and it would be invalid to give the source privileged knowledge of cards never publicly revealed. The [Agent31 native paper-timing discrepancy](../twinleaf/agent31-public-mulligan-reveal-timing-gap-20261030.md) remains a relevant policy-fidelity caveat: preserving historical public card identities for the opponent without leaking its current hidden deck and Prizes is an outstanding integration task.
