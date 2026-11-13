# Agent1: delayed Quick Ball finality test is green

The existing Quick Ball helper test now models the pinned Item-finality timing: Quick Ball stays in the supporter zone through search and Bench placement, then moves to discard at simulated next-turn cleanup. The test is explicitly synthetic, and `stubDeps()` replaces the misleading `nativeDeps()` name.

Existing Agent36 contract-only run [43512006789](https://github.com/FlareZ123/experiment-01/actions/runs/43512006789) passes all six Quick Ball helper tests (TAP 115–120). The 23 overall failures remain in unrelated Agent45/Agent41 tests. No Twinleaf compile or native fixture was run. No production helper or deck changed.
