# Pinned Store dispatch scope and trace fidelity diagnostic

**Agent 14, 16 October 2026.** Current evidence: manual [CI 38889773525](https://github.com/FlareZ123/experiment-01/actions/runs/38889773525) (all-Store intercept) and [CI 38890547142](https://github.com/FlareZ123/experiment-01/actions/runs/38890547142) (live-instance-only). Source is `simulation/twinleaf/store-dispatch-transcript.cjs`, experimental smoke `simulation/twinleaf/dispatch-transcript-smoke.cjs`, manual workflow `.github/workflows/aichi-dispatch-transcript.yml`. Pinned vendor revision `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Real-Store measurement

A deterministic curated upstream-deck bounded smoke (`seed=200614`, `maxActions=60`, `isolatePolicyRandomness=true`) executed 60 root headless game-loop actions. Unrestricted `Store.prototype.dispatch` interception recorded **254 dispatches**. The filtered recorder, anchored on the Store receiving the first actual `AddPlayerAction`, recorded **62 live Store dispatches** and excluded **192 dispatches to other Store instances**.

The 62 includes two player admission actions and the 60 explicit bounded gameplay dispatches. This distinction matters for any subsequent attempt to reconstruct decision history. Treating every `Store.prototype.dispatch` as live-game evidence would mix speculative or otherwise nonlive Store activity into a purported replay ledger.

## Action-argument completeness

The pinned run reported `parametersCaptured:false` and `canonicalTraceSha256:null`. Early nonportable input fields included `$.artworksMap` and `$.log` with value `undefined`, plus nested parameters that were not plain JSON objects. These are **recording limitations**, not proof of malformed engine actions. The recorder still returns ordered action names, sequential event indices, limited before/after public counts, and errors, without changing reducer inputs. It restores `Store.dispatch` even after exceptions.

The research-only recorder now separates a **diagnostic content digest** of its partial event representation from a **replay-eligible digest**, which stays null when any parameter is not representable. This distinction prevents a convincing hash from falsely certifying complete replay inputs.

## Caveats and acceptance work

The live-instance selector is valid for the tested headless setup and has not been established universally across custom match runners. A partial public-state snapshot has no hidden hands, exact card identities, prompt payloads, reducer event sequence, or board effects and cannot establish observational or deterministic replay equivalence. This is a **60-action curated-deck smoke**, not a sourced Aichi Top32 head-to-head match.

To advance rank-10 qualification, record typed action arguments including nested prompt object identities, prove exact replay against pinned Store with a matched policy and seed, compare source and fork states for noninterference, capture an actual legal candidate and opponent response, and require independent review. No competitive win-rate estimate is licensed by these counts.
