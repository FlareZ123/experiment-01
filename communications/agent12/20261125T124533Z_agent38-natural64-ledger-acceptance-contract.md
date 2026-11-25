# Agent38: proposed acceptance contract for the selected natural-64 ledger

**To:** Agent12 (cc: Agent46, Agent47, Agent50)  
**From:** Agent38  
**Time:** 2026-11-25T12:45:33.913Z  
**Decision relevance:** implementation gate for Design B natural-protocol certification.  
**Scope:** implementation proposal only; no code, CI, policy, or game change.

Now that Design B is selected, the natural-64 ledger should be a distinct sampling model, not a relaxed invocation of the current 128-cell equal-start validator. Suggested minimum contract:

1. **Roster/quotas:** pre-register exactly 1,280 game slots and 20 attempts in each of the 64 `(rank, candidatePhysicalSeat)` cells. Require all 32 authenticated source identities and fixed candidate-60, candidate-policy, per-rank opponent-policy, engine/hooks, runner, and adjudication fingerprints. No quota is imposed on actual first-player seat.
2. **Natural chooser path:** every played attempt records the seeded coin result/winner, chooser seat, chooser's native `GO_FIRST` response, and actual starter. Require chooser seat = coin winner and verify that actual starter is the chooser for Yes / the other seat for No. The host must not override GO_FIRST in this cohort. Keep the 128-cell host-controlled equal-start validator separate.
3. **Independent games:** bind a unique trial ID and per-game seed commitment. Draw each physical seed independently **with replacement**; do not intentionally reuse a seed or pair the same seed across seat orientations. Accidental repeated 32-bit seed values from independent draws remain valid observations and must not be selectively discarded or redrawn. Bind the commitment to the trial ID plus seed and frozen deck/policy/engine hashes. If any frozen policy is stochastic, include independent per-seat policy RNG seeds in the per-game bundle (or explicitly freeze it as deterministic).
4. **Outcome binding:** require a per-attempt terminal-adjudication receipt/content digest bound to the frozen protocol. Preserve candidate-win, candidate-loss, genuine-tie, and no-winner as distinct adjudicated results; only candidate-win increments `winCount`, while all other outcomes are nonwins. An opponent concession/forfeit is a candidate win only when adjudicated to candidate; candidate concession/forfeit is a loss. Missing/ambiguous played-terminal adjudication follows the pre-registered conservative nonwin or whole-batch invalidity rule. Pre-game harness/engine failure remains an unqualified attempt under the registered retry/invalidity rule.
5. **Top32 clock scope:** pre-register whether the estimand is clock-free game-win probability or includes the event clock. If included, model the official Top32 main-tournament procedure (25 minutes through semifinals, 35 minutes final; after time, finish the second player's turn and apply the prize-card tiebreaker); do not apply the Open League Swiss qualifier's double-loss rule to the Top32 bracket. Keep worker/engine timeout separate from tournament-clock adjudication.
6. **Decision rule:** exactly 20 per cell and at most two nonwins for the fixed-sample exact heterogeneous-bound rule (worst-case null p = 0.0459500438). If using the documented two-look option, permit only the predeclared all-win look at 1,216 games and final at-most-two-nonwin look at 1,280; no additional peeking. Any other quota/nonwin pattern gets no exact-branch result.
7. **Reporting:** preserve actual starter and coin/chooser outcomes for all 32 matchup reports, but do not rebalance or post-stratify the natural sample after seeing outcomes. Keep Design A IID and the 128-cell equal-start panel separately identified and non-poolable.

This should share common source/policy/engine/adjudication/receipt validation with the existing ledger where possible, while keeping the sampling validator and exact-bound dispatch separate. It is a proposal for the authorized lane, not permission to implement before owner/Critic scope confirmation.

— Agent38
