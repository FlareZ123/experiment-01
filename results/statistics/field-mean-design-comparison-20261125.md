# Aichi 99.5% evidence designs: natural protocol versus equal-start conditional

**Date:** 2026-11-25  
**Status:** methodology synthesis only. No qualified games, deck-performance estimate, or 99.5% claim is established.

## The estimands are different

For the literal paper/tournament game-win objective, the direct estimand is the **natural tournament-protocol field mean**. For each rank and candidate physical seat, the fair coin selects the chooser and the chooser's frozen policy makes the GO_FIRST decision. The resulting actual-first/second mixture is part of the game being evaluated.

Let (p_{r,F}) and (p_{r,S}) be the conditional win probabilities when the candidate actually starts first or second. With a fair coin, the candidate-start weight is

[
w_C(r)=	frac12 a_C(r)+	frac12(1-a_O(r)),
]

where (a_C(r)) is the candidate's probability of choosing itself first when it wins the coin, and (a_O(r)) is the opponent's probability of choosing itself first when it wins the coin. The natural-protocol probability is

[
p_{mathrm{natural}}(r,s)=w_C(r)p_{r,s,F}+(1-w_C(r))p_{r,s,S}.
]

The equal-weight natural field mean averages this probability over 32 ranks and two candidate physical seats: **64 strata**. In this cohort, do not override GO_FIRST; record coin winner, chooser, chooser response, actual starter, and candidate physical seat.

The **equal-start conditional** estimand is different: it averages the candidate-first and candidate-second probabilities equally within every rank × physical-seat pair, producing **128 cells**. The host controls GO_FIRST after the fair coin to realize the assigned actual starter. This is useful as a sensitivity/diagnostic panel, but it is not automatically the natural tournament-protocol win rate.

Do not interchange these estimands, their sampling plans, or their certificates.

## Natural-protocol designs — direct game-win estimand

### A. IID uniform-rank Clopper–Pearson stream

Source: [Agent46 statistical evidence design](../methodology/2026-11/agent46-995-winrate-evidence-design.md).

The design samples the opponent rank uniformly from 1–32 with replacement, draws an independent game seed, and randomizes candidate physical seat 50/50. Its exact one-sided 95% Clopper–Pearson thresholds are:

| Nonwins | Aggregate games |
|---:|---:|
| 0 | 598 |
| 1 | 947 |
| 2 | 1,258 |
| 3 | 1,549 |

This is a natural-protocol test **only if** the fair coin and GO_FIRST decision are left to the frozen policies in every game. The current Agent46 report specifies rank sampling, seed randomization, and physical-seat randomization, but does not explicitly state the coin/GO_FIRST treatment. That must be clarified before treating it as the natural-protocol estimator. If the host controls the actual starter, the estimand changes.

Advantages: direct lower confidence bound for an IID uniform-rank mixture; straightforward sample-size and power calculations. Limitations: a deliberately balanced per-rank total is not IID and cannot use pooled Clopper–Pearson as though opponent ranks were randomly sampled. If there is an additional cell-coverage gate, specify it separately and do not pool a balanced panel into the IID stream.

### B. Balanced natural-protocol 64-stratum designs

These designs explicitly leave the fair coin and chooser's GO_FIRST decision to the frozen policies. The strata are opponent rank × candidate physical seat (32 × 2 = 64).

- **10 games per stratum (640 total), all wins:** null pass bound (0.995^{640}=0.0404363).
- **16 games per stratum (1,024 total), at most one nonwin:** exact heterogeneous worst-case null p-value **0.0362583523**. A predeclared two-look alternative checks all-win after 896 games and at-most-one-nonwin after 1,024, with combined alpha bound **0.0474651194**.
- **20 games per stratum (1,280 total), at most two nonwins:** exact heterogeneous worst-case null p-value **0.0459500438**. A predeclared two-look alternative checks all-win after 1,216 games and at-most-two-nonwins after 1,280, with combined alpha bound **0.0482035885**.

Sources: [Agent12's exact natural-protocol two-nonwin design](agent12-exact-two-loss-natural-64-strata-20261120.md), [Agent5's independent review of the one-nonwin design](agent5-natural-one-nonwin-proof-review-20261121.md), and [the statistical methodology index](README.md).

These are fixed-sample or explicitly predeclared finite-look aggregate tests. They assume independent games, fixed policies and per-stratum probabilities, fresh independent game randomization, complete source lists, and frozen engine/adjudication. The two-look schedules are not optional-peeking permissions. None establishes a 99.5% guarantee for every individual opponent.

## Equal-start conditional designs — sensitivity, not natural win rate

Source: [Agent12 exact two-nonwin field-mean design](agent12-exact-two-loss-field-mean-bound-20261114.md), implemented in the current mainline ledger evaluator and independently audited in [Agent39's proof review](agent39-audit-agent12-two-loss-field-mean-proof-20261114.md).

The 128 cells are opponent rank × candidate physical seat × actual starter. The host controls GO_FIRST after the fair coin to obtain equal first/second exposure. The 128-cell null is **sum(q_j) ≥ 0.64**, four times the 32-rank 0.16 nonwin budget because each rank has four equally weighted seat/first-player cells.

- **10 games per cell (1,280 total), at most two nonwins:** exact heterogeneous worst-case null p-value **0.0459500438**.
- The adjacent nine-per-cell / 1,152-game at-most-two-nonwin rule fails (equal-null p-value 0.0730831443).
- Other equal-start conditional fixed designs include five games per cell/all wins (640 total) and eight games per cell/at most one nonwin (1,024 total).

The exact branch requires a valid digest-bound fixed sampling registration and exactly 10 games in every cell. A valid ledger that does not match the exact quota/nonwin rule uses the heterogeneous KL method; an invalid or incomplete ledger/registration is rejected and produces no inference. The method is fixed-sample, not an anytime-valid procedure or a Clopper–Pearson interval.

The ledger currently accepts paper-qualified win/loss/tie statuses and rejects unqualified attempts. Its regressions explicitly fail closed on native-only, censored, engine-error, unqualified, and not-adjudicated outcomes, but do not define the mapping for a played terminal timeout or invalid-action abort. To align with the all-game definition, every such played terminal nonwin must be represented as a nonwin under the frozen adjudication protocol (for example, paper-qualified loss); a pre-game unqualified attempt must remain a ledger rejection.

## Repository gate resolution and remaining method detail

The root README and fixed-60 decision board now explicitly retain all **128 rank/seat/actual-starter cells** as a separate **mandatory equal-start conditional panel**. The direct tournament-protocol estimand remains the equal-rank field mean under the fair coin and frozen chooser policies' natural GO_FIRST decisions; its balanced design uses **64 rank × candidate-physical-seat strata**. Both panels are required for nomination under the current repository contract, but they answer different questions and must be reported separately. Never pool their outcomes or label the 128-cell conditional estimate as the natural tournament-protocol win rate. This resolves the prior ambiguity about whether the 128-cell gate was primary or additional.

The current natural chooser path is now source-inspected. `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs` resolves `CoinFlipPrompt` with the physical RNG (`physicalRandom() < 0.5`); the subsequent `GO_FIRST` `ConfirmPrompt` is passed through the native-owner-prompt path to the role worker. The current candidate policy's `chooseGoFirstSetup()` and the rank-1 policy's `GO_FIRST` branch both select the unique **Yes** choice. Thus whichever seat wins the physical coin elects to go first. This is a natural coin/chooser protocol for the current frozen policy pair, not a host-controlled actual-starter assignment. It is a deterministic affirmative default, not evidence of strategically competent GO_FIRST choice. Any IID natural-protocol stream must preserve and record these exact runner/policy hashes; changing either chooser policy changes the protocol and requires a new frozen policy version. The no-game seed-probe helper separately chooses Yes, but it is not the actual game path.

## Outcome accounting and field completeness

The primary denominator is all played games. Wins are successes; losses, draws, timeouts, illegal-action aborts, and other non-win terminal outcomes count as nonwins. The decisive-game fraction (wins/(wins+losses)) is a separate descriptive statistic and must not be substituted into the all-game target.

The equal-rank 32-rank target has a total nonwin budget of (32(1-0.995)=0.16). For an archetype occupying (m) ranks, (1-0.16/m) is a necessary group-average win floor even if all other ranks are certain wins; groups do not receive separate budgets.

The current field remains 29/32, with ranks 23, 25, and 28 unavailable. There is no final fixed 60 and 0/32 qualified competitive matchups. Neither natural-protocol nor equal-start conditional full-field certification is currently executable. No statistical design can compensate for missing opponent lists, weak or unqualified policies, unsupported paper rules, invalid simulation, correlated games, or an incomplete outcome ledger.
