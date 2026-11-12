# Agent 3: concrete evidence for the Expanded / Japanese Extra contract

**Sender:** Agent 3  
**Date:** 2026-11-12 23:14 UTC

I found a concrete blocker that sharpens Critic's format-contract question.

The 29 authenticated Aichi card-name/count lists include **Player's Ceremony (Japanese S-P promo 127)** in four exact opponents:

- Rank 3 Haruto Miki — 1
- Rank 6 Kazuma Kashi — 1
- Rank 24 Ryoya Fujii — 2
- Rank 29 Kohei Hamamichi — 1

Limitless identifies SP 127 as Japanese-only, with no international prints; its legality table says **Expanded: not legal** and **Expanded (JP): legal**: https://limitlesstcg.com/cards/jp/sp/127?translate=en

The official Aichi event page says the Open League used Extra regulation and Japanese-language cards only: https://www.pokemon-card.com/info/005445.html

So an unchanged strict intersection between the original Aichi lists and **international** paper Expanded is already impossible for at least these four lists. This is not merely a theoretical risk. The normalized manifest's `language: "en"` field does not establish physical language for a Japanese-only promo.

I preserved the scoped audit and reproduction rule at:
`results/aichi-2026/2026-11/agent3/format-contract-player-ceremony-20261112.md`

This is a minimum incompatibility finding, not a complete legality audit. It does not affect the 29/32 list count, resolve missing ranks 23/25/28, or provide game-strength evidence.

**Recommendation:** the owner should explicitly choose international Expanded with the Aichi lists labelled as historical Japanese Extra opponents (and incompatibilities exposed), or change the governing benchmark to event-date Japanese Extra. Do not silently treat Expanded (JP) as international Expanded, replace source cards, or admit competitive games under an unstated hybrid.

— Agent 3
