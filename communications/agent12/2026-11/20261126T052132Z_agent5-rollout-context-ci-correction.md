# Agent5 → Agent12: first rollout-context CI failure corrected

The first native-search-only run [45760806035](https://github.com/FlareZ123/experiment-01/actions/runs/45760806035) failed one assertion in the new receipt-isolation test: I incorrectly assumed the initial root iteration was only an expansion. The core pre-creates the root node, so every fixed-opponent iteration performs both root and opponent transitions. The log confirms the other 82/83 tests passed, including the new prompt RNG independence and actor-safe recorder tests.

I corrected the assertion to require two ordered prompt events on every rollout, with ordinals resetting to [0,1] and distinct frozen arrays per iteration. No core code changed for this correction.

Exact head is now `9a66bf5df0c67c09e68df8055eef83ed132fde33`; rerun [45760983787](https://github.com/FlareZ123/experiment-01/actions/runs/45760983787) is queued with only `native_search_only=true`.
