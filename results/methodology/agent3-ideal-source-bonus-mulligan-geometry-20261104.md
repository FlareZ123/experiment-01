# Agent 3: exact ideal source bonus divergence under two correlated candidate mulligan streams

**4 November 2026 | Mathematical geometric-model derivation and actual historical source Basic-count check. Not a native win-rate study.**

## Motivation

The [48-context native setup-only audit](agent3-native-first-mulligan-48-seed-reconstruction-20261104.md) independently reconstructed all **96/96 first candidate mulligan decisions** using the actual registered seeds and first shuffled seven positions. It additionally verified all **96/96 original source optional bonus-card counts** satisfy `bonus = max(candidate_mulligans - source_mulligans, 0)`, in that specific archived native setup. Of six different candidate first-mulligan indicators, five led to different source bonuses and physically different original source openings. The sixth was masked by the source also mulliganing.

A simple coupling model that only predicts candidate first-mulligan disagreement therefore overstates how often the **original source actually receives a different number of bonus cards**. The source's own Basic count matters, potentially substantially.

## Exact formula in a strictly specified ideal model

Assume three ideal decks, each shuffled independently between attempts by uniform random permutations of the 60 distinguishable input positions, except that the two **candidate arms share the same random index permutation for their corresponding candidate attempt**. The source has an independent uniform shuffle stream, and when a player completes setup the other player can continue any mulligan redraws. The source elects to draw **every optional compensation card** allowed by the net excess of opponent mulligans. This describes a mathematical reference model; actual fixed 32-bit xorshift seeded Store streams are deterministic and are **not independently certified to have these marginals**.

Let `C_A`, `C_B` denote candidate mulligan counts before each gets its first legal Basic, and `S` the corresponding source count. The source's two possible bonus-card counts are

```text
E_A = max(C_A - S, 0),   E_B = max(C_B - S, 0).
```

The source's Basic count is `s`. Let `qS = C(60-s,7)/C(60,7)`, and let `qA`, `qB` and `p11` be the candidates' first-shuffle Basic-free probabilities, with `p11` the chance both candidate arms mulligan on that shared draw. Let `p00 = 1 - qA - qB + p11`, the chance both succeed. Each joint candidate attempt is independent of previous attempts under the *ideal model*. Then

```text
P(E_A != E_B)
  = (1-qS) * [
       qA / (1-qS*qA)
     + qB / (1-qS*qB)
     - (1+p00/(1-p11))*p11 / (1-qS*p11)
    ].
```

**Derivation.** Condition on exactly `S=t` source mulligans. `E_A != E_B` occurs precisely when the two candidates have different eventual mulligan counts and at least one exceeds `t`. The probability either candidate needs beyond `t` retries is `qA^(t+1)+qB^(t+1)-p11^(t+1)`. Among these, equal candidate counts beyond `t` have mass `[p00/(1-p11)]*p11^(t+1)`: both candidate arms must fail together for their first `k` attempts and succeed together at attempt `k`, for some `k>t`. Subtracting equality, then averaging over the independent geometric source count `P(S=t)=(1-qS)qS^t`, yields the three closed geometric sums above. No arbitrary finite mulligan cutoff is used.

The candidate-coupling probabilities `qA`, `qB`, `p11` are obtained from [exact hypergeometric source Basic-position analysis](agent3-coupled-opening-input-order-sensitivity-20261104.md), so input-order overlap still matters.

## Original frozen rank5 and rank6 source case

The original source rank5 Mew Genesect 60 contains **11 Basic Pokémon** (Mew V ×4, Genesect V ×4, Dedenne-GX ×1, Crobat V ×1, Clefairy ex ×1; Mew VMAX ×3 is an Evolution). Rank6 Iron Thorns contains **4 Basic Pokémon** (four Iron Thorns ex). The two candidate historical frozen 60s contain **14 and 17 Basics**, respectively, with **12 shared Basic input indices**. Their own first-attempt mulligan probabilities are `qA=13.859068%`, `qB=8.343743%`, and shared simultaneous `p11=5.821216%`.

| Ideal uniform-shuffle reference quantity | Original rank5 (11 Basics) | Original rank6 (4 Basics) |
| --- | ---: | ---: |
| Source first-attempt mulligan probability | 22.242114% | 60.050037% |
| Probability both candidate policies yield a **different source bonus-card count** under original source-row input order | **9.072429%** | **4.999042%** |
| Expected bonus-disagreement contexts in 24 independent reference contexts | 2.18 | 1.20 |
| **Actually observed in the earlier 24-context-per-rank native setup archive** | 4 | 1 |

The observations are authentic fixed-seed native setup results. The predictions are **ideal distribution reference expectations** under extra assumptions, calculated after seeing the archived data. They are compatible in scale and direction, but 24 contexts per rank, deterministically registered seeds and no native seed-randomness validation do **not** support a goodness-of-fit, calibration or competitive win-rate claim. The rank6 masking of the extra candidate mulligan in `6:11:B` is an exact, separately verified physical witness.

Reordering the **same 17 Basic copies** of New Moon while preserving all other card copies produces different model probabilities for source bonus divergence:

| New Moon Basic-position overlap against champion | Rank5 predicted source bonus divergence | Rank6 predicted source bonus divergence |
| --- | ---: | ---: |
| Maximal 14 | 4.906462% | 2.741320% |
| Original 12 | 9.072429% | 4.999042% |
| Minimal 0 | 17.168387% | 9.259532% |

These are analytic reordering counterfactuals on **unchanged candidate deck compositions**, not rerun native source setups. The strong rank-specific effect comes from the source's own Basic scarcity and repeated mulligan opportunities. It explains why the earlier observed five source physical mismatches cannot be inferred solely from how often the candidates' first seven differ.

## Reproduction and independent validation

[Pure CJS implementation](../../simulation/evaluation/agent3-source-bonus-coupled-mulligan-model.cjs) uses the true exact `choose` reference function and the two source-row Basic masks. [Four tests](../../tests/agent3-source-bonus-coupled-mulligan-model.test.cjs) independently enumerate all pairs of candidate geometric mulligan counts up to **24 failures per arm**, obtaining total modeled mass 1 to machine precision and matching the closed expression for source Basic counts 1, 4, 11, 14, 20 and 60, plus symmetry/degenerate and fail-closed cases. The finite check is merely a numerical cross-validation; the actual formula uses the untruncated infinite sums.

[Manual-only pure smoke CI 41771333070](https://github.com/FlareZ123/experiment-01/actions/runs/41771333070) passed all tests at the recorded shared source revision. A later [manual CI 41771474775](https://github.com/FlareZ123/experiment-01/actions/runs/41771474775) also passed after adding the explicit all-96-native-source-bonus identity test. No native compilation was requested. Source card stages and every candidate Pokémon's Basic flags were validated against the provided paper/card database in the preceding CI.

## Decision and limitation

A future comparison that wants **exact matched source physical openings** should expect a substantial dependence of its matching yield on candidate input-order coupling and source Basic counts, and must register the source physical fingerprint test before outcomes. An **unconditional candidate deck-win contrast** should instead retain all registered trials and prove correct per-candidate source-setup marginals rather than conditioning on observed matching. Both approaches need genuine owner-safe policy, paper mechanics, all 32 original source lists, actual turn order and clock qualification. This analytic model proves **nothing** about the 99.5% field win target or native RNG fidelity.

**Agent 3**
