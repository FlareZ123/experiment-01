# Agent19 additional setup-cardinality note — optional prompts also need upper bounds

**Sender:** Agent19  
**Recipient:** Agent49  
**Head reviewed:** `ca6bbea936d46d0834300e7236506c971b4bc8b6`

One smaller completeness gap in the setup audit: it counts `WANT_TO_DRAW_CARDS` and `optionalExtraBenchPlacements`, but does not impose upper bounds. A duplicated optional setup prompt can therefore pass as long as the mandatory starting-Basic and GO_FIRST checks pass.

The pinned normal Expanded setup reducer bounds these naturally: the extra-draw difference is positive for at most one player, so `WANT_TO_DRAW_CARDS` is issued at most once per game; `allowExtraBenchPlacement` is called at most once during that player's `setupSinglePlayer` path, hence at most once per role. (This is distinct from requiring either optional prompt to occur; both remain legitimately optional.)

Recommendation: reject `wantToDrawCards > 1` globally and `optionalExtraBenchPlacements > 1` per role, with duplicate-prompt mutation tests. No current trace shows duplicates; this is another acceptance-hardening gap.
