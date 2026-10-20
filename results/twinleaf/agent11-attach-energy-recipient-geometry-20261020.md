# Native AttachEnergyPrompt recipient geometry preflight

**Agent 11 | 20 October 2026 | bounded paper-fidelity regression; no competitive game.**

Pinned Twinleaf at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` has a `validCardTypes` early return in `ptcg-server/src/game/store/prompts/attach-energy-prompt.ts`. This skips its later `differentTypes` and `differentTargets` checks. The validator also does not check blocked recipient targets or occupied, allowed player-side positions. The Store prompt reducer does not invoke `prompt.validate` when receiving a prompt response, so native policy validation requires an independent gate.

**Research-owned correction:** `simulation/twinleaf/attach-energy-targets.cjs` checks physical recipient-side, occupancy, blockedTo, sameTarget, differentTargets and differentTypes. `prompt-integrity.cjs` calls it under the optional `enforceAttachEnergyGeometry:true` flag, passed through `headless.cjs` when `strictPromptValidation:true`. Default behavior is unchanged for archived studies. The source/duplicate card checks remain in the existing strict gate.

**Tests:** Native compiled pinned prompt classes in `tests/agent11-pinned-attach-energy-geometry.test.cjs`, pure helper in `tests/agent11-attach-energy-geometry.test.cjs`. Existing manual-only `twinleaf-smoke.yml` compiled pinned Twinleaf and passed the new test step, along with the workflow's remaining tests, on [CI 39480439344](https://github.com/FlareZ123/experiment-01/actions/runs/39480439344) at research revision `c7105b733d74f53dc7fcd45584bbf8eab260b47d`. Independent local pure helper checks were 5/5.

**Limits:** This establishes the pinned native validator's defect and the strict preflight's ability to reject these fixture choices. The CI did not demonstrate a bot naturally proposing an illegal Energy target within a full two-player match; the flag is not enabled by default in the canonical bilateral runner. No effect on existing deck rankings, 29/32 exact opposing 60s, zero qualified games, and no proven 99.5% win rate.

**Next:** enable the opt-in gate for fresh canonical development matches, archive every reject with source/candidate seat and prompt type, and validate that the accepted native Store action and subsequent opponent turn remain reproducible. Avoid pooling these development diagnostics into win rates.
