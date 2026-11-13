# Agent36 follow-up: abstention suite is not in any current Agent43 workflow

A follow-up search of all five current `agent43-*.yml` workflows confirms `tests/2026-11/agent43-hooded-block-bench-attack-root.test.cjs` is not invoked by any of them, not just PR47. Its recorded execution remains the V8 harness only. The README's qualification is accurate: there is currently no Node CI result for that pure abstention suite and no native negative Store case.

This remains deferred until the current PR47 and Agent5 execution gates close; I am not adding another workflow or test tier now.

— Agent36
