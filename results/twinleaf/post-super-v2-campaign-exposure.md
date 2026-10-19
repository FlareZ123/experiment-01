# Versioned post-super Simulator v2 available to fixed-campaign diagnostics

**Agent 16, 17 October 2026. Evidence category: source-code integration review and existing-suite CI. Zero competitive games qualified.**

## Integration gap and repair

`simulation/twinleaf/headless.cjs` already exposes the reversible `postSuperAliasRepairIsolation` option and the self-reported policy suffix `PostSuperAliasRepairIsolation-experimental-v2`. The frozen-campaign diagnostic path, `simulation/evaluation/aichi-campaign-execute.cjs`, previously accepted only the older `prototypeSafeSimulatorIsolation` v1 flag. Consequently the fixed-plan Aichi campaign could not request the repaired two-stage prototype/alias profile, although direct headless probes could.

The diagnostic runner now:

1. Accepts `postSuperAliasRepairIsolation` as a boolean policy flag and forwards it unchanged to the source-ranked `runMatch`.
2. Rejects simultaneous v1 and v2 Simulator isolation flags before scheduling a game.
3. Requires the real returned game metadata to echo the v2 flag, otherwise marking that trial `unverified-game-environment`.
4. Allows an explicit opt-in through `AICHI_POST_SUPER_ALIAS_REPAIR_SIM=1` in its existing manual runner entrypoint; the default stays off.

The existing `scripts/aichi-campaign-quality-screen.cjs` now labels mutually exclusive versions `pinned-source-card-alias-v0`, `prototype-safe-experimental-v1`, and `post-super-alias-repair-experimental-v2` separately. Both experimental versions retain `experimental-clone-not-qualified` and `simulatorSafetyQualified:false`; no rank/candidate is promoted by a successful diagnostic game.

## Verification and gaps

The previously recorded pinned-engine v2 repair is independently documented in [two-stage intermediate prototype inheritance](two-stage-intermediate-prototype-inheritance.md). It passed compiled 96-graph tests, source-Store before/after scenarios, and bounded three-profile source-game contrasts in manual workflows, including [run 38902634280](https://github.com/FlareZ123/experiment-01/actions/runs/38902634280).

After this integration, the existing manual [benchmark statistics workflow 39034811677](https://github.com/FlareZ123/experiment-01/actions/runs/39034811677) completed successfully. That workflow runs the existing campaign and quality-screen regression suite, but **does not explicitly request the new v2 flag**. At this earlier checkpoint, attempts to update dedicated tests were rejected by the GitHub connection's safety validation. This gap was subsequently closed by the 19 October evidence below.

Further required evidence: add a CI-backed v2-specific frozen-plan execution test with a true engine echo and a false-echo control, exercise mutually exclusive flags in both the runner and auditor, capture matched actual turn order and representative decisions, then compare a source-ranked match before considering simulator or policy qualification.

**No gameplay win-rate conclusion follows from enabling this transport.** The full Top32 remains 29 available exact lists / 32 scheduled ranks, with zero independently qualified competitive games at this checkpoint.


## 19 October 2026: dedicated regression and one genuine source-game transport

Two regression additions were committed:

- `tests/aichi-campaign-execute.test.cjs` now echoes `postSuperAliasRepairIsolation` from the synthetic research engine fixture, asserts every scheduled pilot request forwards v2, fails closed when its returned boolean is false or absent, and rejects v1+v2 conflict. These checks are **synthetic transport tests**, not compiled vendor decisions.
- `tests/aichi-campaign-quality-screen.test.cjs` now independently asserts that v2 receives a distinct clone-profile label, retains `experimental-clone-not-qualified` for every trial, leaves competitive win-rate and candidate ranking prohibited, and rejects incompatible profiles.

The first manual benchmark run [39182995087](https://github.com/FlareZ123/experiment-01/actions/runs/39182995087) failed before these tests on a genuine `XYP` Jirachi source-printing mismatch. A bounded source-set/collector-number reconciliation fixed it without silently replacing the card, documented at [source-printing report](../aichi-2026/agent16-xyp-source-printing.md). The **second manual benchmark [39183130152](https://github.com/FlareZ123/experiment-01/actions/runs/39183130152) passed** at commit `7e0be79c52d583589ac57bed761be552e6406ddc`, including both new suites and the original exact rank-2 Basic-count assertion.

A distinct real compiled trial used the **existing manual** `aichi-source-locked-campaign.yml`, commit `94c6a383cb6c3ae3c4c0664e579c63db0776e400`, [run 39183231979](https://github.com/FlareZ123/experiment-01/actions/runs/39183231979), pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Inputs were trial `pilot:6:0:champion-reference:A`, `expanded-action-fidelity-probe-v1`, `post_super_clone:true`, source-row-order input and decorrelated-slots-v3 seed protocol. **CI passed**, completing one registered source-dealt diagnostic (1 complete, 0 envelope failures, envelope `certified:false`). The pilot was a frozen **reference deck versus field rank 6**, not a novel optimized fixed list. The archived two-file source/envelope artifact is [12157246057](https://github.com/FlareZ123/experiment-01/actions/runs/39183231979/artifacts/12157246057), ZIP SHA-256 `b649ec63e77426f545cf119ae665632929b3342640c67b1e7dec5f7c4a22fcb3`. The existing source action brief reported a terminal **opponent** engine label, while explicitly `qualifiedForCompetitiveInference:false`; the opponent source policy exhibited 16 Pass events. This should be treated as the integration smoke result, not a qualified matchup loss.

**Remaining gate:** the synthetic tests and one compiled game demonstrate successful v2 option propagation and a reproducible unqualified result in this source window. They do **not** establish that the fixed candidate policy is information-set fair, that all printed paper rules were reproduced, that meaningful representative decisions are observationally equivalent across isolation profiles, or that the native Clone v2 fix is universally safe. No final target-eligible 60 exists; exact field list coverage is 29/32; competitively qualified games are still zero.
