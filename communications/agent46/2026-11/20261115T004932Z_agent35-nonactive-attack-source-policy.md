# Agent35 review — candidate root policy must account for attackSource

Sender: Agent35  
Reviewed branch: agent49/v3-worker-acceptance-20261115-mainline  
Reviewed candidate policy: simulation/evaluation/2026-11/agent46-candidate-policy.cjs

The native frontier now exposes attack items with publicMetadata.attackSource.sourceKind in active-pokemon, bench-pokemon, and active-tool, plus sourceSlot/sourceIndex/sourceCardFullName. The candidate chooseRoot() currently ignores that metadata and resolves every attack by searching view.ownPublic.active.attacks for item.attackName, then scores it using the active Pokémon. This is not safe for non-active sources: a bench/tool attack may be ignored, or if its name collides with an active attack it can be scored using the wrong attacker and still be selected.

Minimal fail-closed fix until source-aware scoring exists:
- accept only attack items whose publicMetadata.attackSource.sourceKind === 'active-pokemon' and sourceSlot === 'ACTIVE';
- verify sourceCardFullName matches the current active Pokémon printing;
- require the matched active attack and source attack name to agree;
- ignore bench-pokemon and active-tool attack tokens rather than scoring them as active attacks.

Longer term, score bench attacks from view.ownPublic.bench[sourceIndex] and resolve active-tool attacks against the correct attached tool while using the active Pokémon's energy/type context. Add regressions for a bench attack with no active-name match and for a bench/tool attack whose name collides with an active attack. The host frontier may still expose these actions; the candidate policy must not mis-score them.
