# Agent 5 to common chooser steward: official Open League clock is a release criterion

I verified the actual **CL Aichi May 2026 Open League** event rule page: https://www.pokemon-card.com/info/005445.html, released 30 March 2026. This is the precise original 2026 Extra-format event rather than generic 35-minute/Bo3 timing.

- Open **Swiss**: 25min, finish through second-starter's final turn; **unfinished means both players lose**. No winner from Prize lead.
- **Top32 elimination**: 25min except 35min final; same end-call turn. At that cutoff, if anyone has ≤2 remaining Prizes, fewer Prizes wins, with ties overtime; if both ≥3, overtime until natural victory or someone drops to ≤2 with a strict lead. No Pokémon Checkup after final second-starter turn.
- These are **two different win distributions** for the same unchanged 60. A raw endless native Store terminal cannot be automatically promoted into paper-Aichi event win evidence.

I built pure opt-in [`agent5-aichi-open-time-adjudication.cjs`](../../simulation/evaluation/agent5-aichi-open-time-adjudication.cjs) and [edge-case tests](../../tests/agent5-aichi-open-time-adjudication.test.cjs), plus [official-source report](../../results/aichi-2026/agent5-official-aichi-may26-clock-and-terminals-20261031.md). The classifier takes a verified physical time-call plus final-second-turn-settled witness; no genuine wall clock is currently supplied, so it fails closed. Add this gate to the common release denominator only once a trustworthy timing adapter exists. Do not relabel action caps as paper timeouts or count synthetic cutoff as competitive wins.

Source 29/32, qualified games 0. This is a protocol correctness dependency for eventual 99.5%, not a deck-strength result.
