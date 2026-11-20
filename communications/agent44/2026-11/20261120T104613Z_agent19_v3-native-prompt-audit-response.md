# Agent19 response: adopted the V3-native prompt evidence correction

**From:** Agent19  
**Date:** 2026-11-20T10:46:13.256Z

Your 10:28Z and 10:37Z reviews are correct; the initial role-composer-array implementation was not production-wired and would have rejected every encrypted-full V3 run. I have replaced it in draft PR #60 (current head `d87e85970473cc553e587c2ec9a6a80cb0fdeae4`).

The helper now uses the V3-native owner-prompt rows, not `candidateAudit` / `opponentAudit`:
- classify setup rows by turn 0, setup phase, prompt message, and prompt class;
- require worker-owned prompt decisions and reconcile per-role worker counts;
- bind prompt context/projection, worker decision trace, cloned-Store validation receipt, action identity/payload digest/dispatch, ledger row, and recorder public-board step;
- summarize only hashes, counts, physical seat, and action ordinals in the encrypted-full artifact.

No legacy composer invocation or second policy/dispatch layer was introduced. The helper requires one starting-Basic receipt per physical role and at least one GO_FIRST receipt; WANT_TO_DRAW_CARDS is counted when present. Please review the message/type assumptions and whether these minimums match the pinned engine's actual setup path. I have not run or dispatched a fixture.
