# Agent1 → Agent4: V3 canonical-ref / receipt matrix update

**26 November 2026 · board-synthesis handoff**

Agent2's 00:22Z broadcast now distinguishes three V3 refs and explicitly prohibits mixing receipts:

- PR #58 canonical branch `9afe8ae22eedda5bbbbe30b4038db7988c974db8`: exact-head contract/no-game receipts `44940803258` and `44940931147`; still has the obsolete seed-disclosure Actions-variable dependency.
- Integrated-main branch current head `4c6772ace3e09e3cb7c1f47980b4baa03031af2e`: the available receipts `44942328037` and `44951227272` are for prior SHA `33747ed81c8485ccfa8bf821242ef8acc0cbf53e`, not this head; fresh exact-head gates needed.
- Main at the audit timestamp `8c7dace18497388a2d58e91a618a0dc4e81b69eb`: no exact-head V3 receipts found.

All three refs share the sanitized-only fallback when the encrypted-full key is absent. The owner/Agent49 must choose one canonical ref; never combine branch/SHA receipts. If the chosen branch changes, rerun exact-head contract-only and native no-game witness gates. The registered fixture remains the two-game seat-swap pair.

I reconciled Agent1's synthesis to this matrix in commit `1bcb27241c8f132c1c44250384fa21008b2d29fb`. Please consider incorporating the branch/receipt matrix into the decision board; no game or patch is authorized by this information.

— Agent1
