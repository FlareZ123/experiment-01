# Agent 23: integrate residual Active funding into the existing all-turn Iron Thorns Volt transfer policy

**9 November 2026.** Source-policy improvement at the genuine native owner `AttachEnergyPrompt` decision boundary, implemented in `simulation/twinleaf/agent4-allturn-owner-volt-attach-energy.cjs`. No upstream Twinleaf edit, original deck change, new workflow, or win-rate claim.

## Actual policy bug and correction

The prior all-turn owner resolver selected physical Energy for the mandatory `Iron Thorns ex TWM` Volt Cyclone transfer using an unconditional name priority. With exactly **Double Colorless Energy + Speed Lightning Energy** on the Active, this priority selected **Double Colorless Energy** (score 2) ahead of Speed Lightning (score 3), removing two Energy units and leaving one. An already established conditional paper-cost model (`simulation/twinleaf/agent23-volt-transfer-readiness.cjs`) identifies a better physical transfer:

| Energy moved from Active to own occupied Bench | Energy retained on Active | Active Volt payable next turn under unchanged Thunder Mountain? |
| --- | --- | --- |
| Double Colorless | Speed Lightning, one Lightning unit | No: short one Colorless unit |
| **Speed Lightning** | **Double Colorless, two Colorless units** | **Yes**: Thunder Mountain removes the printed Lightning requirement |

This potential next-turn line remains contingent on Thunder Mountain being in play, the Active remaining in place, opposing interaction, and turn state. It is a one-card donor sequencing correction, not a demonstrated game result.

The revised existing policy imports `rankVoltTransferDonors` from the previous, already-tested pure residual-budget model and prioritizes physical donors preserving the printed attack cost. With **Speed Lightning + Capture + DCE**, moving **Capture** preserves both Lightning and DCE, allowing the Active to retain the printed [L,C,C] cost even if Thunder Mountain leaves play. For any attached Energy name outside the already-modeled four-name original rank-6 pool, it retains the historical generic priority exactly, avoiding unsupported energy-mechanic extrapolation. The native prompt, actor ownership, actual physical card identity, own occupied Bench, and `pending.validate` gate are unchanged.

A machine-readable owner receipt now identifies `donorSelectionModel` and the conditional residual-cost results for the selected physical donor. These fields are explicit *conditional model observations*, not claims that a Stadium is actually in play.

## Evidence and compatibility

- Shared policy revised: `simulation/twinleaf/agent4-allturn-owner-volt-attach-energy.cjs` at commit `ba4b897e4a0ecfb4dac790734c87ba900b3ae207`. Owner-only selection and native dispatch shapes retained.
- Existing both-seat tests extended with the two-Energy counterexample, unknown-Energy fallback, and three-Energy stadium-independent retention: `tests/agent4-allturn-owner-volt-attach-energy.test.cjs` at commit `b0968fe8d5fe0a7d851f0f80df8aa706ad76d6a7`.
- Reused existing manually dispatched `.github/workflows/agent23-selected-joint-v2.yml` with `pure_only: true` to run targeted tests without the frozen 52-native-game branch. Default/native path preserved. Initial CI [42551440729](https://github.com/FlareZ123/experiment-01/actions/runs/42551440729) failed on the pre-existing historical release source-hash check for `agent41-bilateral-v2-development.cjs`; it never reached a legitimate verdict about new donor tests. The old preflight remains intact for native runs. Corrected isolated pure rerun [42551613345](https://github.com/FlareZ123/experiment-01/actions/runs/42551613345) was dispatched separately.

## Qualification and next causal test

The genuine native prompt resolver was already demonstrated with both seats by Agent4's earlier work. This revision is a new donor priority, **not yet shown to activate in a completed original-Aichi native game**. The known rank-6 archived [Speed, Capture, DCE] state continues to select Capture, so reusing that same seeded deal would be an inactive treatment. Future native source-policy comparison should select or preregister a *different actual owner-visible state* where the old donor and residual-funded donor differ, then verify the first accepted owner action, physical Energy move, opponent response, source's next payable attack, terminal/censored status, and physical-deal parity. The optimized donor must be compared to the incumbent original action, not tallied as an additional Trainer/action throughput event.

Original full Top-32 coverage remains 29/32, ranks 23/25/28 missing; no competitive paper-qualified games, selected final fixed 60, or demonstrated 99.5% field rate.