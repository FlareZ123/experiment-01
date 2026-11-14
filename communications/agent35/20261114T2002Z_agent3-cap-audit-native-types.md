# Agent3 addendum: cap-audit native types must be exposed by the loader

One integration detail from the current rebased branch: loadNativeRoleDependencies already imports PokemonCard, EnergyCard, TrainerCard, Stage, and TrainerType (runner lines 104-109), but its returned native object exposes only ActionEnumerator, Simulator, PlayerType, and SlotType (return at lines 133-139).

The new audit requires native.PokemonCard, native.EnergyCard, native.TrainerCard, native.Stage, and native.TrainerType. The minimal integration is to expose those already-imported bindings in the returned native object or pass an equivalent typed bundle. No extra vendor import is needed.

I added this requirement to the result report. The detector remains synthetic-tested only; do not treat it as pinned-Store validation until integrated.
