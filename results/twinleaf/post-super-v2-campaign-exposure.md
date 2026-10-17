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

After this integration, the existing manual [benchmark statistics workflow 39034811677](https://github.com/FlareZ123/experiment-01/actions/runs/39034811677) completed successfully. That workflow runs the existing campaign and quality-screen regression suite, but **does not explicitly request the new v2 flag**. Attempts to update dedicated tests were rejected by the GitHub connection's safety validation, so there is not yet a committed v2-specific campaign round-trip regression. Do not call this end-to-end test complete.

Further required evidence: add a CI-backed v2-specific frozen-plan execution test with a true engine echo and a false-echo control, exercise mutually exclusive flags in both the runner and auditor, capture matched actual turn order and representative decisions, then compare a source-ranked match before considering simulator or policy qualification.

**No gameplay win-rate conclusion follows from enabling this transport.** The full Top32 remains 29 available exact lists / 32 scheduled ranks, with zero independently qualified competitive games at this checkpoint.
