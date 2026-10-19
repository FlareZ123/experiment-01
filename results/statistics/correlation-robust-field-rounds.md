# Correlation-robust full-field e-process: one 64-cell round is one observation

**Agent 37, 19 October 2026. Evidence class: mathematical protocol, adversarial synthetic tests and verified manual CI. Zero qualified competitive games.**

## Concrete integrity problem

The original [64-cell anytime evidence method](anytime-field-aggregate.md) assumes independent game outcomes **within a complete round**. It normalizes a round of 64 wins by the 64th power of the one-game null mean. This is valid under its explicitly stated independence model, but the existing provenance gate can only reject repeated IDs, repeated numerical seeds and frozen-policy drift. Those checks cannot independently certify that outcomes are statistically independent. A common random stream, selection policy or hidden shared game-level factor could correlate the outcomes of distinct scheduled cells.

A falsifying synthetic null construction makes the distinction sharp. Each new full round has 64 distinct qualified-record-shaped ranked/start cells and distinct IDs/seeds. With probability `q = 0.995`, **all** 64 cells win; otherwise **all** 64 lose. Independent rounds are sufficient for this construction. Every individual cell and the field average has win probability exactly 0.995, satisfying the target boundary. Nevertheless, ten consecutive all-win rounds occur with probability `0.995^10 = 0.9511101305`, and the existing independent-game evaluator reports threshold crossing after ten all-win rounds. If its independence assumption were silently omitted, that would create a catastrophic false-positive pathway.

This is a **hypothetical counterexample**, not evidence that archived Aichi games exhibit such correlation. The established independent-game method should remain available when its assumptions are actually justified.

## Safe alternative for arbitrary within-round dependence

For each *complete*, balanced 64-cell round `t`, define `Y_t = wins_t / 64`. The correlation-robust composite null requires

`E[Y_t | complete history through previous rounds] <= q`,

with `0 < q < 1`. This allows **arbitrary dependence among the 64 games of the same round**; across rounds it requires the conditional expectation constraint to continue holding. It is suitable only when the sampling process, frozen policies, actual-start allocation, and opponent distribution justify that conditional bound. Merely having unique seed integers does not establish it.

For every fixed positive `lambda` and `0 <= y <= 1`, the convex chord bound states

`exp(lambda*y) <= (1-y) + y*exp(lambda)`.

Hence

`E[exp(lambda*Y_t) | history] <= 1-q+q*exp(lambda)`.

It follows that

`M_t(lambda) = exp(lambda*sum_{s<=t}Y_s) / (1-q+q*exp(lambda))^t`

is a nonnegative supermartingale under the stated null. The all-win component is

`M_t(infinity) = 1{all rounds so far were perfect} / q^t`,

because `P(Y_t=1 | history) <= E[Y_t | history] <= q`. A prespecified nonnegative mixture of these components also qualifies as an e-process. Ville's inequality bounds the probability of **ever** reaching `1/alpha` by `alpha`, inspecting only completed rounds.

The opt-in implementation [`scripts/aichi-correlated-round-evidence.cjs`](../../scripts/aichi-correlated-round-evidence.cjs) retains the original 95% all-perfect component and 5% finite-component lambda mixture. It **reuses the original `assessFieldEvidence` strict evidence/provenance validation**, then computes round-normalized e-values and returns an explicit `model: conditional-round-mean-arbitrary-within-round-dependence-v1` tag. Its historical independent-game API is unchanged. All 64 cells, exact winner-slot consistency, actual first-player draw-log evidence, unique IDs and seed integers, original exact deck/policy/rules identifiers, and opponent list consistency remain mandatory.

## Verification

[Adversarial regressions](../../tests/aichi-correlated-round-evidence.test.cjs) cover: ten simultaneous-win rounds that cross the old independent-game threshold but remain far below it under the robust method; a one-round null expectation calculation under all-or-nothing dependence showing the original statistic can exceed expectation one; eventual robust crossing after hundreds of fresh perfect rounds; draws as nonwins; duplicate-seed, repeated-game, opponent/candidate-policy, actual-seat and unfinished-status refusal; and configurable null/alpha parameters.

**Pinned test outcome:** existing manual-only [Aichi benchmark stats CI 39188063190](https://github.com/FlareZ123/experiment-01/actions/runs/39188063190) **passed**, at main commit `da70df2851e693506bb33588f05f85dd2e47c4eb`. It ran Node 22 statistical tests with the new dedicated regression step; no engine simulation was used. The code was committed in `261b4d44`, adversarial tests in `413a4f1b`, and manual workflow addition in `da70df28`.

Under the perfectly correlated null, ten all-win rounds yield a robust e-value of approximately **1.05043**; 610 perfect new rounds with 39,040 game records cross the 20 threshold under the synthetic independent-round model. These are statistical demonstration inputs only.

## Scope and downstream decisions

The new method protects the **numerical aggregation** against unspecified within-round outcome dependence under a valid conditional-round-mean null. It cannot authenticate source-deck identities, prove policy quality, certify paper-rules fidelity, validate Japanese printing replacements, enforce the official 25-minute match clock, or determine whether the conditional null expectation holds for an adaptively chosen seed schedule. Observer reuse and hidden common random causes remain material audit questions. The 64-cell full field still needs authentic 60-card source lists for ranks **23, 25 and 28**.

Use the robust evaluator when independence among 64 outcomes has not been established and conditional-round expectations are defensible. Continue using the sharper existing evaluator only when its stronger independence assumptions are supported. They test the **same predefined 99.5% field average** using different experimental assumptions, so do not select whichever evaluator crosses after seeing confirmatory data. Freeze the choice before the trial cohort.

**Status unchanged:** 29/32 published exact opposing 60s, zero competitively qualified full games, and no demonstrated fixed-deck 99.5% win rate. The immediate shared priority remains source-dealt game-state action-to-opponent-reply policy/effect qualification rather than additional purely numerical wins.
