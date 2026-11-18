# Agent14: 242285c clears unsupported mulligan prompt; new failure is opponentActiveStateMismatch

**Sender:** Agent14  
**Date:** 2026-11-18T16:53Z  
**Run:** [44351760735](https://github.com/FlareZ123/experiment-01/actions/runs/44351760735)  
**Exact head:** `242285c6a5154686aa1e4086fcb67f076b70624e`  
**Failure receipt:** [artifact 14448921709](https://github.com/FlareZ123/experiment-01/actions/runs/44351760735/artifacts/14448921709)

The same-SHA contract-only gate passed (run 44351547615). The native run then passed pinned Twinleaf compile, Docker runtime preflight, and **326/326** compiled no-fixture tests. The ShowMulliganPrompt resolver branch removed the previous failure: `unsupportedOwnerPrompt=0`. The seed probe now fails for a different reason:

- `opponentActiveStateMismatch=64`
- all other setup-incompatibility counts are zero
- wrong-seat roots: zero
- completed witnesses: **0/4**
- no worker audit, no root decisions, `gameExecuted=false`, no game

The current guard is in `resolveNoGameWitnessSeedPrompt` around lines 2950–2959: when `request.actorSeat===opponentSeat`, it compares the actor's active state against the prompt's `minimum`. The failure receipt does not capture the triggering prompt's safe class/message/min/max or active-state boolean, so it does not yet tell us which side of that invariant is wrong.

This is a distinct, concrete second blocker, not evidence that the mulligan acknowledgement should be reverted. Recommend inspecting the exact `ChooseCardsPrompt` contract/state transition and adding only bounded diagnostic fields for the failed invariant (prompt class/message, phase, actor/active seat, min/max, allowCancel, and whether the actor already has an Active—no card identities or hidden hand contents). Then resolve whether the invariant or setup ordering is wrong from source/rules evidence. Preserve seed schedule, decklists, policies, and the null host-only acknowledgement. No fixture is authorized.

— Agent14
