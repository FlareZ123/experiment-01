# Rank-26 Ticket + Crobat V + Forest Seal Stone direct DCE rescue

**Agent 34, 16 October 2026.** Evidence types: source-locked exact opening combinatorics, independent exhaustive miniature deals and an actual pinned Twinleaf Store action sequence. This is a conditional **resource-access** analysis, not a first-turn Crisis Punch probability or competitive win-rate result.

## Exact early-resource event

The [published 60](full-decklists.json) contains one Double Colorless Energy (DCE), one Redeemable Ticket, one Forest Seal Stone and one Crobat V. Consider a valid Basic-containing opening seven, then six initial Prize cards and one ordinary first-turn draw. Require the DCE initially Prized, and Ticket, Stone and Crobat all in the first eight cards (not counting Prizes). These conditions imply either all three pieces in the opening seven, or exactly one appears as the first-turn draw.

| Disjoint case | Probability among valid opening sevens |
| --- | ---: |
| Ticket + Stone + Crobat in opening seven | 0.013302286220% |
| Ticket first-turn draw; Stone + Crobat initially | 0.002660457244% |
| Stone first-turn draw; Ticket + Crobat initially | 0.002660457244% |
| Crobat first-turn draw; Ticket + Stone initially, another Basic in seven | 0.001809516366% |
| **Total direct opportunity** | **0.020432717073%** |

Crobat is Basic. Therefore the first three cases automatically satisfy the legal starting-hand Basic requirement. The last case explicitly requires another Basic among the starting seven.

The source-guarded [calculator](../../scripts/aichi-ticket-stone-search.cjs) and [miniature-deal regression](../../tests/aichi-ticket-stone-search.test.cjs) ran in [manual CI 38917573272](https://github.com/FlareZ123/experiment-01/actions/runs/38917573272). The probability excludes opening search and draw effects, mulligan bonus draws, actual costs, locking, the required attacker's availability and all later gameplay.

## Source-inventory Store verification

The [rank-26 Store witness](../../simulation/twinleaf/ticket-stone-rank26-source.cjs), also passed in CI 38917573272, reconstructs all 60 source-listed physical cards with Meloetta ex active and Crobat V benched. It places the singleton DCE among original Prizes, keeps Ticket and Stone in hand, and uses the reversible paper-order Ticket hook and mandatory Stone-search hook.

The pinned Store accepts the Ticket Item play, relocates DCE to the returned bottom block, attaches the Stone Tool to Crobat V and dispatches Star Alchemy. The ChooseCardsPrompt selects the original DCE card, the follow-up shuffle resolves, and DCE is in hand while the VSTAR Power is spent. A full 60-card identity check guards against adding invented inventory.

This is a **constructed legal-action witness**; its opening was purposefully arranged rather than randomly dealt, and its opposing board is a minimal control. It does not establish that Meloetta can use Crisis Punch that turn, that the whole sequence survives Item/Ability lock, or that an automated policy would choose these actions. The alternative [Ticket→Compressor access calculation](rank26-ticket-postshuffle-draw-window.md) and this Stone route can overlap, so their probabilities cannot be added as though disjoint.
