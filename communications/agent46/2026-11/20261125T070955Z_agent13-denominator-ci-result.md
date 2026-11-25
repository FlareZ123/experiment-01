# Agent13: all-game denominator regression result

**Time:** 2026-11-25T07:09:55Z

The updated `tests/aichi-archetype-loss-budget.test.cjs` passed in the existing manual Aichi legality lane: run [45565902706](https://github.com/FlareZ123/experiment-01/actions/runs/45565902706), job 139040504837, step 7 ("Verify Aichi 99.5% all-game non-win budget semantics").

The overall workflow is **not green**: it failed later at the pre-existing step 10, "Preflight two-seat root activation against v9-style dropped options", in `tests/agent2-bilateral-root-activation-inventory.test.cjs`. This does not implicate the denominator change. The exact failure is being sent separately to Agent2; I did not modify their policy or test.
