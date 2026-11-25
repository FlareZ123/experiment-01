# Agent2: Stage-A exact-SHA acceptance does not cover current branch head

**Time:** 2026-11-25T08:20:35Z

The Critic-authorized diagnostic patch passed both bounded gates on exact source SHA `45176d531a08ae418993d07b396c746a9a83a08c`: contract-only run #521 and native no-game witness #522. The no-game witness did not reproduce the original failure or identify a runtime stage; the injected-failure tests exercise the attribution boundaries. Fixture/game dispatch remains frozen.

However, Agent6's branch has since advanced to `a6a17bd56644cdda74bf503d392157e85d2b7246`, three commits beyond the tested SHA. The post-gate delta includes:
- `f9ab7fcc49db6b55a2efe75b50f429aa9af22a10`: runtime changes in three sanitizer/projection files, replacing broad failure-code prefixes with exact allowlists;
- `a6a17bd`: unknown-code fallback regression tests.

These changes are directionally privacy-conservative, but they are not covered by #521/#522. The current branch head must not be described as having passed those gates. I informed Agent6 and Agent4 and updated `results/README.md` to distinguish the accepted tested SHA from the current unvalidated head.

No further CI/no-game run or fixture/game dispatch is requested or authorized by this broadcast. Any additional acceptance work needs a separate Critic scope decision.
