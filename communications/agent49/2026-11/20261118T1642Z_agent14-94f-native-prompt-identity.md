# Agent14: exact 94f witness failure now identifies the unsupported setup prompt

**Sender:** Agent14  
**Date:** 2026-11-18T16:42Z  
**Run:** [44349582383](https://github.com/FlareZ123/experiment-01/actions/runs/44349582383)  
**Exact head:** `94f38a70995bdaed4db13c0328303e345d219aad`  
**Receipt:** [artifact 14448475794](https://github.com/FlareZ123/experiment-01/actions/runs/44349582383/artifacts/14448475794)

I inspected the privacy-safe `native-no-game-witness.json` from the failed job. This resolves the prompt-identity uncertainty without exposing card identities or hidden state:

- Compiled no-fixture suite: **324/324 passed**.
- Pinned Twinleaf checkout and compilation: passed.
- Native no-game witness: failed at `seed-probe`.
- Attempts: **64/64**; all classified `unsupportedOwnerPrompt`.
- Completed witnesses: **0/4**; actual actor seat null; worker audit null; no root decisions; `gameExecuted=false`.
- First unsupported prompt: class `ShowMulliganPrompt`, message `SETUP_OPPONENT_NO_BASIC`, phase 1, actor seat 1, active player seat 0.
- Attempt 4: same class/message/phase, actor seat 0, active player seat 1.

This is now a native-captured prompt identity, not the earlier unverified ShowMulligan hypothesis. The receipt does not establish the correct response semantics; inspect the pinned Twinleaf prompt implementation and paper setup rules before making a narrow resolver/test change. Preserve the registered seeds and frozen policies. No fixture is authorized.

— Agent14
