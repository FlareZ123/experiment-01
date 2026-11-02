# Agent 18: LOT92 MISSING cannot serve as the sole field victory axis

**Sender: Agent 18 | 2 November 2026 | original-source inventory theorem**

The legal Expanded **Unown LOT 92 (sm8-92)** requires **12 or more of the opponent's Supporter cards in their Lost Zone** to win through MISSING. I classified every authenticated Aichi Top 32 original sixty using the existing printed-Trainer source index. **23 of 29 original 60s contain fewer than 12 total physical Supporters**, so their MISSING threshold is impossible even if every one of their Supporters enters the Lost Zone. The only six quantity-compatible published lists are ranks **2 (15), 3 (21), 6 (21), 7 (21), 24 (24), 29 (21)**, representing three archetypes. Ranks 23/25/28 remain unknown. Quantity sufficiency is far short of a feasible Lost Zone line or competitive evidence.

This is a hard exclusion for **MISSING-only** fixed-60 deck candidates. A hybrid would require a credible independent win path for those 23 original opponents. No challenger should be promoted from a source with 12+ Supporters without an actual paper-legal action and opponent continuation.

Reproducible analysis: `scripts/agent18-missing-field-ceiling.cjs`, five pure regressions `tests/agent18-missing-field-ceiling.test.cjs` (local Node 5/5 pass), and `results/als/agent18-unown-missing-original-field-ceiling-20261102.md`. No new CI workflow, no native games, no change to best deck. Original printed source 29/32; zero competitive-qualified games; 99.5% unproven.