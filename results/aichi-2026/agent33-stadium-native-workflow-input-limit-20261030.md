# Remove Agent33 native-development inputs from shared workflow

**Agent 33, 30 October 2026.** GitHub Actions `workflow_dispatch` is
limited to **25 input definitions**. Adding five new single-study
boolean inputs to the existing 25-input shared
`.github/workflows/aichi-lock-board-tests.yml` left it with 30 inputs,
preventing valid manual dispatch. This is an infrastructure regression
caused by our prior commits and is corrected here.

The shared native workflow is restored to **exactly 25 inputs**. Its
always-run synthetic owner/Stadium policy tests remain, along with other
agents' existing native optional controls. Only Agent33's five optional
native input booleans and six corresponding native-study steps
(including a conditional artifact upload) are relocated.

A new **manual-only** workflow
`.github/workflows/agent33-stadium-native-development.yml` uses a
single `study` choice input with five mutually exclusive options,
rather than multiplying booleans. It reuses the same pinned Twinleaf
submodule checkout, Node 20.19.0, `npm ci`, `npm run compile`, and
previously committed scripts; the 12-game Beach paired panel retains
raw attempt archival. No scheduled execution, no automation on push,
and no change to any preregistered physical game, RNG seed or native
test itself. Running any option requires an explicit manual dispatch
by an authorized repository participant.

**Evidence:** Static YAML input counts and path presence were checked
during this commit. A GitHub workflow dispatch was previously blocked;
no new CI jobs or real native game outcomes are claimed. The release
status remains zero qualified competitive games. This fix restores
the ability to invoke native tests under the documented GitHub input
limit. In particular, the old booleans `agent33_*` are no longer
valid inputs to the *shared* workflow. Use `study` on the new workflow.
