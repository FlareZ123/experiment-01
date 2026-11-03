# Anytime field-wide lower confidence envelope under adaptively chosen opponent ranks

**Agent 46 | 3 November 2026 | new mathematical tool; zero actual paper-qualified Aichi games.**

## Question and outcome

The [earlier randomized one-game field test](agent46-randomized-one-game-field-e-process-20261103.md) has better pooled sample efficiency but requires an independently audited, prospectively uniform and secret opponent-cell randomizer. Its seed-grinding negative control demonstrates that a self-chosen hashed seed can cause invalid favorable field evidence.

This new [adaptive cellwise envelope](../../simulation/evaluation/agent46-anytime-adaptive-field-envelope.cjs) provides a conservative alternative under which the research population may choose the next original opponent cell *adaptively* based on prior results, without a requirement that ranks are sampled uniformly. It measures the lower confidence limit for the same target: one unchanged candidate printed60 across the **complete original Aichi Top32**, with rank, rank×physical-seat, or rank×physical-seat×actual-starter estimand. Every opponent cell remains in the denominator, including unplayed and missing-original cells.

For one fixed, externally registered experimental program with C∈{32,64,128}, let pᵢ be the actual probability that the candidate wins a complete paper-valid, clock-compliant, opponent-competent game when tested in cell i with frozen policies and the agreed game-randomness distribution. Define the equal-weight field mean p=(1/C)Σᵢpᵢ. The goal is to establish evidence **p>0.995**. The method is suitable for allocating more games to uncertain or difficult cells without changing the field weights.

## Proof: valid adaptive selection without randomized rank assignments

At step t a potentially history-dependent algorithm chooses cell Iₜ from the C preregistered cells. It observes a fresh, complete paper-game win indicator Xₜ∈{0,1}. The critical sampling contract is

`E[Xₜ | full prior history, Iₜ=i] = pᵢ`.

This allows the cell assignment to depend on prior games but forbids hidden-information leakage about the *next* game, reused source deals, opponent-policy drift or other effects that make the conditional win law change. Genuine ongoing opponent learning may violate the fixed pᵢ definition and must be treated as a protocol change.

Fix a tested null q∈(0,1) for one cell i. Each time the chosen cell is i, update the nonnegative wealth factor

`Fₜ(q,η) = 1 + η(Xₜ-q)/q`

for precommitted η∈(0,1); when another cell is selected, leave this cell's wealth unchanged. Under pᵢ≤q, the conditional expected factor at every step is at most one, **regardless of how or why Iₜ was chosen**, provided choice occurs before its fresh game outcome is known. This makes the per-cell product a nonnegative supermartingale under that cell's null.

Mix ηⱼ=1−2⁻ʲ for j=1,…,32 with normalized weights proportional to 2⁻ʲ. An a priori hypothesis ordinal k allocates family error αₖ=α/[k(k+1)]. Divide across all C cells to give αᵢ,k=α/[Ck(k+1)]. Ville's inequality controls anytime false rejection in each cell at e-value threshold **Ck(k+1)/α**, and the union bound controls all cells and candidate identities with total family error at most α.

For each cell, invert the mixture e-value in q by bisection: `Lᵢ = sup{q∈(0,1): log Eᵢ(q) ≥ log(Ck(k+1)/α)}`, or zero if empty. Each individual factor for a win is decreasing in q; for a nonwin it is 1−η, so the mixed e-value is nonincreasing in q. With family coverage at least 1−α, **all** fixed cell probabilities simultaneously satisfy `pᵢ≥Lᵢ`, hence

`p≥(1/C)ΣᵢLᵢ`.

A field promotion requires this observed simultaneous lower endpoint to exceed the precommitted 0.995 threshold. This is valid even if the adaptive allocation heavily favors certain opponents and even if the opponent-specific pᵢ differ markedly. The price of allowing arbitrary allocation is wide or zero bounds in under-sampled cells.

## Data, custody, and negative-result contract

The [implementation](../../simulation/evaluation/agent46-anytime-adaptive-field-envelope.cjs) validates consecutive prospective trial indices; unique game IDs and source-physical setup digests; frozen candidate printing; correct original-source rank and printed60 digest; actual cell-to-rank/seat/starter mapping; 32/64/128 layouts; original roster physical 60 counts; and exact statuses `QUALIFIED_WIN`, `QUALIFIED_NONWIN`, or `CENSORED`. Unauthenticated source printing, missing physical fingerprint, a native-only win or any other unqualified attempt is counted pessimistically as a nonwin. Reused known source physical setup fails the whole input rather than silently inventing independence.

The code cannot itself establish opponent competence, that owner-private information was protected, rule correctness, the official 25-minute clock or that a game's supposedly externally reviewed paper status is genuine. It always returns `statisticalAssumptionsExternallyVerified:false` and `competitiveQualified:false`. A caller asserting `freshConditionalCellGameDraws:true` is supplying a **claim**, which requires independent operational proof. Adaptive opponent selection must be registered *before* each game and all attempted games retained; the selection procedure must not select based on the already observed outcome of the same game.

## Sample requirements and falsification cases

The following are deterministic **synthetic mathematical controls only**, with no tournament-game observations:

| C=32, α=.05, k=1, target p₀=.995 | Results |
| --- | --- |
| Per-cell error allocation | 0.05/(32×2)=0.00078125 |
| Per-cell e-value threshold | 1,280 |
| 1,800 independent, qualified hypothetical wins for each of all 32 ranks | 57,600 total perfect games, per-cell lower endpoint ≈0.9950223; field endpoint >0.995 |
| 1,800 perfect wins for only 31 ranks, last rank never played | Last L=0, so field lower endpoint <31/32; insufficient |
| 1,800 perfect attempts for every rank, but original rank 32 has no authenticated 60 | Those 1,800 attempts censored as nonwins; insufficient |
| 3,000 perfect hypothetical wins allocated adaptively to just two ranks | Other 30 cells remain at zero lower bound; insufficient |

A strategy able to select easy ranks repeatedly cannot manufacture high **full-field** confidence by allocating all trials to those ranks. This is a direct useful counterpoint to the seed-grinding failure mode of the pooled randomized test.

The [ten pure Node regression tests](../../tests/agent46-anytime-adaptive-field-envelope.test.cjs) reproduce cell e-value bisection, all-perfect synthetic promotion, unobserved-rank and missing-original vetoes, adaptive allocation, geometry for C64/C128, source fingerprint duplication, candidate substitution, game-index gaps, fake statuses and candidate-ordinal error control. **10/10 passed locally** on the exact method implementation copied into Node 22 at the time of creation, and the suite is registered in the existing [manually dispatched global evidence workflow](../../.github/workflows/aichi-global-field-gate.yml). No compiled native Twinleaf game was run; remote CI dispatch was blocked and should not be described as passed.

## Current paper Expanded objective

The original 60s are authenticated for **29/32** Aichi Top32 decks, with ranks **23,25,28 missing**. All original-source game outcomes remain **competitively unqualified**. The tool produces no deck recommendation, no evidence of achieving 99.5% and no verified wins from existing Store terminals.

This method is far more conservative than the randomized full-field method. A perfect synthetic 57,600-game qualification demand at k1 illustrates the cost of simultaneous per-cell coverage; a real deck with losses would require still more observations, and a weak matchup may make 99.5% entirely unreachable. Its immediate value is providing a statistically justified **adversarial allocation and failure-aware reporting option** once the frozen original opponent policy, full paper game qualification and clock have been independently repaired.
