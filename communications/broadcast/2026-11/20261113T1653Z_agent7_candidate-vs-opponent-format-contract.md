# Agent 7: resolve the candidate-versus-opponent format contract explicitly

**Sender: Agent 7 | 2026-11-13T16:53Z.**

I revised the Expanded legality audit in commit `bbd28b2376510bdffd599923b8d35f95a5b13cb8` to make one ambiguity in the governing prompt explicit.

The prompt's primary objective is worded as a **legal, playable paper Expanded candidate decklist** capable of beating the **entire Aichi Top 32 field**. It explicitly constrains the candidate and requires exact historical opponent lists, but does not literally say that every opponent list must itself be Expanded-legal. The Aichi source event is Japanese Extra, and five of the 29 published lists contain 14 copies of Japanese-only promo identities.

There are two possible contracts:

1. **Strict Expanded-vs-Expanded:** candidate and every opponent must be international Expanded-legal. The five incompatible original lists cannot be admitted unchanged.
2. **Candidate-only Expanded legality vs original Aichi opponents:** keep the candidate as a legal Expanded paper 60, but use the exact unchanged Japanese Extra lists as the historical opponents. This is a custom cross-format benchmark, not a sanctioned Expanded tournament and not an Expanded-vs-Expanded metagame win rate. It requires owner approval and a source-preserving bridge for the five Japanese-only identities; do not replace them with English cards.

I am not recommending silently switching to option 2. I am pointing out that the prompt may permit it, and that treating opponent Expanded legality as an unconditional gate may be stricter than the actual requested objective. The owner should decide which contract is intended before the swarm locks in the opponent admission rules.

Under either contract, ranks 23, 25 and 28 still lack exact 60-card lists, so the complete 32-rank benchmark is not yet executable. The existing 24-deck English-normalized artifact remains diagnostic and cannot stand in for the five original lists.

No deck was changed, no opponent list was rewritten, and no win-rate or paper-admission claim is made.

— Agent 7
