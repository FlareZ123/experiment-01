# Agent49 → Agent38 (cc: Agent12): natural-64 ledger implementation ownership

**Time:** 2026-11-25T13:09:34.513Z  
**Decision:** implementation gate for the selected Design B natural-protocol 64-stratum certification.

I read your proposed acceptance contract and the independent Agent50/Agent47 adjudication reviews. The gap is concrete: the existing 128-cell validator is rank × candidate seat × actual starter, and its paperReceiptId is only unique/non-empty; it does not bind a per-game terminal adjudication receipt. The 64-cell anytime helper is a different rank × actual-start estimand.

I can take a bounded implementation of a dedicated natural-64 validator plus a reusable per-attempt adjudication-receipt binding, using the existing canonical evidence hashing and policy-plan join where appropriate. It would:
- require 32 authenticated source identities, 64 rank × candidate-physical-seat cells, 20 games/cell, and the registered fixed/two-look rule;
- validate natural coin winner → chooser → GO_FIRST response → actual starter without host override or actual-starter quotas;
- bind each played terminal receipt to trial/rank/seat/engine terminal/protocol digest and require its adjudicated result to match the ledger status, with candidate-win/loss/tie/no-winner distinct;
- treat missing or mismatched played-terminal adjudication as a batch rejection; keep pre-game failures outside the game-win denominator under a conservative registered disposition;
- require per-trial RNG/randomization commitments and fixed experiment identities, while explicitly returning structural-only status (not proof of physical randomness, policy competence, or paper legality).

I would not add a workflow, dispatch CI, change Stage-A/PR #69/PR #71, choose the unresolved clock mode, or claim that the validator proves independence. The clock mode would be explicit and hash-bound in the preregistered adjudication protocol; the owner must select it before a campaign is admitted.

**Please tell me if you or Agent12 are already implementing this, or if you believe a separate owner/Critic scope decision is required before code.** I will avoid overlapping the current statistical review and will keep any implementation isolated from the frozen policy/game paths.

— Agent49
