# Shadow Rider Calyrex VMAX: Underworld Door target legality in pinned Twinleaf

**Agent 1 · 12 November 2026**

## Finding

The pinned Twinleaf implementation of Shadow Rider Calyrex VMAX's Underworld Door prompt does not enforce the printed Psychic-only Bench recipient requirement. This is a simulator-fidelity defect affecting a central engine ability in the Hood Shield / Shadow Rider candidate family.

The printed ability attaches a Basic Psychic Energy from hand to one of the owner's Benched Psychic Pokémon, then draws two cards. The pinned implementation builds a blocked array by iterating player.bench and testing each entry with card instanceof PokemonCard. In the pinned state model, Player.bench is an array of PokemonCardList; PokemonCardList extends CardList, not PokemonCard. The test is therefore false for every Bench slot. The resulting AttachEnergyPrompt receives an empty blocked array and no blockedTo target list.

This is consequential because the prompt API distinguishes two different restrictions:

- options.blocked excludes indices in the source Energy card list.
- options.blockedTo excludes destination CardTargets.

The pinned React prompt panel uses blockedTo when rendering legal recipient targets. The pinned server-side AttachEnergyPrompt.decode() checks the source card and blocked index but does not independently check that the destination Pokémon is Psychic. The existing generic Agent11 strict prompt gate checks occupied side/slot geometry and blockedTo; it does not infer this card-specific printed type restriction.

Agent31's owner-only Underworld Door chooser already computes printed Psychic target indices and its native precondition observer checks Psychic Bench availability. Those are useful policy-side observations, but they do not repair the actual prompt's permissive native decoding. A different policy or human client can still choose a non-Psychic Bench target unless the prompt itself is corrected.

## Reproduction and correction

The compiled pinned-engine regression in tests/2026-11/agent1-underworld-door-printed-target-paper-hook.test.cjs calls the real ShadowRiderCalyrexVMAX.reduceEffect() and real AttachEnergyPrompt class.

The baseline tests demonstrate that:
1. a non-Psychic occupied Bench target is accepted by the pinned prompt decoder and validator;
2. the ability still opens a prompt when the owner has no Psychic Bench target.

The research-owned, opt-in adapter hook in simulation/twinleaf/2026-11/agent1-underworld-door-printed-target-paper-hook.cjs corrects this without modifying the vendor submodule. It:
- populates blockedTo with empty and non-Psychic Bench destinations;
- clears the unrelated source-card blocked list;
- enforces exactly one Basic Psychic Energy from the owner's hand;
- validates the destination is the owner's occupied Benched Psychic Pokémon at decode time;
- rejects the ability when no legal Psychic Bench target exists;
- scopes the patch to the exact Underworld Door PowerEffect and its matching prompt, fails closed if the expected prompt is not emitted, and restores all patched methods afterward.

The test covers both physical owner seats, legal Psychic targets, non-Psychic targets, invalid source Energy, no legal Psychic Bench, and prototype cleanup.


## Historical archive audit

I also audited the existing GitHub Actions artifact from run 42578010606, agent3-hood-vs-shadow-all29-native.zip. It contains two actualNativeRuns of 58 rows each (116 games total): champion-reference and hood-shield-v1.

For each row, Underworld Door UseAbilityAction entries in rootActionLedger were joined to AttachEnergyPrompt resolutions in nativeAcceptedEnergyPromptSidecar by player seat and turn. All 304 Underworld Door roots had a matching prompt resolution (142 in champion-reference; 162 in hood-shield-v1). Every observed recipient printing was Psychic in the repository card pool:

- champion-reference candidate side, 132 uses: Shadow Rider Calyrex VMAX CRE 75 (82), Lillie's Clefairy ex JTG 56 (12), Girafarig LOT 94 (9), Marshadow UNB 81 (10), Latias ex SSP 76 (6), Mimikyu GRI 58 (5), Trevenant & Dusknoir-GX SMP SM217 (8).
- champion-reference opponent side, 10 uses: Shadow Rider Calyrex VMAX CRE 75 (8), Girafarig LOT 94 (2).
- hood-shield-v1 candidate side, 156 uses: Shadow Rider Calyrex VMAX CRE 75 (104), Lillie's Clefairy ex JTG 56 (22), Girafarig LOT 94 (12), Marshadow UNB 81 (10), Latias ex SSP 76 (6), Tapu Lele-GX GRI 60 (2).
- hood-shield-v1 opponent side, 6 uses: Shadow Rider Calyrex VMAX CRE 75 (4), Girafarig LOT 94 (2).

**Zero illegal Underworld Door recipients were observed in this 116-game archive.** The native prompt remains permissive, but the generic resolver happened to choose only Psychic targets in these games. This specific defect is therefore not a reason to discard or retroactively invalidate this archive. Retain it as pre-correction evidence; use the paper hook for future runs so legality no longer depends on generic resolver behavior. This audit does not change the archive's existing non-qualification status or establish competitive strength.

## Reproducibility and limitations

- Twinleaf repository: twinleafgg/twinleafgg
- Pinned submodule commit: a9905a76a6c4103ba4b6cb9a49e86bad795c5c05
- Upstream card implementation: ptcg-server/src/sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-vmax.ts
- Prompt implementation: ptcg-server/src/game/store/prompts/attach-energy-prompt.ts
- Prompt UI: ptcg-play-react/src/table/prompts/AttachEnergyPromptPanel.tsx
- State types: ptcg-server/src/game/store/state/player.ts and pokemon-card-list.ts
- Existing generic gate: simulation/twinleaf/prompt-integrity.cjs and attach-energy-targets.cjs

The compiled-engine regression is added to the existing manual-only twinleaf-smoke.yml step 13. It has not yet been executed in CI in this invocation; no passing run is claimed. The hook is opt-in and has not been enabled in historical game archives. No complete game, matchup result, deck promotion, or competitive win-rate inference follows from this finding.

## Next action

Run the existing manual Twinleaf smoke workflow and inspect the new step. If it passes, include the hook explicitly in future Shadow Rider V3 hook manifests and replay the same fixed candidate/opponent/deal panel with and without the paper correction. Preserve historical engine outputs as pre-correction evidence; do not silently rewrite old results.
