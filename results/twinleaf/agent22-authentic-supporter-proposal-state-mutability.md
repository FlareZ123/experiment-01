# Native Supporter proposal State mutation in canonical four-arm tests

**Agent 22, 20 October 2026.** A compiled positive witness for an actual pre-dispatch write to the real native Store State. This does not establish a rejected native proposal changing a game, legal paper-rule compliance, or a competitive win rate.

## Frozen experiment

Existing manually dispatched [workflow 39425376967](https://github.com/FlareZ123/experiment-01/actions/runs/39425376967) completed successfully. Workflow head `68d1857f442cd0e91310ccbbf4062a32afa2456c`; pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. [Artifact 12266295519](https://github.com/FlareZ123/experiment-01/actions/runs/39425376967/artifacts/12266295519) archives baseline and instrumented JSON, ZIP digest `8556f663eabd0b7745c17e2940b996062a9ce20bee74c453ba7641176ef3f322`.

The original canonical rank-6 Iron Thorns and rank-11 Absol/Garbodor historical physical deals were each replayed with fixed champion reference and New Moon candidate, under the same common policy and paper Supporter quota opt-in. The added default-off observer instruments actual native `SimpleTacticsAi.decodeNextAction`, `PlaySupporterTactic.useTactic`, and `Store.dispatch`. It fingerprints the root Store *State object identity* and owner `supporterTurn` before/after each tactic proposal, then correlates exact proposed action object identity to selected bot action and native dispatch.

| Historical arm | Real-root proposals | Real-root marker mutated | Native-dispatched proposals | Mutated proposals not selected |
| --- | ---: | ---: | ---: | ---: |
| Rank 6, champion reference | 4 | 4 | 4 | 0 |
| Rank 6, New Moon | 12 | 12 | 12 | 0 |
| Rank 11, champion reference | 12 | 12 | 12 | 0 |
| Rank 11, New Moon | 8 | 8 | 8 | 0 |
| **Total** | **36** | **36** | **36** | **0** |

All four observed arms matched their uninstrumented controls on the **complete root-action ledger SHA-256** and **physical source-deal fingerprint**, enforced by fail-closed workflow assertions. Focused observer and authenticated K0-epoch tests passed **9/9**.

## Interpretation and next falsification

**Critical correction to the scope of the observation.** The canonical historical registration fixes `supporterDecisionCorrection:true`. The research-owned `simulation/twinleaf/supporter-decision-hook.cjs` wraps the pinned upstream tactic and restores `owner.supporterTurn` in a `finally` block after the tactic returns. Our first observer sits **inside** that existing correction, so it witnesses the pinned tactic's **temporary** write before the enclosing hook's cleanup. The same archived JSON independently shows all 36 real-root dispatches had `quotaAtNativeDispatch:0`, followed by `quotaAfterNativeDispatch:1`. Therefore the first compiled four-arm run **does not establish an uncorrected, persisting State write at the actual Store dispatch boundary**. The hook is a plausible and independently source-confirmed explanation of the restoration. A second compiled read-only run explicitly instruments bot-exit and dispatch object identities to validate the full boundary. The uncorrected upstream behavior remains a hypothesis requiring a control with this correction disabled.


Pinned upstream `PlaySupporterTactic` assigns `player.supporterTurn=state.turn` while constructing its proposed action, before private `isValidAction` validates it. [Agent 50's source audit](agent50-supporter-proposal-state-mutation-and-rng-parity.md) documents this call ordering. This compiled test establishes that the assignment genuinely changes **live** Store-owned player objects during 36 selected native bot decisions. It does **not** supply a native rejected `isValidAction=false` witness. Our observer detects bot selection, while [Agent 38's complement](../../simulation/twinleaf/native-supporter-proposal-validation-observer.cjs) measures validation and policy RNG. Synthetic rejection tests do not qualify as actual native incidents. Later native Store counters and the [independent paper-quota audit](../aichi-2026/agent41-paper-supporter-bilateral-native-gate-20261020.md) remain separate.

Reusable files: `simulation/twinleaf/agent22-supporter-proposal-state-audit.cjs`, `tests/agent22-supporter-proposal-state-audit.test.cjs`, the existing canonical `simulation/evaluation/agent41-bilateral-v2-development.cjs`, and opt-in manual `supporter-decision-regression.yml`. The 128-entry per-arm record cap is explicitly reported.

**Next gate:** capture one actual validator-rejected native Supporter proposal, before/after live owner marker, following bot decision and Store effects, identical-source-deal control and matched policy RNG. A failed or censored attempt is evidence and must be retained. Do not certify hidden-information-safe policies, full rules fidelity, official clock behavior or competitive win rates from these historical mechanical fixtures.

**Field status:** 29/32 exact opposing 60s, missing 23/25/28; zero competitively qualified games, no validated final fixed 60 or 99.5% win rate.
