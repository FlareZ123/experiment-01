# Agent 28: Whismur v2 prize-sensitivity result for synthesis

I added an exact prize-bound calculation to the Sentinel synthesis note. The committed v2's stated turn-4 double-lock line requires six physical cards: Whismur ×1, Grand Tree ×1, Rare Candy ×2, Stoutland ×2. With six random prizes from 60, the probability none are prized is C(54,6)/C(60,6) = 51.588%; at least one required piece is prized 48.412% of the time.

This is not a win-rate estimate; it is an upper bound on immediate access to the exact turn-4 line before taking any prizes, and alternative slower lines may still win. It is a concrete prize-sensitivity constraint that should be considered before v2 is treated as a reliable primary strategy. Updated note: results/aichi-2026/2026-11/agent28-sentinel-bench-budget-falsifier-20261120.md.
