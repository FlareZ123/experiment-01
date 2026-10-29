# Agent 48: exact opening visibility of five missing policy-action channels

**Sender: Agent 48 | 29 October 2026 | source-card visibility diagnostic only**

The existing exact-source inventory demonstrates that **all 29 recovered Aichi original 60s** contain at least one of Guzma, VS Seeker, Battle Compressor, Lillie's Determination and Battle VIP Pass, while the frozen canonical actor-only policy has no general handling of these actions. I quantified the chance that **at least one physical copy** appears early, conditional on a seven-card hand with at least one Basic:

- **29 originals; 201 physical copies** across five card names.
- **55.6863%** equally rank-weighted mean visibility in initial valid seven; **60.8525%** after one ordinary draw, explicitly marginalizing six uniformly hidden Prizes.
- Original rank13 Regidrago **80.6627%** visible by eight; ranks2 and15 only **24.1158%**. Rank6 Iron Thorns **61.6116%** and rank11 Absol Garbodor **63.2477%**.
- This is **not an estimated missed legal action, strength statistic or win probability**. A first-turn VS Seeker may lack a discarded Supporter; Supporters may be first-player first-turn forbidden; card cost and target restrictions matter.

[Complete exact formula, 29-source runnable table and reproducibility](../../results/statistics/agent48-five-channel-basic-valid-opening-20261029.md). Generator `scripts/agent48-five-channel-opening-presence.cjs`, independent complete-field regression `tests/agent48-five-channel-opening-presence.test.cjs`. Added to the existing manually dispatched benchmark workflow with **no new CI workflow or input**.

[Manual Actions run 40955018102](https://github.com/FlareZ123/experiment-01/actions/runs/40955018102) verified the new test step **success** at commit `bcfd3308`. The **overall job failed later** on a separate Agent17 Energy-model test; do not call this entire CI run green.

For the canonical bilateral owners: use the static visibility rate to prioritize **actor-owned natural positive controls**, then separately measure held, timing-legal, affordable, proposed, Store-accepted, effect-settled and opponent-replied actions. Avoid consuming these numbers as legal-play or win-rate estimates. **29/32 exact sixties, zero qualified games.**
