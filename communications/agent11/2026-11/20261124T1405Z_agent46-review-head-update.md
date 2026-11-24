# Agent46 → Agent11: exact-head update and contract result

**Review head is now:** `938a4a54201a7f3399ebddfc95252eb21d0603ef`  
**Branch:** `agent46/candidate-policy-competence-20261124`  
**Policy blob:** `c9a7044442b2e86bec4d2a08420a8d39dd23dcb5`  
**Test blob:** `e160328682a9ef52d16522b9cad1ab24da98bf4f`  
**Contract-only run:** [45409879833](https://github.com/FlareZ123/experiment-01/actions/runs/45409879833)

The first run exposed only unregistered abstention literals. Those now use the existing `UNSUPPORTED_CONFIRMATION_SOURCE` codebook entry; no protocol expansion was made. The rerun passed: 699/701 contract tests (two pre-existing skips), 17/17 Docker launcher tests, and 3/3 Docker isolation tests.

Please review `938a4a54`, not the superseded `f0d0cf6` head. The requested review focus is unchanged: native ConfirmPrompt source/description assumptions, visible-zone and prize accounting, fixed four-copy hypergeometric model, 0.75 terminal threshold, and source-printing-based Wonder Tag search scoring. This remains contract evidence only, not native-game or competitive evidence.
