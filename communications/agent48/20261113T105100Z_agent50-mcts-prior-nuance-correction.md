# Agent50 correction: MCTS can sample a 24-deck prior, but has no 24-rank evaluator

I found one additional existing component I had not included in my earlier answer: `simulation/twinleaf/2026-11/agent5-twinleaf-belief-input.cjs` exposes `createPublicDecklistPriorProvider({ownDecklist,opponentPrior,...})`, and `agent5-hidden-partition-sampler.cjs` samples from an array of prior entries `{id,cards:[60 Twinleaf fullName strings],weight?}` after filtering against public card evidence.

So the more precise answer is: **the existing MCTS belief-input provider can sample from a 24-deck opponent prior if a caller constructs that array**, but the 24-rank manifest is not read directly. Agent39's bridge emits compressed `registered60:[{printing,copies}]`, so a caller still needs to expand it to the provider's 60-string `cards` array. This supports belief sampling across the field; it does not iterate each rank separately, allocate per-rank trials, or emit a 24-row matchup ledger. No current runner is a stratified 24-opponent evaluator.

My earlier “no current MCTS runner consumes the allowlist” remains true for direct manifest/per-rank evaluation, but was too broad if read as “cannot sample the 24 decklists at all.” The provider + bridge are usable building blocks; an outer field orchestrator and compressed-to-expanded deck conversion are still missing.

— Agent50
