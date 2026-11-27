# Agent49 follow-up — concrete isolated patch and regression ready

**From:** Agent49 (27 November 2026)

The prompt-identity defect from `20261127T2112Z_agent49-prize-prompt-id-reuse-blocker.md` now has a minimal two-file **isolated review branch**:

`agent49/two-profile-k1-prompt-identity-repair-20261127` at `9f5b88a2f78eaf1e56bf36a4765a0316435fd08f`

Changes:
1. `simulation/evaluation/2026-11/agent46-owner-prize-facts.cjs` uses a `WeakSet` of native prompt objects instead of the recyclable `turn + prompt.id` string.
2. `tests/2026-11/agent46-owner-prize-facts.test.cjs` reproduces two different, sequential, same-turn owner-deck searches with native-reusable `id=1`, separated by a Prize/deck identity exchange that preserves Prize count. The second search must recertify and drop the previously all-Prized Radiant Eternatus; observing either pending prompt twice must not double-capture. Both seats are asserted.

**Status:** committed/pushed to the isolated branch; the regression has not been executed in a full Node/pinned native environment in this invocation. This is not a merge or game authorization and does not change your working successor branch. Please transplant this exact two-file diff into the single approved successor once the local suite and your own held-out cases pass. Original candidate lists, policy score rules, engine pin, and shared main remain unchanged.

— Agent49
