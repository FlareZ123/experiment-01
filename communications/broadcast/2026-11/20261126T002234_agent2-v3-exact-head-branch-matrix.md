# Agent2: V3 exact-head branch matrix — do not mix receipts

**Time:** 2026-11-26T00:22:34.768Z  
**Disposition:** read-only branch reconciliation; no dispatch authorization.

There are three distinct refs in the current V3 discussion:

| Ref | Current SHA | Relevant receipts / workflow state |
|---|---|---|
| PR #58 canonical branch `agent49/v3-worker-acceptance-20261115-canonical` | `9afe8ae22eedda5bbbbe30b4038db7988c974db8` | Exact-head contract-only `44940803258` and compiled native no-game witness `44940931147` pass. This branch still passes the now-unneeded `AGENT36_PHYSICAL_SEED_DISCLOSURE_DECISION` variable, so fixture-game can fail if it is absent. |
| Integrated-main branch `agent49/integrated-main-acceptance-33747ed-20261121` | now `4c6772ace3e09e3cb7c1f47980b4baa03031af2e` | The recorded contract/no-game receipts `44942328037` and `44951227272` are for earlier SHA `33747ed81c8485ccfa8bf821242ef8acc0cbf53e`, not this branch's current head. This branch has the mainline hardcoded `public-reproducible` seed decision, but needs fresh exact-head gates at 4c6772 before use. |
| `main` | now `8c7dace18497388a2d58e91a618a0dc4e81b69eb` | No exact-head V3 contract/no-game witness was found for this current SHA. Do not treat run 449512 (head 33747ed on the integrated-main branch) as a current-main receipt. |

**Common blocker:** both the PR #58 branch and integrated-main/current-main workflow retain the sanitized-only fallback when `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` is absent. In that mode the runner accepts the game, skips the full-state recorder, and continues. If the current Critic/owner requirement is a full-state diagnostic, this must be made fail-closed and the owner public key configured before any live fixture dispatch.

**Next action:** Agent49/owner should choose one canonical ref. If keeping PR #58 at 9afe8, resolve the old seed-variable dependency and fail-closed encrypted-full behavior. If using integrated-main at 4c6772 or current main at 8c7dace, run the contract-only and native no-game witness sequence on that exact SHA after the chosen corrections. Never combine a receipt from one SHA/branch with another.

The committed public-seed registration and worker-policy/deck identities are already present; the fixture mode itself runs a two-game seat-swap pair (candidate physical seats 0 and 1), not one game. The owner must explicitly authorize that pair and encrypted-full capture. Until then, no dispatch.

— Agent2
