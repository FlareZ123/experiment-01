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

## Follow-up: pre-attack rescue converts last Hood B loss

The previously unrescued Hood B original source game reaches turn65 with a **35-card owner hand, zero cards remaining in the owner deck, a held `Iono PAL`, three Prizes remaining, and a payable `Max Geist` attack**. It chooses the attack and later loses when it has no card to draw at the start of turn67. Waiting for a Pass will never offer the shuffle in this state.

An additional default-off native adapter option now inspects `AttackAction` as well as `PassTurnAction` using the same owner-only observation and printed shuffle calculation. When a prospective attack would advance the turn toward deckout, it first plays the legal held shuffle Supporter. After genuine Store acceptance and resolution, the native bot may choose its attack again during the same turn; both action types and card payments remain Store-authoritative.

[Pre-attack test CI 42588881375](https://github.com/FlareZ123/experiment-01/actions/runs/42588881375) with [raw native artifact 13660845727](https://github.com/FlareZ123/experiment-01/actions/runs/42588881375/artifacts/13660845727), exact same rank2 physical seed pairs and both frozen 60s:

| Original candidate | Pass-only rescue | Pass-plus-pre-attack rescue |
| --- | --- | --- |
| Champion A | Candidate native win turn146/root565, 2 Supporters | Same native win, 2 Supporters |
| Hood A | Candidate native win turn93/root410, 1 Supporter | Same native win, 1 Supporter |
| Champion B | Unresolved at root640, 2 Supporters | Same unresolved cap, 2 Supporters |
| **Hood B** | **Source native win turn67/root313; no rescues** | **Candidate native win turn69/root328, Prizes [6,0]** |

**Hood B's causal root:** `Iono PAL` accepted by genuine Store at turn65, action ordinal **303**; it was proposed immediately before an available `Max Geist`. Owner hand 35, deck zero, Prizes three. Printed Iono draws three and shuffles 34 cards from its owner hand back into its deck, yielding a projected 31-card deck. The bot then declared `Max Geist` at ordinal **306** on that **same turn**. It also attacked at turns67 and69, taking the final Prize. The original first260 root-action SHA256 remains **bit-identical**, so the changed action enters after the historical frozen cutoff. No change to the original source deck printing, source physical deal, or candidate deck occurred.

The native adapter audit recorded 185 AttackAction opportunities across the four trials (71+37+58+19), with **one genuine accepted pre-attack Supporter intervention** on the previously losing Hood B path, plus the same five after-Pass rescue actions in the other three trials. Eleven selector tests and four pre-attack adapter tests passed in the same CI before the real four-arm replay.

This materially identifies a **turn-order policy defect**: an attack can be strategically correct this turn while a held shuffle Supporter must be played *before* that attack to avoid mandatory-draw defeat at the start of the next turn. It is actionable in a general native owner-only policy. It does **not** prove a 99.5% paper Expanded win rate. All four games are retrospective; the clock of turn69 remains implausibly long, the simulator still has unsupported/uncertified paper behavior, and no full Top32 field result changes.

Files: [native adapter](../../../simulation/twinleaf/agent2-actor-only-shuffle-supporter-after-pass.cjs), [owner-only chooser](../../../simulation/twinleaf/2026-11/agent17-deckout-rescue-selector.cjs), [new pre-attack tests](../../../tests/2026-11/agent17-before-attack-deckout-native.test.cjs), [source-matched replay](../../../simulation/evaluation/2026-11/agent21-rank2-long-control-native.cjs). Opt-in is `pre_attack_deckout_shuffles` on the existing manual [native CI workflow](../../../.github/workflows/agent21-rank2-long-control-native.yml); historical default is unchanged.
