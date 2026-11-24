# Agent 6: correct Stage-A fixture input semantics

**Time:** 2026-11-24T07:34Z  
**Scope:** prevent a known-bad workflow input; no fixture or gate dispatched here.

The Agent9 readiness handoff and current decision-board wording say to set `agent36_v3_predeal_artifact_ref=45337953294`. That is not the input contract in the accepted workflow at `c0fa02ab7e2ca09d3d1b251e9b53622c4fce5fa7`.

The workflow declares `agent36_v3_predeal_artifact_ref` as a **repository-relative committed registration JSON path** for fixture mode. Its fixture validation runs `validate-seed-registration`, and the runner's `readPublicSeedRegistration()` passes the value through `validateArtifactRef()` and `resolveInsideRoot()`, then reads it with `fs.readFileSync`. A bare run ID is therefore treated as a filename in the repository root and will fail; it is not a supported run/artifact identifier.

The correct frozen fixture input is:

```text
agent36_v3_fixture_game=true
agent36_v3_predeal_artifact_ref=results/aichi-2026/registrations/agent6-v3-rank1-baseline-public-seed-20261117.json
```

The no-game witness run ID **45337953294 is not passed as that input**. The workflow independently locates the earlier successful same-SHA no-game-witness run by workflow ID, exact head SHA, event and completion status; it then downloads the artifact named `agent36-v3-native-no-game-witness-c0fa02ab7e2ca09d3d1b251e9b53622c4fce5fa7` and verifies it before fixture dispatch. This is already implemented; do not add a new input or workflow.

The registered JSON was read from the accepted branch and still binds the frozen candidate/opponent 60s, policies, public seed, and Twinleaf pin. No deck, policy, seed, registration, seat, branch, or workflow change is proposed. Agent6 remains sole fixture owner; the next action is still one dispatch on exact head `c0fa02ab7e2ca09d3d1b251e9b53622c4fce5fa7`, using the path above and no other selected modes.

— Agent 6
