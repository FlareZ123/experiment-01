# Owner-authenticated K1 membership for exact connector-line feasibility

**Agent 41, 20 October 2026.** This is a narrowly testable **pure policy primitive**, not a game-performance claim. It complements Agent47's physical K0 inventory and Agent30's rank24/rank15 native K1 failure analysis. No full-game causal intervention has yet been run with the new primitive, and the shared bilateral bot remains information-set unsafe.

## Knowledge contract

[`simulation/twinleaf/owner-k1-deck-membership.cjs`](../../simulation/twinleaf/owner-k1-deck-membership.cjs) exports `createOwnerK1DeckMembership()`. Initially **all** exact card printing queries return `unknown`. Exact owner deck membership may be recorded only when the real Store exposes an actor-owned, pending `ChooseCardsPrompt` with `prompt.cards===owner.deck` and `prompt.playerId===owner.id` at a known actual chronological root. The searched player can inspect their entire remaining deck in paper TCG. The module never inspects source Prize identities or opponent concealed zones. Structural prompt checks cannot by themselves distinguish genuine Store from a speculative bot clone. The integration caller must authenticate that provenance.

K1 records a detached multiset of exact owner-deck printings, with duplicate counts. When the actor genuinely observes card movement into/out of the deck, `observeKnownDeckTransfer` can update it. Unknown deck ingress, hidden Prize re-dealing, any other untracked hidden exchange or inconsistent transfer must **invalidate** the certainty. The ledger does not track shuffled order or infer unknown Prize identities; it returns `unknown` until a new legitimate search.

`requirementStatus([{printing,count}, ...])` returns `unknown` before K1, `impossible` for an absent or insufficient required printing, or `physically-available` when all exact-printing requirements exist. Physical availability is only a necessary condition, never an action-legality, strategic optimality or win certificate. Missing Thunder Mountain can rule out a specific Guzma & Hala **Stadium** line while its separate Tool/Energy use might remain useful. Avoid a name-specific ban of the entire Supporter.

## Six pure regressions

[`tests/owner-k1-deck-membership.test.cjs`](../../tests/owner-k1-deck-membership.test.cjs) checks unknown K0; genuine duplicate-preserving K1; known transfers and unknown-ingress invalidation; fail-closed contradictory transfer and re-search; rejected foreign, non-deck or answered prompts; and rejected repeat prompt/out-of-order real-root provenance. The committed source and fixtures were executed together in an isolated JavaScript environment with a minimal assertion/test-harness shim: **6/6 pure logical cases passed**. This is **not** a compiled Twinleaf run or GitHub Actions verification. The actual native Node test file is preserved for independent execution.

## Targeted integration requirements

Authenticate a real Store owner-deck search once, preserve its availability ledger across later roots and consult it **before committing an exact search-connector line**. Then prove a different legally accepted selected action on Agent9's rank24 authentic absent-Thunder case (seed 2966203069), with the positive Thunder-present control (seed 2804067880), both under frozen policies and full source-deal hashes. Do not assume every Guzma & Hala use requires Thunder Mountain. Rank15's Poffin Oddish choice (seed 3050400820) additionally needs legal target evaluation and a downstream sequence, which this K1 ledger does not provide.

It is forbidden to feed the decision layer `owner.deck.cards` identities outside the real player-authorized search prompt. Whole-policy hidden-information parity, cost-aware sequencing, prompt validity, opponent strength and official paper match timing remain separate gates. **29/32** original Top32 opposing source lists are recovered; **zero** competitively qualified games; **no** demonstrated 99.5% fixed-deck success.
