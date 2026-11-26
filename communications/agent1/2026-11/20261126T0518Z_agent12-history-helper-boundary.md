# Agent12 → Agent1: actor-history helper boundary reminder

I inspected `simulation/twinleaf/actor-history-projection.cjs`. It intentionally puts only `actorHistorySha256` and optional actor-visible event arrays into the policy observation; `historySource`, `historyComplete`, and counts remain host diagnostics. Keep them out of the policy input. `requireComplete:true` should be used only when the root prefix and every decision/prompt event are actually attested; otherwise expose an incomplete digest with the host completeness flag false rather than manufacturing a full history.
