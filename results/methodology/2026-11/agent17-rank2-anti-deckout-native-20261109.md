# Rank2 Vileplume control: native late shuffle rescue of the original fixed-60 contenders

**Agent17, 9 November 2026.** Development-only same-source retrospective case study. This changes an owner-only decision rule; it is excluded from prospective full-field results and paper-game admission.

## Outcome, first genuine nested-actor rescue run

The original rank2 Vileplume source printed 60, original source deals, frozen champion and Hood Shield printed 60s, source opponent policy, pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, and root action horizon 640 remain fixed. Only an opt-in late shuffle Supporter chooser is added inside the canonical two-seat actor policy. It may propose an actually held `Iono`, `Marnie` or `Lillie's Determination` at a native Pass root when the actor's deck contains at most two cards and the card would return enough owner hand cards that the deck still contains more cards after its draw. The native Store validates any proposed action; subsequent shuffle/draw prompts remain native.

| Original rank2 physical pair | Historical root640 control | Replayed with rescue | Accepted late rescue roots |
| --- | --- | --- | --- |
| Candidate A, rank1 champion | Source win, turn83/root337 | **Candidate native win**, turn146/root565, Prizes [6,6] | Iono turn77/root313; Lillie's Determination turn127/root496 |
| Candidate A, Hood Shield | Source win, turn83/root337 | **Candidate native win**, turn93/root410, Prizes [0,1] | Iono turn77/root317 |
| Candidate B, rank1 champion | Source win, turn87/root365 | **Root cap, unresolved**, turn153/root640, Prizes [6,6] | Iono turn81/root341; Lillie's Determination turn135/root562 |
| Candidate B, Hood Shield | Source win, turn67/root313 | **Source native win**, turn67/root313, Prizes [6,2] | Zero rescue actions |

Across four original-source deals, the nested native audit recorded five accepted new Supporter root plays, zero rejected proposals, and 280 actor Pass decisions observed by the hook. Both contenders preserve their respective original physical source deal, and each replay's **first 260 root-action SHA256 matches** its historical archived control.

The separate outer-wrapper attempt [run 42586706167](https://github.com/FlareZ123/experiment-01/actions/runs/42586706167) was a **failed activation**, with zero Pass observations. The actual nested actor activation was corrected in [run 42587529734](https://github.com/FlareZ123/experiment-01/actions/runs/42587529734); artifact [13660330085](https://github.com/FlareZ123/experiment-01/actions/runs/42587529734/artifacts/13660330085) includes genuine roots, candidate action receipts and terminal outcomes. This remains a retrospective intervention, outside the original prospective paired denominator.

## Mechanism and limits

On champion candidate A turn77, its hand held 33 physical cards, the deck contained two, and it had six remaining Prizes. Its actual `Iono PAL` was selected; the printed own draw is six, and returning the other 32 cards yielded a projected 28-card deck after the draw. The native Store accepted the `PlayCardAction` and consumed the Supporter quota. A second shuffle Supporter was selected at turn127. Hood candidate A executed an Iono turn77 and later took its final Prize by turn93.

The existing canonical shuffle Supporter fallback only permits hands of three or fewer cards. The rank2 control matchup instead generated 30-plus-card hands near deck exhaustion. Shuffle effects can preserve later mandatory draws even when they appear unappealing to a net-card-access heuristic.

**Limits:** native root acceptance does not independently certify post-prompt paper effects. Champion A ended as a native winner with both Prize totals [6,6], so its win is not from Prize completion. Turns 93 and 146 far exceed realistic Aichi match clocks. No independently verified clock, full paper game, strong opponent policy, or competitive qualifier exists. `competitiveGameQualified=false` for all four rows. The original full29 Hood-versus-champion sharp native interval [-9,+13] remains unchanged.

## Next actionable mechanism

Hood B still loses at turn67 despite having taken four Prizes. The last candidate turn includes an attack rather than a Pass, so the current post-Pass rescue cannot fire before it. A separately opt-in **pre-attack shuffle** can intervene before that chosen attack on the same turn, allowing the bot to attack later if the Supporter resolves and requirements remain met. Test the exact original source deals under the same native policy, preserving the original archive untouched.

Code: [owner-only chooser](../../../simulation/twinleaf/2026-11/agent17-deckout-rescue-selector.cjs), [pure tests](../../../tests/2026-11/agent17-deckout-rescue-selector.test.cjs), [nested actor](../../../simulation/evaluation/agent7-canonical-actor-composition.cjs), [rank2 replay](../../../simulation/evaluation/2026-11/agent21-rank2-long-control-native.cjs). Default off.