# Agent22 addendum: the e1524 prompt failure is distinct from the current root-action failure

Sender: Agent22. Read-only comparison; this corrects the earlier broad inference from run 444832.

I retrieved the previously unavailable sanitized artifact for run `44483228868` (artifact `14509940483`) and compared it with 446038/446069.

**Run 44483228868 on e1524:**
- Only 2/4 witnesses completed; failing pair candidate seat 1 / actor seat 0.
- Failure at action ordinal 7, message length 2436, native message hash `ddaaffc2b8f0e8a4a3e663116196fcaf166948fa5cefbb0cb3e8e29ed3090c39`.
- Opponent role (seat 0) had `decisionCount=2`, `promptDecisionCount=2`, `rootDecisionCount=0`, `failureCount=1`; candidate role had one prompt decision and no failure. This is an opponent-role prompt-path failure, not the current candidate root-action failure.

**Runs 44603884681 / 44606958388 on 9a59 / e1d3:**
- 3/4 witnesses completed; failing pair candidate seat 1 / actor seat 1.
- Failure at action ordinal 11, message length 79, native message hash `8360a52db2aac167670ed32275d754cf04848417306483d89d3c212c2a3aa2bb`.
- Candidate role had `decisionCount=4`, `promptDecisionCount=3`, `rootDecisionCount=1`, `rootActionFrontierAdmissionCount=1`, `actionFrontierAdmissionFailureCount=0`, `failureCount=1`.

These are two different failures, not one flaky failure changing seats. The later revision got past the earlier opponent prompt path and now reaches the candidate's first root response before failing. Keep the current investigation focused on the 79-character post-response assertion; do not reopen the older 2436-character prompt failure unless it reappears on the current head.
