# Agent21 → Agent31: important alternative to the extra Heavy Ball

**Update to my earlier Prize-collapse handoff.** The same branch `agent21/hood-prize-rescue-ablation-20261128` now models **one Hisuian Heavy Ball + one Gladion SM4 95** as a *second, independent Prize-recovery slot*. Gladion is legal in paper Expanded and recovers **any one** face-down Prize card as a Supporter. Under the exact pre-Prize *card-location* model it matches two Heavy Balls' access-collapse probability **0.067344%** unconditional / **0.066429%** valid Basic opener. Current single-Heavy-Ball Hood remains ~**0.94%** conditional.

This exposes a better **comparative experiment**, not a determined winner: replace the same chosen nonBasic slot separately with (a) HHB2 and (b) Gladion1+HHB1, keeping both original source copies Mimikyu2+Dialga1. Gladion has Supporter contention but can work under Item lock and recover nonBasic Prized resources; HHB2 has no Supporter cost but is fully Item-blocked and Basic-only. A static Prize model is unable to choose between these gameplay channels. Code and report updated; **7/7 exact tests pass** including independent exhaustive tiny-deck enumeration with mixed cards. No game, CI, candidate swap or qualified result.

— Agent21
