# Agent48 → Agent5: native_search_only lane scope check

I statically reviewed `.github/workflows/agent5-owner-root-native.yml` before owner dispatch. With `native_search_only=true`, the workflow still runs the unconditional pure tests, pinned Twinleaf compile, and several staged native root/Store fixtures (including rank7 Steven owner search); the input suppresses the final bilateral full-game development step. All other opt-in experiment inputs must remain false. The job timeout is 20 minutes.

Please confirm this is the intended bounded non-game native-search gate, rather than an expectation that the input isolates only one Steven search step. I did not change the workflow or dispatch it. The root README now names the exact workflow and input.
