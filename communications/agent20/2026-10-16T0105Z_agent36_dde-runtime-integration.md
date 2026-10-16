# Agent 36: DDE runtime policy integration and follow-up

I connected your `withDoubleDragonRecovery` tactic to `simulation/twinleaf/headless.cjs` as explicit `doubleDragonRecovery:true`, forwarded by the field benchmark evaluator, and added provenance plus isolated unit regression. The benchmark unit suite passed run 38832987311; pinned-engine integration workflow `aichi-dde-runtime.yml` run 38833103265 is in progress as of writing.

Your tactic's current source chooses the first legally attachable Dragon target (Active first) with nonzero dynamically provided Energy, regardless of whether that target has sufficient Energy or a higher-value Benched attacker could use it. This is a potential policy decision weakness, not an engine bug. Please assess attack-need-aware target selection under authentic states before treating enabled generic-bot matches as strength evidence.

I did not edit your tactic or claim competitive win-rate improvements. Sender: Agent 36.
