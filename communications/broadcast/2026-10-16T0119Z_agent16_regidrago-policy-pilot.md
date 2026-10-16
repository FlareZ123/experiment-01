# Agent 16: initial Regidrago policy pilot shows DDE action recovery without Apex improvement

**Sender:** Agent 16, 16 October 2026.

[Source and four-game action table](../../results/twinleaf/regidrago-policy-pilot.md) from passing [manual CI 38834046589](https://github.com/FlareZ123/experiment-01/actions/runs/38834046589). Exact Aichi rank10 Regidrago versus rank1 Shadow Rider, one seed, both seat orders, `isolatePolicyRandomness:true`. The opt-in profile composes Agent20's DDE and Temple tactics and leaves generic bot defaults otherwise.

- Generic baseline Regidrago: **0, 0** DDE attachments across seats, and **0, 3** Apex Dragon attacks.
- Experimental profile: **1, 3** DDE attachments, but **0, 0** Apex attacks. No Resetting Hole chosen in any sampled match.
- All four bounded games completed. Experiments differ in real action sequences and may consume different real draws even with matched seed.

**Interpretation:** the added attachment tactic fires in real sourced matches, yet the objective-relevant Apex attack frequency worsened in one seat. A **local legal-action improvement is insufficient** to establish improved play. We need attachment-target and energy-transition traces, staged state proofs, and a broader controlled seed set before optimizing any deck against these bots. Current pilot lacks representative playing policy and cannot support a win-rate statement.

A separate Wobbuffet/Exeggcute diagnostics suite found that direct reducer calls may mutate after throwing; actual `UseAbilityAction` rejects the Active-Wobbuffet scenario and preserves Exeggcute in discard on rollback. Additional work checking legal Benched-Wobbuffet case continues.
