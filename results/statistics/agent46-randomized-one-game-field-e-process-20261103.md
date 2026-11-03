# A prospectively randomized one-game-per-step field test for the fixed 60

**Agent 46 | 3 November 2026 | mathematical methodology, 12/12 local pure Node regressions, no paper-qualified Aichi games.**

## Why this differs from the existing complete-field-round test

The existing [absolute 99.5% evidence module](agent46-absolute-995-field-e-process-20261102.md) requires full independent 32-, 64- or 128-cell opponent-field rounds. Its within-round product is not valid under arbitrary cross-cell dependence, and a single missing source printing prevents a fully authentic round. The new [sequential randomized module](../../simulation/evaluation/agent46-anytime-randomized-field-win-betting.cjs) allows one preregistered game at a time, with a freshly randomized opponent rank (and optionally physical candidate seat and actual starter). It never represents a partial round as a complete balanced round.

**Target:** for one physically fixed candidate printed 60, define an equal-weight field-cell mean win probability p = (1/C) Σᵢ pᵢ, where C=32 ranks, 64 rank×seat cells, or 128 rank×seat×starter cells. All decks, policies, rules, outcome qualification and the 25-minute paper clock must be frozen. The null is p ≤ p₀, with the precommitted default p₀=0.995.

## Derivation and validity assumptions

Before game t, sample a cell Iₜ uniformly over C, independently of the experiment history; conduct a fresh, independent qualified game with frozen cell-specific win probability pᵢ. If Xₜ is the candidate win indicator, then under the field-wide null

`E[Xₜ | history] = (1/C) Σᵢ pᵢ = p ≤ p₀`.

For a precommitted η in (0,1), the nonnegative factor `Fₜ(η)=1+η(Xₜ−p₀)/p₀` therefore has conditional expectation at most one. The product over successive games forms a nonnegative test supermartingale. As in the prior complete-field method, mix the 32 fixed ηⱼ=1−2⁻ʲ using weights proportional to 2⁻ʲ, and preallocate candidate-hypothesis ordinal k with αₖ=α/[k(k+1)]. The rejection threshold is k(k+1)/α. Ville's inequality and the candidate-family union bound justify arbitrary stopping when the **randomized assignment and fresh-game conditional-mean assumptions actually hold**.

The new test does not require complete fixed-size field rounds, equal observed cell counts, or independence of all C field outcomes simultaneously. It still requires proper conditional randomness and outcome distributions for each newly selected game. Reusing the same physical source deal, sharing a hidden random stream, allowing policies to learn adversarially between games, or cherry-picking which registered attempts count can invalidate the experimental assumptions.

Every censored, source-unadmitted, invalid-printing or absent-fingerprint trial is scored pessimistically as X=0. For each positive η its observed factor is no larger than the latent genuine factor, so an unknown native result cannot increase evidence. A reused valid source fingerprint is a hard error because the fresh-game assumption has become questionable.

## Registration protocol and limitations

The code uses Node's stable SHA-256 implementation to derive the field assignment from a revealed 32-byte random seed and consecutive zero-based trial index. It validates the supplied external commitment (SHA-256 of the raw seed bytes), assignment, rank/seat/starter geometry, frozen candidate print digest, authenticated original source-print digest, unique original physical deal receipt, registered trial order and game status. C ∈ {32,64,128} divides 2³² exactly, so the 32-bit digest-to-cell modulo step is arithmetically unbiased **if its input bits are uniformly random**.

**A seed hash and an external-registration ID are consistency checks, not independent proof of fair randomization.** A maliciously selected seed can bias the rank schedule; SHA-256-derived outputs are cryptographic pseudorandom assignments rather than a mathematical proof of independent uniform draws. Statistical error guarantees require external evidence that an unbiased, uncontaminated random seed was generated prospectively, never ground for favorable rank allocations, and that games were freshly sampled. For strict information-theoretic inference, use an externally audited independent uniform cell sampler and extend the validator to verify its signed assignment log. The external registry must also precommit the candidate ordinal, chosen estimand, rules, source roster, primary analysis, and outcome qualification.

A field-mean claim does not establish 99.5% strength in **every** matchup individually. Randomized samples can contain unequal rank counts; the resulting analysis targets the declared equally weighted field distribution. No rank-specific simultaneous lower bounds are produced.

## Synthetic numerical controls and current observations

| Hypothetical qualified outcomes | e-value | k=1, α=.05 threshold | Result |
| --- | ---: | ---: | --- |
| 768 independent randomized wins, zero nonwins | 16.584303 | 40 | Insufficient |
| 1,024 independent randomized wins, zero nonwins | 46.702028 | 40 | Rejects field-wide ≤99.5% null |
| 1,023 wins plus one nonwin or one censored event in 1,024 trials | below 40 | 40 | Insufficient |

All are **fabricated positive/negative controls**, not observations of an actual deck. Randomized rank counts are generally unequal, in contrast with the exact 32 games per rank in the earlier 1,024-game full-round example. The [12 pure regression tests](../../tests/agent46-anytime-randomized-field-win-betting.test.cjs) pass locally on Node 22, including a missing source 23/25/28 veto, wrong print, altered assignment, skipped trial, duplicated physical setup, fake native win, 64/128-cell seat/starter tampering and prospective familywise test allocation. The test is registered in the existing manual-only [global statistical CI](../../.github/workflows/aichi-global-field-gate.yml); a green remote run has not yet been established as of this report.

As of this report, only 29 of the 32 original printed Aichi Top 32 lists are authenticated (ranks 23,25,28 missing). **Zero** original-source matches have fully qualified competitive paper-game outcomes. This method cannot generate evidence for the actual 99.5% objective without an authenticated source list, competent symmetric two-seat original opponent policy, full paper cost/payment/outcome audit and official match-clock evaluation.

## Research choice

Keep the complete-round module for genuinely independent balanced cohorts. Use the randomized alternative where source opponents can be enrolled prospectively one game at a time under an externally audited randomization protocol. Do not route existing retrospective native attempt ledgers into either significance test as certified games. Source-policy competence and full-paper qualification remain the immediate practical bottlenecks.
