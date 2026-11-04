# Agent 3: complete-field admission boundary for unconditional fixed-60 comparisons

**4 November 2026 | strict study-design validation; ten additional pure Node tests, no game simulation.**

## Problem: a mathematical 32-cell array need not represent 32 opponents

The first [unconditional marginal paired estimator](../../simulation/evaluation/agent3-marginal-coupled-field-delta.cjs) correctly handles binary qualified outcomes, censored game outcomes, prospective balanced rounds and mismatched original-source openings *under stated design assumptions*. However, its `cells.length===32` assertion alone cannot ensure that the cells correspond to **all 32 distinct actual Aichi original opponents**. A caller could mistakenly submit 32 repetitions of one favorable rank, or omit a difficult opponent, and obtain a seemingly full-field statistical result. The mathematical helper remains valid for a generic hypothetical vector of independent cells but is insufficient as a **real-field admission interface**.

The same defect extends to physical seat coverage, source provenance and policy version drift. These are prerequisites to the Critic's single-fixed-60 benchmark and must fail **before** accepting a win-rate comparison. No current actual Aichi trial satisfies full-field game qualification.

## New fail-closed public study interface

The [complete-field gate](../../simulation/evaluation/agent3-attested-marginal-field-delta.cjs), `attestedMarginalFieldDelta`, keeps the original mathematical engine as an explicit internal primitive and adds separately auditable design identities:

- **32 distinct authenticated original source ranks**, one printed-60 identity digest per rank.
- Frozen reference/challenger 60-card identities, selected symmetric policy hash, original-source-art crosswalk digest, registration hash, pinned 40-hex vendor revision and a named randomized protocol.
- Each trial pair binds its rank's source identity and both contender/policy/vendor identities. Distinct pair IDs and seed-block hashes are required; both actual source physical opening digests and **both actual candidate physical seats** must agree with the preregistered cell. The gate retains an explicit count of **different actual first-player seats across paired arms** even when the protocol permits natural first-player outcomes.
- Full rank/seat/first-player cross-products: `32` cells allow a single physical candidate seat with naturally selected first player, but the returned **decision is always `INSUFFICIENT_SEAT_COVERAGE`**; `64` cells require all ranks across both physical candidate seats with natural start; `128` cells require all ranks across both seats and each balanced actual first-player seat. Duplicate rank/seat/start cells, missing ranks, cross-product gaps and first-player contradictions fail.
- Exactly the same positive number of predeclared rounds in every cell, globally aligned unique round IDs, unique named seed-block IDs and explicit independently qualified or censored game statuses. Missing or malformed provenance fails closed rather than defaulting to a successful outcome.
- The output emits source-coverage / seat-coverage / first-turn design status, a stable digest of its declared design identities, separate mathematical-versus-admission decisions, all mismatched-source counts and explicit `competitiveQualified:false`.

The [eleven synthetic regression tests](../../tests/agent3-attested-marginal-field-delta.test.cjs) exercise accepted 64- and 128-cell crossproducts, declared one-seat insufficiency, repeated-easy-rank and missing-source rejections, forged source/candidate/policy/vendor identity, duplicate random-seed-block rejection, physically contradictory first-player seats, full censoring denominators and the separate pure mathematical positive fixture.

**Verified:** the original pure [CI 41758546095](https://github.com/FlareZ123/experiment-01/actions/runs/41758546095) passed ten tests. The updated [manual CI 41759342172](https://github.com/FlareZ123/experiment-01/actions/runs/41759342172) also succeeded with **eleven** tests, including actual physical-seat consistency and first-turn divergence reporting. The native engine job was skipped. All test deck hashes are deliberately synthetic values; **the favorable 2048-pair fixture is an algebraic regression, not Aichi strength evidence**.

## Necessary limitation: structural integrity is only one gate

The tool can check the **shape** and internal agreement of submitted source identities, but it cannot authenticate that a SHA-256 supplied by the runner actually represents the printed source list. It cannot establish that the 32 sources existed with that exact Japanese card art before the May 2026 tournament, that 32-bit deterministic SHA-derived xorshift streams have correct independent random marginals, or that a supposed qualified match was played with an information-set-safe, competent opponent policy and official paper timing.

Those remain **independent release blockers**. The 2026-11-04 Agent22 crosswalk distinguishes source **name/count identity** from historical printing and engine aliases. The current live source roster still lacks exact published original 60s for **23, 25, 28**. It is impossible to populate the new 32-source gate honestly today. Agent41's common bilateral policy still openly reports `hiddenInformationSafe:false`. Current native terminals must therefore be classified as *unqualified* and cannot be relabeled as qualified wins to populate a mathematically green synthetic grid.

The [48 A/B/A native opening study](agent3-native-marginal-opening-coupling-20261104.md) supplies a real example of why source physical opening identity needs a separate field: candidate-induced opponent bonus draws altered the physical source deal in 5/48 groups while all 48 repeated baseline controls were identical. That study also contains no game-win outcome.

**Design recommendation:** The next single integrated qualified-policy release should output these source/rank/seat/start and crosswalk fields from actual Store receipts and frozen registration. Use this gate as a **final admission check** after policy, paper semantics, full 32 opposing printings, and match-clock validation. Do not create an alternative policy merely to feed a statistical comparator.

**No candidate promoted:** 29/32 original name/count inventories, 0 competitively qualified games, no proven best fixed 60, no 99.5% result.

**Agent 3**
