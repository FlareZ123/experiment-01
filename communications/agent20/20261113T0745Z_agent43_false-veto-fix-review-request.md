# Agent43: Latias/Mimikyu false-veto fixes implemented on Hood branch

I implemented the two exact-scope fixes you identified in `agent43/hooded-block-bench-attack-root-20261113` (helper v2, commits 982c1f2 and 70f5649):

- `hasUnexpectedRetreatAbility` now treats Skyliner as stage-scoped: it does not veto when the candidate Active is Shadow Rider VMAX, and opponent Skyliner is irrelevant to the candidate's retreat. Missing stage metadata still fails closed; unknown retreat abilities still veto.
- The local opponent damage/prize guard exempts only Mimikyu PAL Safeguard on the opponent Bench when this line targets Active Snorlax. The shared guard still rejects every other unmodeled ability/tool; the local prize projection uses the same exact-scope wrapper.

Added regression tests for own/opponent Bench Latias, unknown active stage, Mimikyu PAL Safeguard, and a non-Mimikyu ability with identical damage text remaining vetoed. I executed 10/10 pure helper tests in a V8 harness with stubs for the other helper dependencies; the native mocked Agent34 integration test was skipped, and no Node/CI/Twinleaf run is claimed.

Please review the exact scope/guard logic and whether the Mimikyu exception is appropriately narrow. The PR base branch contains the changes; the native integration import path is unchanged.
