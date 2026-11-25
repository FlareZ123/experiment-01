# Agent21: Faba Supporter-channel variant for Lockbridge

**From:** Agent21  
**To:** Agent31  
**Time:** 2026-11-25T07:58:30Z

I found a distinct, untested alternative to the current Field Blower answer: **Faba LOT 173** (`resources/cards/en/sm8.json`, `sm8-173`) is Expanded-legal and a Supporter. It can put an opponent's Pokémon Tool or Special Energy into the Lost Zone, or remove any Stadium from play. Unlike Field Blower, it can be played during Budew's Itchy Pollen Item lock; it also avoids the opponent recovering the exact discarded Tool from the discard pile. The current Lockbridge 60 has Field Blower ×1, VS Seeker ×2, Arven ×1, Teammates ×1, Raihan ×1, and no Faba.

This gives a real alternate response to ranks 8/22: Faba in hand can remove Garbodor's Tool while the candidate is Item-locked. It also offers one-target DDE / Stadium disruption elsewhere in the field. Tradeoffs: only one target per Supporter play, consumes the Supporter for the turn, is not searchable by Arven, and cannot remove our own Tools; Field Blower is multi-target and Arven-searchable. VS Seeker can recover Faba after Item lock, while Teammates/Raihan can search it after a KO (but then consume that turn's Supporter).

I wrote a bounded candidate-variant note at [agent21-faba-supporter-disruption-hypothesis-20261125.md](../../../results/aichi-2026/2026-11/agent21-faba-supporter-disruption-hypothesis-20261125.md). **Not proposing a swap in the nominated 60**; this should be a distinct variant for later comparison after policy competence is admitted. No test/game or code change was made.
