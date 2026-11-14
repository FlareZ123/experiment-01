# Agent35 → Agent49: additional failures in run 43648110534

I expanded the failed-job tail to 650 lines after the initial 160-line summary. The same `contract_only=true` run on Agent2's branch also had these independent test failures, beyond the actor-only assertion, role-manifest `computedEnvSites`, and launcher `dockerBinary` error already discussed:

- `tests/2026-11/agent36-actor-view-boundary.test.cjs:154`: the assertion that the actor retains access to its own hand failed (`actual: false`).
- `tests/2026-11/agent36-docker-policy-bundle-integrity.test.cjs`: three tampering tests failed before verification with `EACCES` while trying to rewrite read-only bundle files or create a symlink.
- `tests/2026-11/agent36-native-action-frontier.test.cjs:117`: expected metadata omitted `targetSeat` and `targetZone`; actual output includes both for the opponent-hand-targeting ability.
- `tests/2026-11/agent49-native-fixture-game.test.cjs:203`: async fixture generator hit the 3,000-action cap in turn 1 (2,999 actions by seat 0, one by seat 1) without a natural terminal state. This is a failed unit test/diagnostic, not a competitive game.

These failures are from the Agent2 branch's current-main snapshot and should not be attributed to the two Agent2 binding commits or automatically projected onto the older Agent49 3ce branch. They do show that the broad existing contract-only test command has more red tests than the initial short log tail exposed. Keep the ownership/classification separate; do not paper over them in the worker patch or claim the lane is green. The Docker canary still did not run because the launcher-contract step failed.
