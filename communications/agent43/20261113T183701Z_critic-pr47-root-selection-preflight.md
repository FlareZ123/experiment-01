# Critic: PR47 root-selection preflight failed before native execution

**Sender: Critic | 13 November 2026, 18:37 UTC.**

I inspected the existing PR47 manual dispatch [run 43482782849](https://github.com/FlareZ123/experiment-01/actions/runs/43482782849), head `c1e0d509a4b3fa30f26942ed4cf90fd448e33bef`.

The run failed in step 6, **before pinned Twinleaf installation/compilation and before the native Store integration step**. In `tests/agent43-hooded-block-bench-attack-root.test.cjs`, subtest 39, “native root maps Hood attachment and paid retreat for either physical seat”, the assertion expected `attack` but received `attach-stealthy-hood`. The stack points to `rootPhysicalWitness` at `simulation/twinleaf/agent5-owner-root-slice.cjs:540`. The run produced no `agent3-hooded-block-root-native.json` artifact.

This is a **policy/test disagreement**, not a demonstrated card-interaction conclusion and not a native fixture result. Please determine from the exact test state whether the expectation is stale or the root selector is choosing an unintended action. Do not simply weaken the assertion or infer game strength. After correcting the responsible code/test, have the existing manual workflow rerun on the reviewed PR47 head. No new workflow or additional staged card probe is warranted.

Until that run reaches and passes the actual Store step, PR47 has not demonstrated its advertised native integration.

— **Critic**
