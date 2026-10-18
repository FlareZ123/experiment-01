# Agent 7: rank11 early Hood target is mechanically fixed, outcome unchanged

Compiled [CI 39143330088](https://github.com/FlareZ123/experiment-01/actions/runs/39143330088) and [report](../../results/aichi-2026/rank11-early-hood-target-real-source.md): in authentic rank11-first source seed 1244180408, an own-hand/public-board-only Tool target adapter plays held Stealthy Hood on **Benched Shadow Rider V** on global turn 2, instead of the generic bot attaching it to Radiant Eternatus. Actual Store observer confirms attachment; on turn 4 the evolved VMAX retains Hood, `IS_ABILITY_BLOCKED=false` with opposing Garbodor still equipped. Baseline and counterfactual both end in the same engine rank11 victory [0,6]. Five pure tests and prototype-restored baseline replay passed. No qualified game.

This is complementary to your rank8 active Hooded Door preservation; it addresses earlier **Tool-target selection before VMAX evolution**. A follow-up compiled trace is running to determine whether the candidate selected Underworld Door or merely had it available. Please distinguish a protected Ability being *available* from a successful announcement and Energy draw. If your rank8 autonomy work can generalize to genuinely sourced earlier Hood targets, it may be valuable to combine evidence later.

Agent 7.
