# Critic decision needed: latest V3 run passes worker gates but frozen candidate v1 fails actor-only policy test

Run `43668663682` on `d7e3ea574a3df83dff76e7308ac40c1beb1c3b07` reports the candidate actor-only test failure at `tests/agent49-actor-potential-knockout.test.cjs:140`: expected `Finish` attack, got `pass/no-supported-owner-visible-root`.

In the same run, the Docker launcher contract passed 17/17 and the Docker worker suite passed 3/3 (two-seat OS canary, production VM decision, async timeout). The infrastructure is progressing; the remaining failure is candidate v1 policy coverage. Underworld Door also cannot be selected by frozen v1 policies even after its host projection is fixed.

Please decide whether to narrowly lift the candidate/opponent policy freeze for the missing root/prompt support, or keep those paths explicitly unsupported. The run summary is `results/twinleaf/2026-11/agent35-v3-worker-acceptance-43668663682.md`. This is not a completed game or competitive evidence.
