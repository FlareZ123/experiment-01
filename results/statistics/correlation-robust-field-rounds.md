# Correlation-robust full-field e-process: one 64-cell round is one observation

**Original protocol: Agent37, 19 October 2026. Chord-bet refinement: Agent42, 18 November 2026, independently reviewed by Agents17 and12. Evidence class: mathematical protocol, adversarial synthetic tests and verified manual CI. Zero qualified competitive games.**

## Concrete integrity problem

The original [64-cell anytime evidence method](anytime-field-aggregate.md) assumes independent game outcomes **within a complete round**. It normalizes a round of 64 wins by the 64th power of the one-game null mean. This is valid under its explicitly stated independence model, but the existing provenance gate can only reject repeated IDs, repeated numerical seeds and frozen-policy drift. Those checks cannot independently certify that outcomes are statistically independent. A common random stream, selection policy or hidden shared game-level factor could correlate the outcomes of distinct scheduled cells.

A falsifying synthetic null construction makes the distinction sharp. Each new full round has 64 distinct qualified-record-shaped ranked/start cells and distinct IDs/seeds. With probability `q = 0.995`, **all** 64 cells win; otherwise **all** 64 lose. Independent rounds are sufficient for this construction. Every individual cell and the field average has win probability exactly 0.995, satisfying the target boundary. Nevertheless, ten consecutive all-win rounds occur with probability `0.995^10 = 0.9511101305`, and the existing independent-game evaluator reports threshold crossing after ten all-win rounds. If its independence assumption were silently omitted, that would create a catastrophic false-positive pathway.

This is a **hypothetical counterexample**, not evidence that archived Aichi games exhibit such correlation. The established independent-game method should remain available when its assumptions are actually justified.

## Safe alternative for arbitrary within-round dependence

For each *complete*, balanced 64-cell round `t`, define `Y_t = wins_t / 64`. The correlation-robust composite null requires

`E[Y_t | complete history through previous rounds] <= q`,

with `0 < q < 1`. This allows **arbitrary dependence among the 64 games of the same round**; across rounds it requires the conditional expectation constraint to continue holding. It is suitable only when the sampling process, frozen policies, actual-start allocation, and opponent distribution justify that conditional bound. Merely having unique seed integers does not establish it.

For every fixed positive `lambda` and `0 <= y <= 1`, define the chord e-factor

`B_lambda(y) = [1+y*(exp(lambda)-1)] / [1-q+q*exp(lambda)]`

or, in the numerically stable form used by the implementation,

`B_lambda(y) = [y+(1-y)*exp(-lambda)] / [q+(1-q)*exp(-lambda)]`.

Since `E[Y_t | history] <= q`, its conditional expectation is at most one. Convexity gives `exp(lambda*y) <= 1+y*(exp(lambda)-1)`, so `B_lambda(y)` pointwise dominates the former exponential factor `A_lambda(y) = exp(lambda*y)/(1-q+q*exp(lambda))`. The finite-component process is

`M_t(lambda) = product_{s=1..t} B_lambda(Y_s)`,

a nonnegative supermartingale under the stated null. Its `lambda -> infinity` limit is the separate component

`M_t(infinity) = product_{s=1..t} (Y_s/q)`,

which is also a nonnegative supermartingale and pointwise dominates the former all-perfect indicator component. The prespecified 95% limit-component / 5% equally divided finite-lambda mixture is therefore an e-process. Ville's inequality bounds the probability of **ever** reaching `1/alpha` by `alpha`, inspecting only completed rounds.

The opt-in implementation [`scripts/aichi-correlated-round-evidence.cjs`](../../scripts/aichi-correlated-round-evidence.cjs) **reuses the original `assessFieldEvidence` strict evidence/provenance validation**. It maintains separate cumulative log products for each finite chord factor and the `lambda -> infinity` limit; the stable log expression avoids cancellation at `y=0` for the largest registered lambda. It returns the unchanged conditional-round-mean model tag plus `eProcess: convex-chord-mixture-v1`. The historical independent-game API is unchanged. All 64 cells, exact winner-slot consistency, actual first-player draw-log evidence, unique IDs and seed integers, original exact deck/policy/rules identifiers, and opponent list consistency remain mandatory.

**Campaign-ledger companion (structural validation only).** The same module exports `assessCorrelatedFieldCampaign`. It requires a fixed registration for all 32 opponent identities and the candidate/policy/engine/rules/runner hashes; each `round-start` precommits exactly 64 assignments before a host-signed orientation receipt; append-only hash-chained game records must reconcile to one `round-complete` or `round-abort` terminal. The validator checks one candidate A and B game per rank, the shared-coin diagonal, unique trial/game/seed/deal commitments, distinct candidate/opponent policy-process IDs, and the registered fresh-process-per-game / `FAIL_CLOSED` abort contract. Missing registered attempts or terminal records, partial rounds, and explicit aborts reject the supplied ledger. The abort rule is ledger-local: a caller could submit a new campaignId after an abort unless an external campaign-global registry/custodian binds all attempts and forbids re-registration. Tests cover incomplete/omitted games, missing terminals, explicit aborts, chronology and identity drift.

This does **not** create a game runner or receipt producer. The result is deliberately `STRUCTURALLY_VALID_EXTERNAL_AUDIT_REQUIRED` with `competitiveAdmissionEligible:false`; external signature verification, coin fairness/independence, physical-deal independence, actual process isolation/reset, fixed-policy identity, and paper qualification remain unverified. The receipt envelopes and digest links are checked structurally, not cryptographically. The validator checks only self-reported chronology: its registration and round-start timestamps are not independently anchored, so an auditor must verify an externally timestamped round-start commitment predates the trusted-host CSPRNG draw and inspect the entropy transcript. The ledger also cannot prove that an external producer did not omit an entire round before recording its `round-start`; a new campaignId can evade the per-ledger abort check. Campaign-global custody, independent timestamping, and stopping policy remain external. The simple `assessCorrelatedFieldEvidence` API remains a caller-supplied-round evaluator, not a substitute for the ledger-aware path.

## Verification

[Adversarial regressions](../../tests/aichi-correlated-round-evidence.test.cjs) cover: ten simultaneous-win rounds that cross the old independent-game threshold but remain far below it under the robust method; a one-round null expectation calculation under all-or-nothing dependence; stable chord-factor agreement for all 65 attainable win fractions; pathwise dominance over the former exponential mixture; a non-degenerate exact-null expectation; unchanged all-perfect crossing at 603 rounds; the deterministic one-63/64-round-per-100 path crossing at 622 rounds; draws as nonwins; duplicate-seed, repeated-game, opponent/candidate-policy, actual-seat and unfinished-status refusal; and configurable null/alpha parameters.

**Pinned test outcome:** existing manual-only [Aichi benchmark stats CI 39188063190](https://github.com/FlareZ123/experiment-01/actions/runs/39188063190) **passed**, at main commit `da70df2851e693506bb33588f05f85dd2e47c4eb`. It ran Node 22 statistical tests with the new dedicated regression step; no engine simulation was used. The code was committed in `261b4d44`, adversarial tests in `413a4f1b`, and manual workflow addition in `da70df28`.

Under the perfectly correlated null, ten all-win rounds yield a robust e-value of approximately **1.05043**. An all-perfect path crosses at **603 rounds (38,592 games)**, unchanged by the chord refinement. On a deterministic path with one 63/64-win round every 100th round and all other rounds perfect, the chord mixture crosses at **622 rounds (39,808 games)**, versus 1,743 rounds for the former exponential mixture. These are deterministic synthetic paths, not expected stopping times or game evidence.

## Scope and downstream decisions

The new method protects the **numerical aggregation** against unspecified within-round outcome dependence under a valid conditional-round-mean null. It cannot authenticate source-deck identities, prove policy quality, certify paper-rules fidelity, validate Japanese printing replacements, enforce the official 25-minute match clock, or determine whether the conditional null expectation holds for an adaptively chosen seed schedule. Observer reuse and hidden common random causes remain material audit questions. The 64-cell full field still needs authentic 60-card source lists for ranks **23, 25 and 28**.

Use the robust evaluator when independence among 64 outcomes has not been established and conditional-round expectations are defensible. Continue using the sharper existing evaluator only when its stronger independence assumptions are supported. They test the **same predefined 99.5% field average** using different experimental assumptions, so do not select whichever evaluator crosses after seeing confirmatory data. Freeze the choice before the trial cohort.

**Status unchanged:** 29/32 published exact opposing 60s, zero competitively qualified full games, and no demonstrated fixed-deck 99.5% win rate. The immediate shared priority remains source-dealt game-state action-to-opponent-reply policy/effect qualification rather than additional purely numerical wins.
