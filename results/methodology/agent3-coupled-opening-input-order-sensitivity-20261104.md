# Agent 3: source-coupled opening comparisons depend on arbitrary legal input order

**4 November 2026 | Exact hypergeometric mathematical finding, historical source-list check and 5 pure regression tests. No native game was run, no qualified match was observed, and no candidate was promoted.**

## Research question and mechanism

The pinned [48-group original-source setup study](agent3-native-marginal-opening-coupling-20261104.md) uses [a separate deterministic per-seat shuffle stream](../../simulation/evaluation/agent26-per-seat-setup-shuffle-streams.cjs). Both candidates use **one identical integer seed for their physical candidate seat** while their two fixed-60 deck input arrays can contain different cards in the same source-row index. The shuffle algorithm computes a permutation of **indices** and applies it to the submitted array. Thus candidate **input ordering** can change which cards occupy a registered first-seven position under that seed.

For each candidate separately, under an ideal uniform shuffle, rearranging its initial 60-card order cannot change the marginal distribution of opening hands. When comparing two candidates using the **same index permutation**, however, the joint coupling depends on the positional overlap of Basic Pokémon across the two submitted lists. This changes how often both candidates mulligan in the same correlated replay and can change the downstream incidence of candidate-dependent opponent optional draws. The actual downstream rate additionally depends on repeated mulligans, source's own setup, choice to take optional cards and physical engine behavior.

The repository already supports [a separately versioned reference-aligned candidate input order](../../simulation/evaluation/aichi-candidate-input-order.cjs), but the 48-group study ran [raw source-row input order](../../simulation/evaluation/agent3-source-setup-audit.cjs) without an alignment alternative. A same-seed source physical mismatch under one input-order convention must **not** be construed as a universal property of the two unchanged deck compositions.

## Exact uniform-index first-attempt mathematics

Let `A` and `B` be sets of positions, among the 60 submitted indices, containing Basic Pokémon in the two candidates. The same ideal uniformly random permutation chooses a shared seven-index subset for the first hand. Let `a=|A|`, `b=|B|`, and `u=|A ∪ B|`. For a uniformly random initial seven-index subset, the exact probabilities of mulligan on a candidate or on both simultaneously are

```text
P(M_A)       = C(60-a, 7) / C(60, 7)
P(M_B)       = C(60-b, 7) / C(60, 7)
P(M_A & M_B) = C(60-u, 7) / C(60, 7)

P(M_A XOR M_B) = P(M_A) + P(M_B) - 2 P(M_A & M_B).
```

This is a true combinatorial statement for an **ideal uniform shared index subset**. It does not certify the finite xorshift32 native shuffle's exact marginal distribution or independence.

For the exact frozen rank-1 champion source 60 versus New Moon v1 proxy 60, the provided card database confirms Shadow Rider Calyrex VMAX (`swsh6-75`) is evolved and Dusclops (`sv6pt5-19`) is Stage 1; the other Pokémon in these exact two historical source compositions are Basic. Their 60-position row-order Basic masks have `a=14`, `b=17`, and the **actual submitted overlap `|A ∩ B|=12`**.

| Same two unchanged candidate 60-card inventories | Shared Basic positions | Joint first-attempt mulligan probability | Probability the two first-attempt mulligan indicators disagree |
| --- | ---: | ---: | ---: |
| Maximal Basic-position alignment by legal reordering of New Moon's existing cards | 14 | 8.343743% | **5.515325%** |
| **Historical source-row order actually used by the 48-group native study** | **12** | **5.821216%** | **10.560379%** |
| Minimal Basic-position alignment by legal reordering of those same existing cards | 0 | 0.404131% | **21.394550%** |

The Basic counts, exact printed card multiset, possible starting Pokémon identities, Energy/Trainer counts and paper rules of the original decks stay unchanged in both reordering extremes. The *joint* first-attempt mulligan disagreement varies by a factor of roughly **3.88** between the extreme valid input orders. The historical order happens to occupy an intermediate point. These percentages are **opening-index probabilities**, never probabilities of game wins or physically matched completed games.

## Reproduction

[Reusable pure CJS model](../../simulation/evaluation/agent3-coupled-opening-input-order.cjs) and [five regression tests](../../tests/agent3-coupled-opening-input-order.test.cjs) import the exact rank1 and New Moon source rows, verify the actual Basic index positions, assert stages of the two evolved Pokémon against provided local card-pool records, check the combinatorial identity for **all 15 possible overlaps 0 through 14**, verify symmetric A/B computations and fail closed on malformed 60s.

The [existing manual-only Agent 3 smoke workflow](../../.github/workflows/agent3-paper-counterfactual-smoke.yml) passed [CI 41770088420](https://github.com/FlareZ123/experiment-01/actions/runs/41770088420), checkout head `5d98c41eadb8b691c7a56ab07e1c059770103df7`, with the new pure suite included. The native Twinleaf compilation branch was deliberately **skipped**, and this contribution is mathematical rather than another source game.

This analysis does not alter the original [48-group artifact 13288243945](https://github.com/FlareZ123/experiment-01/actions/runs/41756953219/artifacts/13288243945): it still has 5/48 real physically mismatched original-source setups, all five accompanied by different actual source bonus-card counts. That 5/48 fraction is a downstream **native setup observation under one specific registered coupling**, while the percentages above concern only the candidates' first shuffle. They are different denominators and must not be equated.

## Field-estimator implications

1. **Register and preserve the input-order protocol before exposure.** Record each original candidate 60 by printing/count, its exact ordered engine copy array SHA and any intentional position-alignment treatment. Document the order convention alongside seed blocks and per-seat shuffle setup.
2. **Separate the experimental estimands.** Exact-source-opening counterfactuals require actually matching source fingerprints and an explicit preselected coupling. Unconditional win-rate differences require each candidate's correct natural setup marginal and all registered games, including physical mismatches and censored attempts. Only the latter can legitimately pool the five known mismatched setups if subsequent games are fully qualified under proven marginal sampling.
3. **Do not optimize the measured pairing rate post hoc.** Reordering an unchanged 60 to make source openings match more often is a design change to the common-random-number coupling. Doing so after observing which outcomes look good would invalidate prospective inference; a higher match rate alone gives no evidence of stronger competitive deck construction.
4. **Do not assume xorshift32 is uniform.** The ideal combinatorial formula is an analytical reference. Proper model validation remains necessary for any asserted `marginalSourceSamplingValidated:true` input to the [Agent3 unconditional field estimator](../../simulation/evaluation/agent3-attested-marginal-field-delta.cjs).

**Decision status unchanged:** 29 authenticated original card-name/count 60s of the final Top32, missing 23/25/28, zero competitively qualified games, no selected fixed 60 and no credible 99.5% field win evidence.

**Agent 3**
