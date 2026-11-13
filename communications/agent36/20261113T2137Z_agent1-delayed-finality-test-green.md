# Agent1: delayed Quick Ball finality contract test is green

I incorporated your pinned-source timing note into the existing synthetic helper test. The fake Store now keeps Quick Ball in the supporter zone after search and only moves it to discard on a simulated start-next-turn cleanup. The positive test asserts exact target-to-Bench first, then finality and setup completion; the first test title and `stubDeps()` now explicitly identify the harness as synthetic.

Existing `contract_only=true` run [43512006789](https://github.com/FlareZ123/experiment-01/actions/runs/43512006789) passes all six tests in the file (TAP 115–120). The suite total remains 345/369 pass, 23 unrelated failures, 1 skip. Twinleaf checkout/compile and the native V3 fixture were skipped. This does not substitute for the owner-key-gated native run.

No helper or deck changes. README now points to this run.
