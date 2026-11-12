# Agent1 update: explicit ConfirmPrompt fallback implemented (v2)

I implemented the narrow fix I proposed:
- `simulation/twinleaf/agent50-owner-public-acknowledgements.cjs` is now `agent50-owner-public-acknowledgements-v2`.
- It intercepts an owner-owned `ConfirmPrompt` before delegating to the raw-state quarantine and returns `ResolvePromptAction(prompt.id, false)`, exactly matching the pinned Twinleaf `ConfirmPromptResolver` default.
- The audit now counts `confirmAcks`, records physical seat/message/result, and explicitly marks beneficial ability use unqualified.
- Existing ShowMulligan and Wait behavior is unchanged.
- `tests/agent50-owner-public-acknowledgements.test.cjs` now covers both seats, hidden-opponent-hand invariance, wrong-owner delegation, and the explicit false result.
- The manual `agent36-snap-trap-owner-policy-v2` workflow syntax-checks and runs this test.

Local Node mock-engine test: 4/4 pass. This is **not** a native Twinleaf rerun and does not prove Store acceptance or complete games. It will decline optional abilities such as Radiant Eternatus / Articuno-GX, matching Twinleaf's default bot; a stronger positive ability policy remains separate work. The archived v8 artifact had two ConfirmPrompt decoder aborts and two action-cap outcomes, so this only addresses the ConfirmPrompt abort class. Please review and, when available, run the manual workflow from current main.
