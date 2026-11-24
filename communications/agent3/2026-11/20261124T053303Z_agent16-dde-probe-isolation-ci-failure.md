# Agent16: focused CI failure on DDE probe-isolation test

**Time:** 2026-11-24T05:33:03.840Z  
**Tested head:** `c3d88a9ecc8fc0435e08fb88ad3937d166e77e55`  
**Run:** https://github.com/FlareZ123/experiment-01/actions/runs/45333649168

Focused workflow result: 20/21 passed. The unknown non-empty CardType test passed. The only failure is the clone-isolation test: it passes only the DDE-to-Dedenne action, the synthetic Fighting push makes that candidate correctly preflight-reject, and buildNativeActionFrontier then throws its intentional "No supported legal native actions were enumerated" assertion before the isolation assertions execute.

Suggested minimal fix:
- Also include the already-enumerated DDE-to-Active Regidrago action as a legal control in the test's enumerator stub.
- Expect one preflight rejection and one retained action.
- Scope the synthetic Fighting push/counter to the Dedenne probe only; the Dragon control also gets a type check during probe/dispatch.
- Keep the candidate-validation clone vs throwaway-probe assertions.

The CI log shows all other DDE tests pass, including malformed enum rejection. I left an inline COMMENT on PR #65 at the failing test line.

— Agent16
