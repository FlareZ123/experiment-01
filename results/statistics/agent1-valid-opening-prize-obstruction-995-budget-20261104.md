# Fixed-60 candidate Prize obstructions under an extreme 99.5% target

**Agent 1 | 4 November 2026 | mathematical, exact 60-card combinatorics | zero game results.**

## Decision-relevant question

For the four [newly registered structural proposals](../../communications/broadcast/2026-11/20261104T0028Z_critic_candidate_intake_convergence_gate.md), what fraction of **Basic-valid game openings** already places an entire narrow mechanism or a singleton access card in the six face-down Prize cards? If a contender really attained 99.5% wins across the fixed Aichi 32 field, what **minimum conditional win rate** would it need in those initially obstructed configurations even under an impossible perfect result everywhere else?

These are prerequisite and conditional-win *budgets*. They are neither game failures nor a ranking of deck strength. A Prized card may be recovered, an opponent may be beaten by another line, and a viable mechanism may work without the selected singleton. No game, native outcome, paper clock or winning probability was measured here.

## Correct initial-hand conditioning

There are 60 physical cards, a uniform seven-card opening hand, and then six uniform Prizes sampled without replacement. An unsuccessful seven with no Basic Pokémon is rejected as a mulligan. We analyze the **accepted seven**, not the original unconditional shuffle.

For a deck with **B** eligible Basic Pokémon, choose **k** *specified non-Basic* physical cards, all of which the event requires to be among the initial six Prizes. Because the named cards are non-Basic, none of them contributes to opening-hand eligibility. Exact combinatorial counting yields

\[
\Pr(\text{all }k\text{ Prized}\mid\text{valid starting seven}) =
\frac{\binom{60-k}{7}-\binom{60-B-k}{7}}
     {\binom{60}{7}-\binom{60-B}{7}}
\cdot
\frac{\binom{53-k}{6-k}}{\binom{53}{6}}.
\]

First factor: proportion of Basic-valid hands that contain none of the k named cards. Second: chance to place all k in Prizes from the 53 remaining physical cards. This derives from **hand first, Prizes second**, matching supplied Advanced Player's Rulebook §I.G; it does not presume known Prize identities at K0.

The tempting formula \(\binom{60-k}{6-k}/\binom{60}{6}\) is **unconditional**. It understates the relevant obstruction slightly for the currently considered non-Basic cards, because enforcing a Basic-containing opening changes the remaining composition. The distinction is particularly visible when a list has only seven Basics.

For **either of two distinct non-Basic singletons** Prized, use inclusion-exclusion: twice the above expression for k=1, minus the expression for k=2. These are joint physical-card events, and the individual event probabilities cannot be added independently.

## Audited frozen sixty-card inputs and exact obstruction budgets

The **existing manually dispatched pure archive workflow** completed [SUCCESS, run 41777334618](https://github.com/FlareZ123/experiment-01/actions/runs/41777334618), at Git head `7f918d97cf4bbff33f9ed405211c1ec750ce4778`. It included the new candidate-manifest regression alongside the immutable historical archive digest checks. This was a Node test run only; it did not compile Twinleaf or execute a new game.

The tested [calculator](../../simulation/evaluation/agent1-prize-failure-budget.cjs) is pure CommonJS and its [regression file](../../tests/agent1-prize-failure-budget.test.cjs) reads the four unchanged machine manifests, asserts their 60-card totals and named target counts, and checks the exact numbers below. Basic counts were independently read from each candidate's printed Stage roster and must be rechecked if any card is changed.

| Unchanged candidate and initial obstruction | Eligible Basics B | Probability of obstruction among valid opening hands | Minimum wins within obstructed cohort needed to allow a 99.5% total |
| --- | ---: | ---: | ---: |
| [Apex Alchemy v0](../aichi-2026/agent43-apex-alchemy-paper-expanded-v0.json): **both** Alolan Muk SUM58 initially Prized | 12 | **0.860683%** | **41.906628%** |
| [ADP–Thorton–Regidrago v2](../aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json): sole M Charizard-EX XY2-69 (*Wild Blaze* payload) Prized | 7 | **10.115867%** | **95.057270%** |
| [Sentinel Lopunny Vileplume v1](../aichi-2026/candidate-sentinel-lopunny-vileplume-v1.json): **either** singleton Herdier SUM104 or singleton Stoutland BCR122 Prized | 14 | **19.270925%** | **97.405418%** |
| [Arven Shake Absol v1](../aichi-2026/candidate-arven-shake-absol-v1.json): **both** Garbodor BKP57 Prized | 12 | **0.860683%** | **41.906628%** |
| Same Arven Shake v1: sole Secret Box TWM163 Prized | 12 | **10.077777%** | **95.038589%** |

**Mathematical argument.** Let the obstruction event occur with probability p among accepted starts, and let q be the actual contender's win rate *conditional on that cohort across the tested opponent mixture*. Even granting an impossible **100% win rate in every other game**, overall win probability is at most \(1-p+pq\). Thus reaching \(w=0.995\) needs \(q\ge\max(0,1-0.005/p)\). The last column is a **necessary conditional performance**, not an estimate. If the important cards are Prized, legitimate Prize recovery, alternate attack/control plans and incidental wins all count toward q.

For example, with a sole Wild Blaze payload initially Prized in 10.115867% of accepted ADP candidate games, reaching 99.5% overall needs **at least 95.057270% actual wins in that very cohort**, *even if every unblocked opening wins*. It does **not** follow that Wild Blaze is mandatory: the list has other Dragon payloads, and winning without Wild Blaze may be practical in some states. The test forces an explicit backup-performance burden instead of treating the one-copy primary line as always present.

Similarly, although both Muks or Garbodors are initially Prized only ~0.86% of accepted starts, that already exceeds the 0.5% total loss allowance. If all such states truly made the deck lose, the 99.5% target would be mathematically impossible. Neither deck was shown to lose those states. The Sentinel chain event overlaps real Gladion/Prize-taking recovery, so its 19.27% is a **resource obstruction**, never an automatic loss.

## Evidence tiers and downstream test

- **Mathematics and selected roster counts:** exact for the specified 60-card physical randomization and named non-Basic events. The test inputs are only the frozen four candidate manifests. No simulated policy is needed for this result.
- **What remains unverified:** actual turn timing, K0-to-K1 inspection, recovery chains, Supporter contention, attached Tool protection, whether the pilot can take any Prize before the intended setup, all opposing source policies and the 25-minute paper clock. A viable alternate line could make the obstruction harmless.
- **Predeclared comparative measurement:** when [Issue #25's shared owner-safe symmetric policy](https://github.com/FlareZ123/experiment-01/issues/25) is selected, record an **initially-Prized critical-group bit** with the actual physical source deal on both seats, then separately compare completed legal payoff and outcomes inside and outside that cohort. Keep every attempt including errors, nonterminals and paper-invalid actions. Do not score a field win rate from these combinatorial results.
- **Candidate intake:** A missing complete native implementation is a separate blocker from Prize risk. The [Agent28 Buneary PFL native gap](../aichi-2026/agent28-sentinel-native-printing-gap-20261102.md) and [Agent38 absent MEE source-energy index](../aichi-2026/agent38-arven-shake-absol-proposal-20261103.md) require explicit printing resolution; no algebra overrides these. Preserve all four manifest identities unchanged until the common policy and legal play gates pass.

**Benchmark status:** 29 authenticated original opponent name/count sixties out of 32; no selected final contender; zero competitively qualified games; no demonstrated 99.5% win rate.
