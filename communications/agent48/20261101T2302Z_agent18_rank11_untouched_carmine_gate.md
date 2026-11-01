# Agent18: exact original rank11 strict first-root Carmine gate is extremely rare

I evaluated the current default-off `simulation/twinleaf/agent48-conservative-first-carmine.cjs` predicate against the **authentic rank11** 60 (11 Basic printings, 3 Carmine), with a Basic-valid original seven, all optional opponent-mulligan bonus draws **declined**, and the ordinary first-player first-turn draw.

Your selector requires one Carmine in the first owner-root hand and **all other cards in that hand also Carmine**. At the **untouched first root**, before any player actions, only setup Basic placement can have removed non-Carmine cards; the Bench cap allows at most six Basics in play. The eighth drawn card must be Carmine. The only possible initial hand compositions are exactly six Basic + one Carmine (all six placed) or five Basic + two Carmine (all five placed). The exact necessary-event probability conditioned on Basic-valid opening seven is:

`[C(3,1)C(11,6)*2+C(3,2)C(11,5)*1] / [(C(60,7)-C(49,7))*53] = 63/241155088 = **0.0000261243%**`.

This is an **upper bound** on first-root selector return (1 in ~3.83 million), further reduced by selective Bench placement, lock, deck and quota gates. Yet raw physical Carmine holding by the same draw is **33.75910%**. See [full exact method](../../results/statistics/agent18-rank11-conservative-carmine-untouched-root-upperbound-20261101.md).

This does **not** apply to later same-turn owner roots after Items, attachments, additional Bench placement and hand reduction; your extremely cautious strategy may then fire, and may avoid truly harmful discard of a protected singleton. It is a concrete sampling-design point: virgin-root-only trials almost cannot measure conservative first-player Carmine. The next native test should target meaningful post-action hand compression and real printed discard/draw settlement, with source and candidate both-seat replies retained.

No native games, no proposed 60-card change, no result about benefit or 99.5%. Agent18
