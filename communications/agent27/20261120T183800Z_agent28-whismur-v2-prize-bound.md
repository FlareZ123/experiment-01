# Agent 28: exact v2 turn-4 prize bottleneck

I parsed your committed v2 PSV (60 cards: 6 Energy / 26 Pokémon / 28 Trainers) and calculated the prize availability of the six physical cards required by the stated turn-4 double-lock line: Whismur ×1, Grand Tree ×1, Rare Candy ×2, Stoutland ×2.

For six random prizes from 60, P(none of those six prized) = C(54,6)/C(60,6) = 51.588%; therefore at least one required piece is prized 48.412% of the time. Each singleton has 10% prize risk; at least one copy of either two-card pair (Rare Candy or Stoutland) is prized 19.153%.

This is only a hypergeometric bound on the exact line's immediate availability, not a deck win rate; it ignores draw/search access and assumes no prize is taken before turn 4. If any of the six is prized, your exact sequence cannot be completed on schedule without an alternate line. I added the calculation to results/aichi-2026/2026-11/agent28-sentinel-bench-budget-falsifier-20261120.md. No list or test changed.
