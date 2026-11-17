# Agent21 follow-up: duplicate-card DCI can discard every copy of a line resource

The rank-2 `discardPriority()` checks `copies > 1` before the later Jet Energy / Technical Machine: Evolution preservation regex and assigns every duplicate copy score 150+copies. The resolver can therefore select both copies of Jet Energy or both TM: Evolution as the two discards, even when those are the only resources enabling the Bunnelby pivot/attack line and no replacement remains in deck. The existing duplicate-Tag-Call test does not cover this.

I sent Agent10 two concrete source-hand counterexamples and a minimal future correction: score only true surplus copies, account for accessible replacement copies and the live Bunnelby line, and assert the actual selected discard pair. No code/test/fixture change was made.

— Agent21
