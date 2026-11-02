# Two-player paper-card screen: original rank2 Bunnelby TM versus live original rank6/1 Guzma access

**Agent 40 | 2 November 2026 | corrected original two-player opening distributions and paired 25m source samples | zero qualified games, no match win claims.**

## What is being compared

The original Aichi rank2 Takahiro Ando Vileplume list has an available *specific* first-turn-going-second `Bunnelby PRC → Guzma & Hala → Artazon + Capture Energy + TM: Evolution → Ω Barrage two Evolution attacks → Vileplume AOR + Pidgeot ex` resource line. The first source attack ends the turn, leaving an opponent response before the new lock board can protect itself fully. Agent40 has [natively verified](agent40-exeggutor-blockade-two-turn-native-and-direct-access-20261102.md) this kind of response with original rank1 Guzma against a rank2-derived Exeggutor challenger, including genuine opposing owner-card and two switch prompts. **That existing native case uses a distinct five-copy challenger, while this report's mathematical source is the unmodified original rank2 60.** The mathematical Guzma/Bench counterpart is a resource-access diagnostic, not evidence that original rank2 contains Exeggutor or that a Guzma target is always useful.

A naive count of opponents holding Guzma substantially overstates actual early *Guzma switch* access, especially in original rank6 Iron Thorns. Guzma also requires a second friendly Pokémon in play, which means its owner must naturally access at least two eligible Basics and choose to Bench one. During rank2's immediate post-setup opponent turn, model the original opponent going first (turn1), rank2 going second (turn2), then opponent first available post-TM response (turn3). Two normal opposing draws have then occurred. Six Prizes are randomized and marginalized, and the original seven is conditioned to contain a Basic.

The original registered [29 authentic exact sixties](../aichi-2026/full-decklists.json) show original rank6 Kazuma Kashi **four Basic Iron Thorns ex and three Guzma**, rank1 Yasunori Kato **14 eligible Basics and one Guzma**, and rank2 **14 eligible Basics**. No foreign printings or hypothetical fifth Thorns are introduced.

## Exact original opponent opportunity, before mulligan bonuses

The probability of holding at least one printed Guzma among first seven plus two ordinary draws, conditioned on Basic-valid initial seven, compares with the stricter probability of having **both one Guzma and at least two starting-eligible Basics** among those nine cards.

| Original opponent, going first | Guzma seen by turn3, Basic-valid opener | Guzma plus at least two Basics by turn3 |
| --- | ---: | ---: |
| Rank6 Iron Thorns (4 Basics, 3 Guzma) | **36.48146%** | **8.34218%** |
| Rank1 Shadow Rider (14 Basics, 1 Guzma) | **14.45029%** | **10.56996%** |

The exact second-column probabilities are `61291/734712` and `28238069/267153920` respectively. These are **physical necessary resources** for ordinary Guzma, not its actual play probability. A second Basic could be inaccessible because of lock, Bench, previous discard or competing play; conversely a separate Bench placement effect could create an actual target even when this hand-only screen fails.

### Independent probability calculation

Let `B` be the original opponent Basic count, `G` its Guzma count, and `k=7+two ordinary draws+optional opponent bonus cards`. Define `a_B=1-C(60-B,7)/C(60,7)`. Conditional on a valid original seven, the event `total G>=1, total B>=2` follows inclusion-exclusion:

`P = 1 - [P(no G in first k AND initial Basic-valid) + P(exactly one B in first k AND initial Basic-valid) - P(no G AND exactly one B in first k AND initial Basic-valid)] / a_B`.

Here `P(no G AND initial Basic-valid)=C(60-G,k)/C(60,k) × [1-C(60-G-B,7)/C(60-G,7)]`; the exactly-one-B terms are `B*C(60-B,k-1)/C(60,k)*7/k` and `B*C(60-G-B,k-1)/C(60,k)*7/k`. The `7/k` factor puts that one Basic inside the original seven, not merely in the later draws. An **independent BigInt seven-card and later-draw multivariate hypergeometric enumeration** matches all results across both ranks and extra-card counts `m=0,1,2,3,5,10` to 12 decimal places.

## Full simultaneous opponent-mulligan mixing

Rank2 and its opponent can both mulligan. Cases where both initial hands lack Basics restart with **no bonus award**. When exactly one is valid, its opponent repeatedly mulligans until it has a legal seven; the valid player may voluntarily draw up to one bonus card per failed opposing opener. All original opening and subsequent Prize/random-draw distributions are respected by the analytical formula.

Let `a=P(original rank2 initial seven valid)`, `b=P(original opponent seven valid)`, `N=1-(1-a)(1-b)`. The final setup categories have exact weights `both legal = ab/N`, `rank2 only initially legal = a(1-b)/N`, `opponent only initially legal = (1-a)b/N`. In the rank2-only case, opponent mulligans are geometrically distributed with success `b`, giving rank2 optional draws. In the opponent-only case, rank2 mulligans geometrically with success `a`, giving the opponent optional draws. This last branch increases opposing Guzma-plus-Bench access and is absent from one-sided screens.

The **source's resource event** `S_m` is taken from the independently documented [25-million original-rank2 paired-shuffle source screen](agent40-rank2-simultaneous-mulligan-bonus-tm-survival-20261102.md), seed `2102664725`. A blind cap `c` accepts `min(m,c)` cards from an actual rank2 bonus offer. On the opponent-only branch, the opponent is hypothetically assumed to accept all offered bonus cards. Combine these independently randomized original-sixty card-location populations, conditional on their own legal opening sevens.

| Opponent | Rank2 bonus cap | Original rank2 setup-resource event | Both rank2 event **and** opposing Guzma + two Basics |
| --- | ---: | ---: | ---: |
| Rank6 Iron Thorns | 0 | 13.64039% | **1.16354%** |
| Rank6 Iron Thorns | 3 | 14.11744% | **1.20333%** |
| Rank6 Iron Thorns | 25 (all within screen) | 14.05155% | **1.19784%** |
| Rank1 Shadow Rider | 0 | 13.64039% | **1.48605%** |
| Rank1 Shadow Rider | 3 | 13.71742% | **1.49420%** |
| Rank1 Shadow Rider | 25 (all within screen) | 13.71740% | **1.49419%** |

All are **joint physical-card access events**. The opponent may have other mobility, fewer or greater actual board constraints, and different optimal line. No number in this table is the frequency of a *selected* successful Guzma, a denial of Vileplume, a Pokémon Knock Out or a game win. The rank2 source resource screen does not certify mandatory G&H discard availability or successful native follow-through. The independence applies to the independently randomized physical sixties, while the actual players' decisions can correlate through revealed board information.

The analytic tail above 25 opponent mulligans is explicitly bounded, because the original rank2 source bonus screen ends at 25. Its probability is vanishingly small given rank2's 14 Basics; the reported rounded percentages lie within these bounds. The same-opening Monte Carlo uncertainty in source `S_m` is greater than the analytical tail uncertainty. A narrow cap-3 proxy gain cannot justify an actual deck policy without native action and opponent-response testing.

## Audit, versioning and next falsification

- Implementation: [source-pinned paired screen](../../simulation/evaluation/agent40-rank2-mulligan-bonus-tm-screen.cjs), [original Guzma-plus-Bench analytic and independent BigInt enumeration](../../simulation/evaluation/agent40-rank2-vs-guzma-physical-counterwindow.cjs), [six adversarial tests](../../tests/agent40-rank2-vs-guzma-physical-counterwindow.test.cjs).
- The **existing manual-only card audit workflow** ran both source and paired-opponent mathematical tests and source samples [**SUCCESS, GitHub Actions 41511058173**](https://github.com/FlareZ123/experiment-01/actions/runs/41511058173), named step *Verify genuine rank2 versus opposing original Guzma and Bench resource conjunction* green, main head `8386d83d0bb568bf26827579bfaa00528886b305`. This was a 200k shortened reproducibility smoke test; full 25m values are source-matched local calculations.
- Do **not** infer rank6 native Guzma acceptance directly from this mathematics: a live original rank6 owner turn and legal original-target prompts still need a separate pinned Store witness, ideally under the common symmetric actor policy and real first-turn setup. The existing both-seat native Guzma response belongs to **original rank1** only. The Exeggutor v2 challenger remains a separate exploratory fixed 60.

**Benchmark unchanged:** 29/32 authenticated original 60s, zero competitive-qualified games, one fixed 99.5%-winning deck not established.
