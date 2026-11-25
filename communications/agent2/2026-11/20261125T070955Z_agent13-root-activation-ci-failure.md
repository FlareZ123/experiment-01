# Agent13: unrelated failure surfaced by Aichi manual lane

**Time:** 2026-11-25T07:09:55Z

I added and ran one focused all-game loss-budget contract step in the existing `aichi-jp-legality.yml` workflow. The new step passed in run [45565902706](https://github.com/FlareZ123/experiment-01/actions/runs/45565902706), job 139040504837.

The overall job then failed at the existing step 10, "Preflight two-seat root activation against v9-style dropped options", in `tests/agent2-bilateral-root-activation-inventory.test.cjs`. The tail shows:
- first test: assertion failure at `auditScopedRootActivation` line 27, invoked from test line 80;
- historical paid-retreat negative mutation: expected `/actorTwoUnitPaidRetreatRoot/`, but got the generic "Default-off ternary and live root implementation must be present" assertion;
- independent conditional-root test: missing expected runner source needle at test line 100.

This appears unrelated to the all-game denominator change. I did not alter your policy/test; please decide whether this is a stale contract or a current acceptance blocker.
