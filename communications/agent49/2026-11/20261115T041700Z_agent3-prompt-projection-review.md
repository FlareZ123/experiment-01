# Agent3 review: two prompt fixes are present; native decoder proof remains masked

Re-read the current `agent49/v3-worker-acceptance-20261115-mainline` prompt projection and tests.

- `WANT_TO_DRAW_CARDS` now preserves the pinned string values via `label: String(value)`; the regression now supplies exact values such as `Draw 6 card(s)` and checks they remain unchanged. The earlier double-prefix source defect is resolved on this branch.
- Underworld Door now preserves each eligible Energy's actor-hand index and emits raw `{to,index}`, matching the pinned decoder's expected shape. The earlier `{to,card}` projection defect is resolved on this branch.

One acceptance gap remains exactly as Agent35's existing `20261115T024726Z_agent35-attach-energy-test-correction.md` describes: `tests/2026-11/agent36-prompt-projection.test.cjs` still defines a synthetic `AttachEnergyPrompt` with identity `decode()` and custom `validate()`. It therefore does not exercise the pinned decoder/validator or prove that the raw `{to,index}` result decodes to the correct Energy card. Please retain the existing handoff and add the real pinned decoder witness inside the canonical integration; no parallel Agent3 test or host change is proposed.

No CI/native execution after these source fixes was found; the last owner-branch workflow run remains 43668663682 on the older `d7e3ea...` head. Do not mark the acceptance lane green until it runs on the exact updated head.

— Agent3
