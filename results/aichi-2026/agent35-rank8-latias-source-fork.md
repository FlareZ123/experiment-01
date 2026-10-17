# Agent 35: preregistered authentic rank-8 Latias escape counterfactual

**17 October 2026 UTC, normal research mode. Pre-dispatch design.** No qualified game or win-rate evidence.

## Why this source position

The frozen benchmark 60 is Aichi rank 1 champion Shadow Rider Calyrex. The opponent is the **exact published Aichi rank 8 Yusuke Kobayashi Absol/Garbodor 60**. The v3 comparison protocol fixes pilot:8:0:champion-reference:A, physical benchmark seat A and PRNG seed **3755937400**. The original [source-dealt artifact 39041216040](https://github.com/FlareZ123/experiment-01/actions/runs/39041216040) is the observational reference, but its archived policy revision differs from a new dispatch's head. Source archive revision 0de5fdf1965dbc388cebe65dff400cb5a5494b9c; pinned engine a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.

In the reference game, candidate Passes at global turns **21, 23, 25, 27** while Active Latias ex carries two Psychic, Benched Trevenant & Dusknoir-GX carries three Psychic, candidate holds Field Blower, and an opposing Benched Garbodor holds Float Stone. [Source-hand and public-board audit](rank8-latias-escape-window.md). Four repeated turns are one correlated physical game, not four independent observations.

## Falsifiable experiment

The new research-owned scripts [policy](../../simulation/twinleaf/rank8-latias-escape-policy.cjs) and [full-deal fork](../../simulation/twinleaf/rank8-latias-escape-fork.cjs) select the first matching **already chosen Pass** on one of those four turns. Selection reads only visible board and acting player's own hand. In the unchanged natural source deal, three different paths are run:

1. **Control:** unchanged pinned bot.
2. **Tool branch:** Field Blower targeting Garbodor's Float Stone, then normal Latias retreat to three-Psychic Trevenant & Dusknoir-GX, then its printed Night Watch attack.
3. **Paid-retreat branch:** bypass Field Blower and directly spend Latias's attached Energy to retreat to the same attacker, then attempt Night Watch.

The branches are mutually exclusive full games from the same seed and source 60s, never spliced together. The controller intercepts a source Pass only and uses genuine PlayCardAction, ResolvePromptAction, RetreatAction and AttackAction. A pre/post unchanged-source run checks for same-process observer/override contamination; the first raw Store dispatch divergence should be the selected Pass replaced by an action on that same global turn. A different initial turn, missing conjunction, an earlier action divergence, an invalid Store declaration, absent Tool-selection prompt, failed retreat, unavailable attack, or inability to reproduce baseline is reported as a **failure to demonstrate the proposed line**, never silently deemed legal or strategically optimal.

**Outcome accounting:** Save JSON under the manual [Garbotoxin cross-lock workflow](../../.github/workflows/aichi-garbotoxin-crosslock.yml) artifact rank8-latias-source-escape-fork, including source opportunities, branch actions, first dispatch divergence, captured terminal state and failure mode. Source mismatch can arise from policy drift and must not be misreported as refutation of the original archived position. An accepted attack is not proof the line was strategically superior. All branches use the same unqualified generic opponent bot. No game from this test is eligible for 99.5% or Top-32 competitive inference without later paper-rule and policy validation.

## Primary acceptance criterion

At least one authentic source Pass should be converted into the entire **Field Blower -> Tool selected and removed -> Retreat -> Night Watch** ordered action chain, with unchanged earlier root Store dispatches. The paid-retreat route is the essential control: if the source Store accepts Retreat and Night Watch without Field Blower, then Field Blower itself has no immediate attack-access necessity in that state. A successful control route could reframe the observed pass as a general multi-action planning defect. If both fail, first identify the exact Store rejection and check the paper card text before concluding either route is impossible.

This experiment targets a single high-impact policy qualification blocker and carries no performance claim.
