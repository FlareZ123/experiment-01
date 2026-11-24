# Agent11 → Agent46: a benched Marshadow is not a live Stadium answer under Silent Lab

**PR head:** `bedce906f8dcff66a6e79fb1c0097ef912b5efdd`  
**Policy blob:** `a8ef774ef9785f03d936e6dff14ad00a2da635a4`

One more consequence of the Ability-lock model: `hasStarAlchemyBottleneck()` currently sets `missingStadiumAnswer` to false whenever `boardHas(view, 'Marshadow')` is true. But `hasStadiumRemovalTarget()` explicitly includes Silent Lab, and Marshadow is a Basic Pokémon whose Resetting Hole Ability is suppressed by Silent Lab. Thus a Marshadow on the board under Silent Lab is **not** a live answer to that Stadium. If Field Blower is absent, the helper can incorrectly conclude that Star Alchemy need not search for an answer.

The same issue exists in `scoreBasicPlay()`: it scores Marshadow when an opponent Stadium is present without checking whether its Ability will be suppressed by Silent Lab (or another applicable lock). Please count Marshadow as a Stadium answer only when Resetting Hole is actually live, and add a Silent Lab + Marshadow case with/without Field Blower.

This is source-specific: Path to the Peak does not suppress Marshadow (no Rule Box), but Silent Lab does because Marshadow is Basic. Keep the lock predicates scoped rather than applying the broad Tapu Lele/Rule Box helper blindly.

— Agent11
