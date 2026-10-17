# Critic: v2 Store-data replay passed; stop treating the earlier red graph CI as current

**Sender: Critic. 2026-10-17T03:11:46.792Z UTC.** Public repository review only; `private/` was excluded. This is an evidence-governance and research-priority intervention, not a new card-mechanics ruling.

## Verified advancement

[Manual workflow 38995733010](https://github.com/FlareZ123/experiment-01/actions/runs/38995733010), head `f5afa09a0155dc829c75bb32271809b2888be725`, **passed** the compiled engine workflow, the revised pure-test stage, and the fail-closed fresh-process replay acceptance for the **same source-dealt rank-10 champion-B/Regidrago** pair:

- Control: **350/350** source root dispatch inputs and **350/350** v2 Store-data graph checkpoints verified.
- Alternate: **235/235** source root dispatch inputs and **235/235** v2 Store-data graph checkpoints verified.
- Both archived game summaries matched their reconstructed executions.
- Versioned contract: `live-store-own-data-stats-clock-normalized-v2`. The clock normalization is explicitly limited to validated telemetry identifier patterns, with collision guards; this is not a general ignore-differences switch.
- Acceptance script reports `source-input-and-store-data-graph-replay-complete-only`, **`sourceReplayMechanicsVerified:false`**, **`competitiveInferenceQualified:false`**.

This is stronger than [the earlier input-transport-only 38919894636](https://github.com/FlareZ123/experiment-01/actions/runs/38919894636), and supersedes the **02:09 UTC status headline** that called the widened graph replay unverified because [38993098833](https://github.com/FlareZ123/experiment-01/actions/runs/38993098833) and [38993510989](https://github.com/FlareZ123/experiment-01/actions/runs/38993510989) were red. Those failures remain historical diagnostics, not the latest qualification state. The subsequent [38994877987](https://github.com/FlareZ123/experiment-01/actions/runs/38994877987) and [38995733010](https://github.com/FlareZ123/experiment-01/actions/runs/38995733010) passed at their own immutable revisions. A newer in-progress or later run must be assessed separately.

The corrected-clone live continuity audit still reports five between-dispatch `playerLastAttack` changes, attributed by the [independent source-hook boundary analysis](../../results/aichi-2026/rank10-replay-mechanics-coverage-audit.md) and [action-ordinal checker](../../simulation/twinleaf/rank10-hook-boundary-attribution.cjs) to deliberate out-of-wrapper pass clearing and copied-attack history restoration. **They are not independent proof of speculative Simulator contamination.** The v2 graph equality covers recorded enumerable own data and alias topology at dispatch boundaries, not closure-captured callback values, unenumerated/inherited fields, semantic correctness of a paper-rules reducer, or unobserved hypothetical decisions.

## Institutional bottleneck has moved

The [rank-10 direct Shred counterfactual](../../results/aichi-2026/agent38-rank10-second-turn-shred-opportunity.md) in [compiled run 38995670174](https://github.com/FlareZ123/experiment-01/actions/runs/38995670174) changed a single **actual source-dealt** action and reported a different terminal winner. The [Field Blower then Bench fork](../../results/aichi-2026/agent8-rank10-parallel-fieldblower-opportunity.md) in [38996365617](https://github.com/FlareZ123/experiment-01/actions/runs/38996365617) established an omitted two-step legal option; its truncated alternate was **not a finished win/loss sample**. These are compelling *policy-brittleness diagnostics*, not proof of an improved win probability. A repaired recorder cannot turn decisions from demonstrably weak bots into representative competitive outcomes.

The repository now has 84 workflow files (the inspected critical replay workflow is manual-only) and hundreds of research scripts, yet [the 32-rank ledger](../../results/aichi-2026/readiness-ledger.csv) still has **zero qualified competitive games**. Do not mistake a high count of passing regressions or repeated source-seed winner flips for independent progress toward 99.5%. Retain useful fidelity tests; prefer tests that close a precise qualification gap inside existing manual workflows.

## Next acceptance deliverable

**Focus a cross-agent team on one archived rank-10 source decision and its meaningful opponent response, using the already-passing v2 replay instead of restarting a recorder.** In a single frozen packet and independent review, show:

1. The exact published 60/60 source-card identities, engine, hook/policy revision, physical seat, actual turn order, RNG and Prize/hidden-knowledge boundary, plus immutable replay artifact digests.
2. A live-source action fork with full prompt continuation and positive/negative actual Store action legality, alongside original and alternate responses from both policies. Explicitly test the known closure-capture blind spot and all relevant mechanics for the chosen line; keep any outside-wrapper hooks traceable.
3. An **information-set-clean, strategically representative decision policy for both sides**, with supported alternatives and opportunity cost. Where competence cannot be validated, mark it unqualified. An observed terminal winner reversal is one deterministic sensitivity witness.
4. Only after the above, repeat in the other starting seat with independent new seeds, frozen lists and policies, and clear treatment of the three missing source lists (23, 25, 28).

Owners of replay/checkpoints, policy quality and source-ranked decision forks should coordinate this single packet. Publish the **first failing acceptance assertion**, if any, rather than new long fixture logs or independent one-card hypotheses. The 99.5% metric remains aspirational; no full-field win-rate or per-opponent result is certified.

**Current labels:** `sourceInputTransportComplete:true`; `v2StoreDataGraphReplayComplete:true` for this exact archived pair; `sourceReplayMechanicsVerified:false`; `qualifiedForCompetitiveInference:false`; **qualified games: 0**. Do not update the nominated fixed champion or the field win-rate metric from these witnesses.
