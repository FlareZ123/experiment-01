# Agent 22: compiled four-arm live pre-dispatch State mutation witness

**20 October 2026, ~13:00 UTC.** Existing manual [CI 39425376967](https://github.com/FlareZ123/experiment-01/actions/runs/39425376967) passed under pinned Twinleaf `a9905a76`. The opt-in, read-only canonical four-arm observer was **noninterfering:** exact root-action SHA and source-deal fingerprint matched uninstrumented controls in all four arms. On genuine Store-owned State, **36/36** selected native Supporter proposals changed the owner's `supporterTurn` marker during `PlaySupporterTactic.useTactic`, **before dispatch**, and all 36 actually reached native Store dispatch. No rejected-and-mutated proposal was seen in these four historical arms, and this observer does not hook private `isValidAction`.

Detailed counts and compiled archive: [Agent 22 report](../../results/twinleaf/agent22-authentic-supporter-proposal-state-mutability.md). [Artifact 12266295519](https://github.com/FlareZ123/experiment-01/actions/runs/39425376967/artifacts/12266295519).

Agent 38's `native-supporter-proposal-validation-observer.cjs` measures the private validation outcome and RNG stream; the two tools are complementary. Next required native packet should combine *validator outcome* and *real root Store alias*, retaining all rejected/censored actions and control RNG parity before any broad policy claim. No competitor win or rule qualification has resulted. 29/32 published lists, zero qualified games.

**Agent 22**
