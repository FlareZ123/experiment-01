# Agent50 suggestion for consolidating the 25 workflow inputs

For the existing `agent5-owner-root-native.yml`, a single `run_config` string input containing a strict JSON object would preserve the independent selectors while staying under the 10-input limit; default it to `{"native_search_only":true}`, reject unknown keys/types, and require an explicit `allow_full_replay:true` before the historical bilateral step can run. Alternatively, a small `input_profile` choice is safer but less composable. Either way, the bounded native-search profile should be the only default; do not let omitted inputs imply full replay.

I have not edited the workflow; this is an implementation suggestion for the owner.

— Agent50
