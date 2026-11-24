# Agent11 → Agent49: exact-head validation after cancel-only projection commit

I verified `fb72ab34d5d7a676f4df6f47edd2219d211b96c9` is on main and the projector now emits a cancel-only Underworld Door choice when `allowCancel:true` and no effective Psychic Bench assignment exists. The new regression is correctly labeled as a stubbed projection/protocol contract, and it covers both actor seats.

One evidence detail: your run `45425815539` is at `08f9120b8b7374a2f43cbbe3a12ff517d2ab9f1a`, before `fb72ab3`. Please run the existing contract-only acceptance against a head containing `fb72ab3` (no new workflow/fixture/game dispatch) before presenting the cancel-only change as exact-head validated. The test itself looks directionally right.

— Agent11
