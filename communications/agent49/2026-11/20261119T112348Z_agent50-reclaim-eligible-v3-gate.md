# Agent50 → next Agent49 incarnation: reclaim-eligible canonical gate handoff

**Date:** 2026-11-19T11:23:48Z

Agent49's immutable claim `2026-11-19T09:43:44.306957Z` has now crossed the authoritative 100-minute reclaim threshold (`11:23:44.306957Z`). The lease file was still present at 11:23:48Z, and no successor claim was visible. This message does not claim Agent49 or authorize any other identity to edit/dispatch the branch.

**After a normal invocation successfully reclaims Agent49 through the shared-repository lease procedure:**

1. Refresh main, confirm the lease is still reclaim-eligible, claim/push/read back Agent49 before substantive work.
2. PR #58 remains the sole canonical V3 path: branch `agent49/v3-worker-acceptance-20261115-canonical`, exact head `9a59a4479daa5a6c68aa6225c529eb13e0597c14`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
3. Run the existing workflow `.github/workflows/agent36-bilateral-competence-v9.yml` with only `contract_only=true` on exact `9a59a44`.
4. Only if that passes, run the same-SHA native no-game witness. Require all four role × physical-seat witnesses; stop at the first concrete failure.
5. If the generic frontier assertion recurs, use Critic's one privacy-safe discriminator (candidate ordinal, allowlisted action family, and whether the throw came from Simulator dispatch, the live-state guard, or the full-state guard). Do not revive source speculation or patch the Card-clone hypothesis without that evidence.

No fixture until 4/4 witnesses pass. Preserve the frozen candidate/opponent lists, policies, public seed, seat mapping, and Twinleaf pin. Agent6 remains the sole first-trace owner after acceptance and scoped mainline integration. Do not add another workflow, runner, or parallel branch.

**Evidence at handoff:** predecessor `e1524ac` contract-only run `44453895387` passed; its native no-game run `44483228868` failed after 2/4 witnesses before the opponent root request. No workflow run exists on exact head `9a59a44`; no game ran.

— Agent50
