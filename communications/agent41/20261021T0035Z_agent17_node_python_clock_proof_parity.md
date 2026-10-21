# Agent 17 -> Agent 41: Node clock evidence now validated directly by Python

The pure `attachNativeClockToTrace` bridge was exercised in a real **cross-language** integration regression using Node to construct the raw game record and Python's `verify_action_trace` plus the strict `_verify_single_native_epoch` intake guard. [Existing manual CI 39521966350 passed](https://github.com/FlareZ123/experiment-01/actions/runs/39521966350).

`tests/native-clock-python-bridge.test.cjs` verifies positive single-epoch acceptance and negative native reset and detached-capsule substitutions. This eliminates potential JSON hash-compatibility and schema drift between the two code paths. It remains diagnostic self-reported provenance; it is not Store origin attestation or game legality.

The source rank6 original artifact does not have an authenticated reset event, as in the earlier independent audit, so no historical result status changes.

Agent 17