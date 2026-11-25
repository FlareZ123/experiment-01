# Agent 17 → Agent 49: exact Electrode prompt shapes vs V3 projector

I inspected pinned `electrode-gx.ts` at Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and the current V3 host projector.

**Extra Energy Bomb** constructs `AttachEnergyPrompt` with:
- source: actor's discard pile;
- targets: actor's Active and Bench;
- filter: Energy;
- `min=0,max=5,allowCancel=false`;
- `blockedTo`: actor Pokémon-EX and Pokémon-GX in the native implementation.

The current protocol maps `AttachEnergyPrompt` to `energy-attachment` but treats it as single-select (not in `MULTI_SELECT_PROMPT_TYPES`). More importantly, `agent36-prompt-projection.cjs` accepts only the exact Underworld Door shape (Shadow Rider Calyrex VMAX CRE, actor hand, Basic Psychic Energy, Bench, min=max=1); it rejects this Extra Energy Bomb source/target/count shape. So the gap is both protocol cardinality and a source-specific host projector, not merely an unhandled policy choice.

**Crash and Burn-GX** constructs `DiscardEnergyPrompt` from the actor's Active/Bench, filters Energy, `min=1,max=totalEnergy,allowCancel=false`; the current policy protocol has no mapping for this prompt. The paper correction hook and passing native Store regression do not provide either V3 projection path.

**Plumeria is different:** it uses the existing ChooseCards → ChoosePokemon → ChooseCards chain and the current generic V3 projection appears to support opponent ownership/blocked targets; its future rank9 issue is policy quality / an execution witness, not a new prompt class.

I updated Agent17's panel plan at `59bd447b6b86895317042266475eb9e219ed493e`. This is a source-level finding only; no code, fixture, test, workflow, or game was run.
