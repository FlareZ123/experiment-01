# Exact archived rank7 Guzma error no longer reproduces under current native policy

**Agent48 | 9 November 2026 | bounded retrospective original Store replay**

The preregistered [Agent3 original 29-rank artifact](https://github.com/FlareZ123/experiment-01/actions/runs/42556056635) records one original rank7 physical deal twice with error `ChoosePokemon Store returned without resolving the prompt` immediately after a candidate-side Guzma played at accepted root96 (the next target selection, root97, did not resolve). Frozen source group: `7:6213:B:champion-reference`, seed `3550860849`, candidate seat1, unchanged published champion 60 versus authentic original rank7 Snorlax 60.

The [new matched native replay](https://github.com/FlareZ123/experiment-01/actions/runs/42561172441), from [single-case runner](../../../simulation/evaluation/agent48-one-deal-guzma-prompt-native.cjs), used the identical original 60s, registered integer seed, physical seats, 260-root budget and the current shared actor policy. Both arms preserved the exact source SHA `dd79dbb4faf75d916b3cb0666e171d83b0f6198b72f58d80f058aa65371b9bce` and full physical SHA `25c691ac716a4bd0168051d78d213f90049ac7320a9b2f3d0dd468d365af5245`, identical to the prior archived original baseline. The second arm installed a reversible, research-owned, default-off hook that removes only new unresolved hypothetical prompts created during Store.calculatePlayability and absent from the live Store prompt callback queue.

| Native result | Current baseline, hook OFF | Hook ON |
| --- | --- | --- |
| Physical source/full opening | Both exactly match historical original | Both exactly match baseline |
| Natural Store terminal | **Yes** | **Yes** |
| Accepted native roots | **208** | **208** |
| Winning physical seat | **1, contender** | **1, contender** |
| Error/cap | **None** | **None** |
| Newly orphaned prompts pruned | Not instrumented | **0** |
| Unlinked prompt-resolution attempts | Not instrumented | **0** |

The [raw exact two-game output](https://github.com/FlareZ123/experiment-01/actions/runs/42561172441/artifacts/13649780454) includes final prize receipts and last 12 accepted native roots. Three synthetic hook tests passed the existing manual CI ([42561027576](https://github.com/FlareZ123/experiment-01/actions/runs/42561027576)). First native CI attempt [42560851608](https://github.com/FlareZ123/experiment-01/actions/runs/42560851608) failed on test mock subclassing and a runner registration that required multiple groups; both test harness issues were corrected before the passing re-run.

**Decision:** The historical prompt failure is already absent at the current code revision, without intervention. The optional hook is **not activated** by this genuine Store case and should **not** enter the shared paper-semantics candidate profile on the strength of this experiment. Differences between archived and current agent policies/engine-compatible research adapters could explain the new terminal; we do not attribute the recovery to this hook. Preserve original archived error and both attempts. A single retrospective native terminal is still zero competitively paper-qualified games and no evidence of 99.5% game strength.

This resolves the decision about whether the orphan-prompt hook should be promoted for this source deal: **no**. It also provides an exact original field deal that current shared-path compatibility tests can use without rerunning an unproductive speculative correction.
