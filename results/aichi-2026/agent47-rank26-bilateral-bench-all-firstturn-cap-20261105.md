# Bench-all defensive setup bounds rank26's first-player donk, with bilateral compensation

**Agent47 | 5 November 2026 | exact setup-policy analysis, zero games.** This extends [the exact rank26 singleton Prize obstruction](agent47-rank26-ticket-prize-obstruction-exact-20261105.md) with an independently specified opponent setup decision: **the defender takes every permitted mulligan-compensation draw and Benches all available Basic Pokémon before the game starts** (subject to the normal five-slot Bench; every original in the eight grouped rows below has at most four Basic copies in the special Iron Thorns subgroup, so the subgroup has no slot issue). The hypothesis is explicitly an adversarial *policy*, not a claim that every real opponent does so or that it is optimal over a full match.

## Why a second Bench Pokémon stops the immediate terminal

The exact original rank26 Meloetta Donk has one documented first-player turn-one characteristic attack, **TM: Crisis Punch**, that deals 280 to one Active. Its other listed cards provide no identified source-turn effect that Knocks Out a separate opponent Bench Pokémon. In the [already mechanically proven but synthetically staged native line](agent47-rank26-unownless-single-lightning-full-chain-native-20261103.md), victory on the first turn requires the opponent's sole Active to be Knocked Out with **no opponent Bench**. When the original defender starts with any second surviving Pokémon Benched, one Active KO leaves a Pokémon in play, and one Active KO cannot collect all six standard Prize cards. This is a **sufficient way to deny that specific immediate first-turn win**, regardless of how successfully rank26 sets up the five own Exeggcute Knock Outs. It does not determine who would win later.

Setup occurs *before* the first player's turn. A printed Basic in the defender's legal starting hand can be selected as Active, and the other Basics can be Benched voluntarily. Under the stated bench-all rule, **only a defender whose entire accessible setup hand contains exactly one Basic is vulnerable to a win by eliminating its sole Pokémon on rank26's first turn**. Opponent Item use, attacks or future play are not assumed. See the supplied Advanced Player's Rulebook I.G steps 4–7 and [Agent1's original-29 audited Basic counts and two-player mulligan law](../statistics/agent1-original29-bilateral-mulligan-bonus-20261104.md).

## Paired-mulligan/Bench probability

Let the fixed rank26 source have 12 printed Basics, and the opposing original contain `B` Basics. Write `q_s=C(48,7)/C(60,7)`, `p_s=1-q_s`, `q_d=C(60-B,7)/C(60,7)`, `p_d=1-q_d`, and `D=1-q_s q_d`. An opposing defender with a Basic-valid initial seven has exactly one Basic with probability

`r_B = B*C(60-B,6) / [C(60,7)-C(60-B,7)]`.

Under the official both-no-Basic restart rule, the **defender** is offered exactly `k >= 1` compensation draws when it finds a valid seven and the source needs `k` additional seven-card attempts:

`P(defender bonus count = k) = p_s p_d q_s^k / D`.

The probability it receives no offer is `1-p_d q_s/D`. If the defender elects to take **all** `k` extras, the chance that an originally single-Basic valid hand finds no further Basic is `C(54-B,k)/C(53,k)` for `0 <= k <= 47`. Therefore the probability `S_B` of a final setup with only one defender Basic under this policy is:

`S_B = r_B (1-p_d q_s/D) + sum[k=1..47] (p_s p_d q_s^k/D) * r_B * C(54-B,k)/C(53,k)`,

with an explicitly unmodeled probability tail of offered `k>=48` bounded by `(p_d q_s/D)q_s^47`. This tail is below `2.6e-35` for all known original opponents, so rounding to the decimals below is insensitive to the physically impossible extra-deck draw sizes. These are opening-hand distributions, conditional on both players eventually making valid seven-card openings; they use independent physical deck shuffles. There is no opportunity to draw compensation on rounds in which both sides lacked Basics.

## Results across all 29 authenticated original opponents

| Original printed Basic count | Original ranks | `P(defender only one Basic after full setup)` |
| ---: | --- | ---: |
| 4 | 6, 24, 29 | **83.673577772%** |
| 10 | 8 | 53.828893249% |
| 11 | 3, 5, 9, 11, 13, 16 | 49.445806653% |
| 12 | 7, 22, 26 | 45.260587172% |
| 13 | 4, 17, 32 | 41.279412621% |
| 14 | 1, 2, 14, 15, 20, 21 | 37.506796023% |
| 15 | 10, 12, 27, 31 | 33.945705080% |
| 16 | 18, 19, 30 | 30.597655781% |

The equal-weight average over **only the 29 known originals** is **45.302104471%**, as an *upper ceiling on a lone-Active instant win* for the original rank26 source under this hypothetical defensive setup policy. This is independent of any first-turn attack acquisition requirement. Missing ranks **23, 25, 28** were excluded without imputation. These numbers **do not** describe the probability the rank26 player successfully executes Crisis Punch, or rank26's eventual game win rate.

### Iron Thorns-only negative control

All original Iron Thorns ex-only opponents at **ranks 6, 24 and 29** have four Basics, which fit on one Active and three Bench spots if all are available. With the setup policy above, the precise probability they finish with only one Basic is **83.673577772%**. Their chance of exactly one Basic in an original valid seven before compensation is **84.175350341%**; their possible compensation draws explain the small difference. The defender receives an offer to draw one or more extras in **8.601000058%** of setups against original rank26's 12 Basics.

The [rank26 physical Prize obstruction](agent47-rank26-ticket-prize-obstruction-exact-20261105.md) proves that, conditional on rank26's first valid seven, **1.715135638%** of rank26 Prize configurations trap Ticket together with Cologne, DCE or both Basic Lightning Energy, preventing the necessary first-player turn-one resource channel against an Active Iron Thorns ex. This source card-location event is independent of the *opponent* Basic inventory and the relative first-success times of mulligans, conditioned on the source's legal final seven: previous unsuccessful hands are discarded and reshuffled, so their count does not change the distribution of a successful final seven and its subsequent random six Prizes.

Therefore a tighter **policy-conditional necessary upper bound** on the original rank26 first-player turn-one win against an all-Basic-benched rank6/24/29 defender is

`0.8367357777206609 * (1-0.017151356381388247) = 0.8223846241999158`,

or **82.238462420%**, subject only to the negligible `k>=48` tail described above. This assumes the defendant's additional Basics are Benched before rank26 acts; no full-game strength conclusion follows. The 82.238% is an *upper bound for a particular opposing setup policy*, and **must never be reported as a rank26 win rate**. Actual first-turn success can be much lower due to hand access, lock-removal cost, timing, damage prevention and attacks not happening.

## Adversarial policy and integration implication

A policy that routinely starts an Iron Thorns-only defender with one Basic while holding a second accessible Basic has an avoidable vulnerability to this source's first-turn sole-Pokémon KO plan. An opponent-competence audit should record the **actual final Basic count in the defender's setup hand (including accepted bonus cards), which Basics it put onto the Bench, and whether it had a strategically meaningful reason to leave a second Basic unbenched**. The proper negative control is an owner-information-safe *setup choice* comparison that keeps physical deals and seat order fixed, followed by a genuine native Store settlement and opponent response. Do not retroactively claim this mathematical table supplies 29 qualified matches or that universal bench-all is the correct long-game policy.

**Benchmark remains 29/32 original name/count inventories, zero competitively qualified games, no selected best fixed sixty and no demonstrated 99.5% win rate.**
