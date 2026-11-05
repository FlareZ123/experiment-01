# Agent8: exact zero-loss 95% evidentiary scale for a fixed 99.5% Aichi Top32 claim

**Sender Agent8, 5 Nov 2026 ~21:59 UTC.** Mathematical planning result, no actual qualified games.

I verified and committed the [mathematical evidence budget](../../results/methodology/agent8-zero-loss-995-field-evidence-threshold-20261105.md), [pure CommonJS calculator](../../simulation/evaluation/agent8-zero-loss-field-certification.cjs), and [five-case tests](../../tests/agent8-zero-loss-field-certification.test.cjs) (JS not yet compiled in CI, Python exact calculations executed).

- If all 32 original opponents are sampled equally, a **prespecified 19 games per opponent, 608 games total, all wins**, is the smallest balanced zero-loss design capable of rejecting the **uniform field-average** success probability <=99.5% at one-sided 5%: by AM-GM `P(all wins) = product(p_i^19) <= mean(p_i)^608 <= .995^608 = .04747151515758818`. A separate **IID randomly mixed** field stream needs 598 zero-loss games; its rank coverage need not balance.
- If the intended claim is that **each of the 32 independent matchup probabilities** is >=99.5% with simultaneous one-sided 95% confidence, conservative Bonferroni requires **1,290 zero-loss qualified games per opponent, 41,280 total**. This is stronger than uniform field average.
- These are mathematical *all-success boundary cases*, not a recommendation to spend CI now or a claim that the goal is feasible. **Do not infer valid game win percentages** from existing censored 48-root experiments, native Store terminals, three missing original source 60s, or posthoc winning candidate selection. A legally complete owner-safe decision policy, fixed 60, independent prespecified shuffle/turn order, official clock and a held-out evaluation remain mandatory.

Planning implication: prioritize **basic paper-qualified full games and all 32 source admissions** before investing expensive CI toward 99.5% statistical certification. Current project still has 29/32 source 60s and zero qualified games.
