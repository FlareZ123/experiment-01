# Shadow Rider Calyrex VMAX: Underworld Door prompt legality and archive audit

**Agent 1 · 12 November 2026**

## Finding

The pinned Twinleaf implementation of Shadow Rider Calyrex VMAX's Underworld Door prompt does not itself enforce the printed Psychic-only Bench recipient requirement. The card implementation builds a blocked array by iterating player.bench and testing each entry with card instanceof PokemonCard. In the pinned state model, Player.bench is an array of PokemonCardList; PokemonCardList extends CardList, not PokemonCard. The test is false for every Bench slot. The resulting AttachEnergyPrompt receives an empty blocked array and no blockedTo target list.

The prompt API distinguishes source exclusions (options.blocked) from destination exclusions (options.blockedTo). The pinned AttachEnergyPrompt decoder checks the source card and blocked source index but does not independently enforce the destination Pokémon's Psychic type. The raw engine prompt is therefore permissive if used without a card-specific correction.

## Existing research-owned correction

This is not an unaddressed gap in the current Agent34 Shadow Rider policy path. The repository already contains:

- simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs: wraps the matching Underworld Door effect, dynamically checks Bench Pokémon type through CheckPokemonTypeEffect, rejects use when no Psychic Bench target exists, validates the owner-side Basic Psychic Energy and recipient in Prompt.validate, and also validates the actual Store callback. The callback guard matters because Store.reducePrompt does not itself call Prompt.validate.
- simulation/twinleaf/agent34-actor-typed-energy-prompt.cjs: a source-stamped, owner-only typed prompt continuation that selects a Basic Psychic Energy from the owner's hand and an eligible Psychic Bench recipient.
- tests/agent34-actor-typed-energy-prompt.native.test.cjs: an existing compiled-engine native test of the positive path across both physical seats.

The actor-only root policy does have a dedicated Underworld Door prompt continuation. My earlier message suggesting it fell through to the generic resolver was incorrect. I removed my duplicate hook implementation rather than retain parallel logic.

The existing hook enforces legality in validation and the Store callback, but does not populate blockedTo for presentation. Invalid targets may remain visible in the prompt UI, while being rejected before game-state settlement. That is a possible UX improvement, not a gap in the current callback legality guard.

## Added negative native regression

I added tests/2026-11/agent1-underworld-door-existing-hook-negative.test.cjs. It uses the existing Agent34 hook and a real compiled Twinleaf Store to test:
1. a non-Psychic Bench recipient is rejected by prompt validation and by native Store dispatch, with no Energy transfer or draw;
2. Underworld Door is refused when the source is active and the owner has no Psychic Bench recipient;
3. both physical seats are covered for the illegal-recipient case.

The new regression is included in the existing manual-only .github/workflows/twinleaf-smoke.yml step 13. It does not create a new workflow or modify vendor code.

## Recipient-priority ablation remains untested

The same archive's ownerUnderworldPromptAudit reports 0 prioritizedTargetProposals and 0 prioritizedTargetNativeAccepted in both arms. Thus all 304 prompts used the default source-Bench-index preference and stable index order; the optional publicAttackGapRecipient flag was not enabled. The existing simulation/twinleaf/agent34-owner-psychic-bench-recipient.cjs ranker is unit-tested, but these 116 games provide no native evidence for or against it.

A useful next experiment is a paired native ablation with the same fixed 60-card list, opponent policy, seeds, and field: publicAttackGapRecipient off versus on. Report per-opponent outcomes and recipient-priority counts, not just an aggregate. Treat the attack-gap ranker as a heuristic until this comparison is run; it only models a conservative subset of Psychic/Colorless attack costs and unknown energy/attack structures receive low priority.

## Historical archive audit

I audited the existing GitHub Actions artifact from run 42578010606, artifact 13656062292 (agent3-hood-vs-shadow-all29-native.zip). It contains two actualNativeRuns of 58 rows each (116 games total): champion-reference and hood-shield-v1.

For each row, Underworld Door UseAbilityAction entries in rootActionLedger were joined to AttachEnergyPrompt resolutions in nativeAcceptedEnergyPromptSidecar by player seat and turn. The Agent34 owner-typed prompt audit independently records the same accepted continuation counts:

| Arm | Underworld Door roots | Matched prompts | Proposals | Native accepted | Rejected | No candidate | Delegated |
|---|---:|---:|---:|---:|---:|---:|---:|
| champion-reference (58 games) | 142 | 142 | 142 | 142 | 0 | 0 | 0 |
| hood-shield-v1 (58 games) | 162 | 162 | 162 | 162 | 0 | 0 | 0 |
| **Total** | **304** | **304** | **304** | **304** | **0** | **0** | **0** |

Every observed recipient printing was Psychic in the repository card pool:

- champion-reference candidate side, 132 uses: Shadow Rider Calyrex VMAX CRE 75 (82), Lillie's Clefairy ex JTG 56 (12), Girafarig LOT 94 (9), Marshadow UNB 81 (10), Latias ex SSP 76 (6), Mimikyu GRI 58 (5), Trevenant & Dusknoir-GX SMP SM217 (8).
- champion-reference opponent side, 10 uses: Shadow Rider Calyrex VMAX CRE 75 (8), Girafarig LOT 94 (2).
- hood-shield-v1 candidate side, 156 uses: Shadow Rider Calyrex VMAX CRE 75 (104), Lillie's Clefairy ex JTG 56 (22), Girafarig LOT 94 (12), Marshadow UNB 81 (10), Latias ex SSP 76 (6), Tapu Lele-GX GRI 60 (2).
- hood-shield-v1 opponent side, 6 uses: Shadow Rider Calyrex VMAX CRE 75 (4), Girafarig LOT 94 (2).

**Zero illegal Underworld Door recipients were observed in this 116-game archive.** The source-stamped owner-typed continuation handled all 304 prompts, with zero delegations or rejections, and the public board deltas show only Psychic recipients. The raw engine prompt remains permissive without the existing hook, but the archived policy happened to choose legal recipients in every observed use. This defect is therefore not a reason to discard or retroactively invalidate this archive. Retain it as pre-correction evidence; keep the existing hook enabled for future Shadow Rider execution.

This audit does not change the archive's existing non-qualification status or establish competitive strength.

## Reproducibility and limitations

- Twinleaf repository: twinleafgg/twinleafgg
- Pinned submodule commit: a9905a76a6c4103ba4b6cb9a49e86bad795c5c05
- Upstream card implementation: ptcg-server/src/sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-vmax.ts
- Prompt implementation: ptcg-server/src/game/store/prompts/attach-energy-prompt.ts
- Prompt UI: ptcg-play-react/src/table/prompts/AttachEnergyPromptPanel.tsx
- State types: ptcg-server/src/game/store/state/player.ts and pokemon-card-list.ts
- Existing correction and typed continuation: simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs and agent34-actor-typed-energy-prompt.cjs
- New negative regression: tests/2026-11/agent1-underworld-door-existing-hook-negative.test.cjs

The new negative regression has not yet been executed in CI in this invocation; no passing run is claimed. No vendor code was modified, and no historical game archive was rewritten. No deck promotion or competitive win-rate inference follows from this finding.
