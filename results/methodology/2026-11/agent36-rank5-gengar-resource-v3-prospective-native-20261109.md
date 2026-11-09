# Resource-preserving Gengar v3: prospectively frozen native comparison shows no activation

**Agent 36 | 9 November 2026 22:42 UTC | native developmental experiment.** This report records the actual completed run of Agent50's already-frozen eight-deal v2/v3 experiment. Agent36 supplied the missing existing-manual-workflow execution path; no card, treatment-policy, or seed was changed. The research goal remains one fixed 60 against the complete Aichi Top32, not eight rank5 games.

## Native experiment completed

The independent registration [`agent50-rank5-gengar-resource-v3-fresh-eight-20261109.json`](../../aichi-2026/registrations/agent50-rank5-gengar-resource-v3-fresh-eight-20261109.json) froze eight Python-secrets-sampled original rank5 Mew/Genesect openings, four with candidate New Moon in each physical seat, before v3 policy execution. Both policies use the **same original and candidate printed 60s**, common source policy, Lillie's Determination owner-policy, public-hand-six GX timing and pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

- Control: existing flexible Gengar funding and retreat v2.
- Treatment: v3, which vetoes diversion of own held Psychic Energy to Benched Gengar **only when** it would instead make a presently unavailable public non-GX Perfection attack immediately payable on Active Mewtwo & Mew-GX.
- All eight source openings were compared under both policies; the root cap was 320. No trials were dropped.

[Manual native CI 42713396549](https://github.com/FlareZ123/experiment-01/actions/runs/42713396549) succeeded at research commit `2eb646e0333fd86a972da3d995948b1010785719`. [Complete uploaded raw tape artifact 13716198934](https://github.com/FlareZ123/experiment-01/actions/runs/42713396549/artifacts/13716198934) contains 16 native attempts and all physical Store tapes. Uncompressed JSON SHA256 `bff357a381065b4bfeb2742f171870dbdd266001e444b5e37b1fa9eea8a97ca2`; pair-result digest `2dc93263045815c7954b7a12aad7a68224cfeb75470b6fcc03edd2a68d6817ad`.

| Registered source deal | Candidate seat | v2 | v3 | First physical/action difference |
| --- | --- | --- | --- | --- |
| 50801 | A | source wins | source wins | none |
| 50802 | B | source wins | source wins | none |
| 50803 | A | source wins | source wins | none |
| 50804 | B | candidate wins | candidate wins | none |
| 50805 | A | both action-censored | both action-censored | none |
| 50806 | B | source wins | source wins | none |
| 50807 | A | both action-censored | both action-censored | none |
| 50808 | B | source wins | source wins | none |

**Observed:** 8/8 full physical source/candidate opening pairs matched, 8/8 accepted native action-ledger SHA pairs equal, **8/8 complete post-Store physical tapes identical**, six double-terminal pairs, two double-censored pairs, no engine errors. Each policy generated 58 candidate attack roots and 25 source attack roots across eight attempts. The six double-terminal pairs give one candidate and five source native wins **under either policy**. Across all eight matched pairs, the censor-aware treatment-minus-control candidate-win count remains `[-2,+2]`; treating both action caps as real losses would be invalid.

## Mechanism and concrete followthrough

This is a **zero-activation** result for a narrow decision policy, not evidence that preserving Active Perfection Energy is strategically irrelevant. The earlier original rank5 seed `50703/A` has a real v2 diversion of a held second Psychic from funded Active Mewtwo & Mew-GX to an unfunded Benched Gengar at root86, and a native outcome regression. V3's unit fixtures test that exact accessible two-Energy Perfection condition. Those historical root and winner observations motivated the v3 intervention, so they do not qualify as independent holdout evidence.

Agent36 registered an explicitly **posthoc** native v2/v3/v2 replay of exactly that historical seed in [`agent36-gengar-v3-original-regression-native.cjs`](../../../simulation/evaluation/2026-11/agent36-gengar-v3-original-regression-native.cjs), separated from these eight untouched seeds. Its purpose is to test one actionable actual Store funding error, including the physical Energy recipient and subsequent native reply. Its results belong in a separate subsection when available. A v3 treatment with no native action divergence in fresh rank5 cases should not be promoted to the shared default or advertised as winning more.

**Competitive qualification:** 0 games. This experiment contains no independent paper adjudication, official Aichi continuous clock or authorized competitive review. Only 29/32 original Top32 source inventories remain authenticated (missing ranks23/25/28); there is no established fixed winner of the field or credible 99.5% claim.

**Next practical decision:** if the historical diversion is corrected by real v3 play, preserve the rule as a targeted negative-cost guard and test it against additional **actual** Perfection resource-conflict cases before generalizing. Broad rank5 winner aggregates without a changed decision would repeat this null result. The broader fixed-deck optimization should prioritize active-attacker payability and meaningful legal opponent responses across all original archetypes.

## Reproducibility

- Fixed [registration](../../aichi-2026/registrations/agent50-rank5-gengar-resource-v3-fresh-eight-20261109.json), [runner](../../../simulation/evaluation/2026-11/agent50-rank5-gengar-resource-v3-fresh-eight.cjs), [policy](../../../simulation/twinleaf/2026-11/agent50-gengar-perfection-resource-guard-v3.cjs), [pure policy regressions](../../../tests/2026-11/agent50-gengar-perfection-resource-guard-v3.test.cjs).
- Existing [manual CI workflow](../../../.github/workflows/agent44-rank5-m4-paper-source-native.yml), dispatch input `mode=gengar-resource-v3`, source commit `2eb646e`.
- One accidental first dispatch entered the already-completed v2 replay due an over-broad workflow mode clause and was immediately cancelled as [run 42712963266](https://github.com/FlareZ123/experiment-01/actions/runs/42712963266). The corrected v3-only run above is the sole completed fresh v3 dataset; the old cohort was not counted.
