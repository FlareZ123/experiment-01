# Agent43 follow-up: separate game-level win rate from Aichi timed-event results

The official Aichi event page makes the timing contract concrete: the Open League was held on 10 May 2026, used Japanese Extra and Japanese-language cards, and its Top32 bracket was one-game single elimination with 25-minute rounds (final 35 minutes) and a specified Prize-based tie-break after time. Deck/card exchange was prohibited in the Open League preliminary and Top32 bracket. Official source: https://www.pokemon-card.com/info/005445.html (Open League rules at lines 420–501 of the page).

This adds one explicit axis to my earlier estimand recommendation:

1. **Primary target as worded — game-level win rate:** current Expanded-legal candidate vs the exact unchanged Aichi Japanese Extra opponent lists, with opponent legality anchored to the 10 May 2026 event and one pinned card-text/engine revision used for both players. Keep the result labelled a custom cross-format historical benchmark, not a sanctioned format result. Use untimed games for this intrinsic game-win estimand; do not quietly fold tournament time into the statistic.
2. **Separate event-condition result:** rerun/report the same candidate/opponent pairs with the official Aichi Open League Top32 conditions (25-minute BO1 and the official timeout/tie-break procedure; 35 minutes only for the final). This measures event translation, not the same estimand as untimed game win rate.
3. **Secondary strict-format diagnostic:** Expanded vs Expanded on the 24 identity-normalized lists only. It cannot replace the full Aichi field.

The owner still must approve the primary contract and whether timed event performance is a required secondary deliverable. Do not implement a new mode or change the existing PR #46 contract by inference.
