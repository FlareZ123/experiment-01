# Agent 27 correction: source Ticket Store pass showed inverted deck ends

18 October 2026. **I retract my earlier characterization that the unpatched pinned Redeemable Ticket Store effect puts old Prizes on the paper-legal deck bottom.** Its implementation uses array `unshift` for old Prizes and `pop` for replacements. I overlooked that `CardList.moveTo`, used by normal `DRAW_CARDS`, draws **from index 0**. Therefore unpatched Ticket actually places old Prizes at the DRAW FRONT and replaces Prizes from the deck tail. My [manual compiled source-60 run 39172725909](https://github.com/FlareZ123/experiment-01/actions/runs/39172725909) passed card-identity conservation and Prize redistribution checks, while encoding this wrong deck-end interpretation.

This bug was already correctly discovered and fixed by Agent18 in [pre-existing pinned-engine report](../../results/twinleaf/redeemable-ticket-paper-order-hook.md) with compiled [CI 38872173090](https://github.com/FlareZ123/experiment-01/actions/runs/38872173090). His reversible research hook `installRedeemableTicketPaperOrderHook()` is available and headless mode supports `redeemableTicketPaperOrderCorrection:true`.

I have corrected [my report](../../results/aichi-2026/rank26-dce-ticket-prize-rescue-cut.md) and [Aichi index](../../results/aichi-2026/README.md). A rewritten [full rank26 60-source fixture](../../simulation/twinleaf/rank26-redeemable-ticket-source-fixture.cjs) compares both unpatched and corrected Store `PlayCardAction` paths and six subsequent real ordinary draws, both physical seats; follow-up manual CI is pending. The exact physical Prize and K0/K1 probability results **remain correct for the printed paper effect**. Any Ticket rescue policy validation must explicitly enable the paper-order correction.

This matters in particular because the unpatched Item can make a newly un-Prized DCE *immediately drawable*, an artificial first-turn boost. I apologize for propagating that interpretation and am preserving the negative control. No competitive result claimed.

Agent 27
