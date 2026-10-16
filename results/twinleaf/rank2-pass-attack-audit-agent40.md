# Source-locked rank-2 pass-attack checks: three engine-accepted alternatives

**Agent 40, 16 October 2026.** Evidence type: deterministic pinned-engine announcement probes, not qualified human-play matchup results.

## Experiment and source fidelity

[Manual CI run 38850069100](https://github.com/FlareZ123/experiment-01/actions/runs/38850069100) completed successfully with the Aichi bounded-game workflow, `pilot_ranks=2`, `audit_passed_attacks=true`. It used the three fixed candidates (champion reference, Hood Shield, Temple), both candidate physical slots, and the independent-slot-v2 schedule. The source opponent was the published rank-2 Vileplume control list. The runner pinned Twinleaf at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, with the explicitly opt-in existing headless fidelity corrections, fixed-core simple policy, separated speculative RNG and trace capture. The `aichi-campaign-diagnostic` and `aichi-pass-attack-opportunities.json` artifacts preserve the observations.

The opt-in `pass-attack-announcement-probe.cjs` acts **after the AI independently chooses PassTurnAction**. For at most four ordinary attack-bearing passes and four Tool-equipped passes per game, it tries each available printed or attached-Tool attack's name in its own **fully deep-cloned** pinned Store. That probe's `AttackAction` acceptance is serialized. A successful announcement is not a proof of favorable damage, subsequent prompt resolution, improved prize trade, paper legality, or tactical optimality. The [auditor](../../scripts/aichi-pass-attack-opportunities.cjs) rejects mismatched trace integrity, unqualified archive metadata, invalid seat ownership, and malformed probes.

## Observed source-ranked outputs

The six matches were all `completed-engine-game` under the weak research policy. The post-pass audit reported:

| Observation | Count |
| --- | ---: |
| PassTurnAction decisions captured (both seats) | 176 |
| Passes checked with cloned attack probes | 24 |
| Passes skipped by sampling/quota | 152 |
| Probe errors | 0 |
| Checked passes with one or more accepted attacks | 3 |

All three accepted-alternative states belonged to the **rank-2 opponent**, rather than the Shadow Rider candidate seat:

| Source trial | Observed turn | Accepted names |
| --- | ---: | --- |
| `pilot:2:0:champion-reference:A` | 5 | Blustery Wind (printed) |
| `pilot:2:0:hood-shield-v1:A` | 5 | Blustery Wind (printed) |
| `pilot:2:0:hood-shield-v1:B` | 56 | Burrow, Rototiller (printed); **Evolution (attached Technical Machine)** |

The turn-56 case reproduces the original exact-source `Bunnelby PRC` + Jet Energy + Technical Machine: Evolution + Benched Gloom pass, which [Agent 35 had previously characterized](../aichi-2026/agent35-crossrank-policy-diagnostic.md). It advances from target inventory or cost heuristics to an independent observation that the pinned Store accepted three alternative attack announcements at that original Pass decision. No evidence establishes that these alternative actions would have been strategically superior, and two early Blustery Wind acceptances may represent rational refusal to attack.

The observed candidate/opponent attack counts for the six trials remained 11/2, 6/8, 2/1, 4/13, 3/4, 17/3 in fixed trial order. They match the previously documented rank-2 fixed-core baseline counts. Equality of these coarse counts is reassuring and is **insufficient to certify equality of every action**, all prompt resolutions, or unobserved Card fields.

## Isolation qualification

The pinned engine's older `deepClone(state,[Card])` pattern aliases mutable source Pokémon cards into speculative state. Agent 49 independently reproduced a damaging real-game effect from such aliasing, documented in [Simulator Card reference leakage](simulator-card-reference-leak.md). The new probe and the older [TM Evolution announcement probe](../../simulation/twinleaf/tm-evolution-announcement-probe.cjs) were corrected to use `deepClone(state)`, without preserving original Card object references. The [real source board regression](../../tests/pass-attack-source-board-regression.test.cjs) includes a Bunnelby/Jet/TM positive and negative-payment control, and a source Conkeldurr Card-reference isolation check. Those tests passed [manual CI 38849597641](https://github.com/FlareZ123/experiment-01/actions/runs/38849597641).

**Caution:** The original announcement probes stopped before resolving all damage-animation prompts, so source Card mutation by those particular probes was never demonstrated. Fully detached cloning prevents that known class of alias by construction; it does not certify every aspect of the upstream clone implementation.

**Residual simulator limitation:** The default SimpleTacticsAi still performs its own speculative scoring through the pinned Simulator, which Agent 49 observed mutating live Card history during natural source-ranked bot play. Protecting the new *observational probe* does not repair those earlier policy/scoring mutations. The precise turn-56 board and its antecedent bot choices therefore remain conditional on a simulator with known semantic defects; the probe confirms announcement acceptance in that resulting state only.

## Research meaning and next validation

This is evidence that the default fixed-core bot sometimes passes when the pinned engine would accept an attack. Twenty-four of 176 passes were sampled; unsampled passes remain unknown. The accepted attacks require legal full-resolution counterfactuals and a meaningful comparison against alternative tactics to establish strategic value.

An isolated [rank-2 source turn-56 forced-Evolution intervention](../../simulation/twinleaf/rank2-pass-evolution-counterfactual.cjs) has been written as a follow-up. Its workflow is manual-only and its execution has **not yet been validated**. No win-rate estimate, successful counterfactual, opponent policy qualification, or movement toward a 99.5% game win rate is claimed here.
