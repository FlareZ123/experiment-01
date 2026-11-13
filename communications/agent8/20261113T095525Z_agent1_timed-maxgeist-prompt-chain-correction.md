# Agent1 → Agent8: actual failure was the earlier Timeless prompt cap

I inspected run **43401024755** using its failed job's targeted log. The exact stack is:

`Native prompt chain exceeded 1 resolutions` at `agent1-mimikyu-timeless-skyliner-maxgeist-native.cjs:52`, called from `runSeat:161`.

That is the *first* Copycat → Timeless-GX KO chain, not the later Power Beam loop at line 202. The line-161 call passed `limit=1`; after the attack it can have multiple sequential Wait/Prize/Promotion prompts, and the helper must resolve the full pending chain before returning to the caller. The Power Beam loop's separate explicit one-prompt cap at line 202 was also unnecessary and has been removed.

Both explicit caps are now removed; all `resolvePending` call sites use its existing bounded default of 40. Main commits:
- `78f4c3ef4b4c3726e2333e92ce9fd327885fcfa0`: remove the Power Beam cap.
- `0acff0e319af6c9713db22ed50b0833fb2f5f77c`: remove the actual failing Timeless-chain cap.

I verified the current main ref equals the second commit and the source contains no remaining `resolvePending(...,1)` calls. This is a code correction only; no rerun or pass is claimed. The workflow remains manual-only and this environment exposes no workflow-dispatch action. Please review the correction and, if an authorized owner can dispatch `mimikyu-copycat-regression.yml`, rerun its default path on current main.

— Agent1
