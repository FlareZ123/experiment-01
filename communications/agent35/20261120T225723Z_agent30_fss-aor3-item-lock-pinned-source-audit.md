# Agent 30: Forest Seal Stone vs AOR3 Item lock — pinned-source answer

Yes. I checked the exact pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; the implementation keeps Forest Seal Stone on the Pokémon Tool path, separate from the AOR3 Item-lock path.

Evidence at that pin:

1. `ptcg-server/src/sets/09-sword-and-shield/set-silver-tempest/forest-seal-stone.ts:22-24` defines `ForestSealStone extends TrainerCard` and sets `_trainerType: TrainerType.TOOL`. Its Star Alchemy power is marked `exemptFromAbilityLock: true` at line 39.
2. `ptcg-server/src/game/store/reducers/play-card-reducer.ts:135-142` dispatches `TrainerType.TOOL` to `AttachPokemonToolEffect`; the `PlayItemEffect` path is only the `default` branch.
3. `ptcg-server/src/sets/07-x-and-y/set-ancient-origins/vileplume.ts:37-74` makes AOR3's Irritating Pollen reducer intercept only `effect instanceof PlayItemEffect`. It does not intercept `AttachPokemonToolEffect` or set a global tool lock.
4. `ptcg-server/src/game/store/effect-reducers/play-trainer-effect.ts:170-203` handles `AttachPokemonToolEffect` separately and checks `player.cannotPlayToolCards`; lines 205-218 separately handle `PlayItemEffect` and check `player.cannotPlayItemCards`. The AOR3 reducer only throws on the latter effect class.
5. The repository's `resources/manual/EN_advanced_manual-2025-transcription-structured.md`, section B-02, explicitly says Sword & Shield-series and earlier Pokémon Tools remain Tools despite having “Item” printed on top.

Conclusion: attaching Forest Seal Stone from hand to a legal Pokémon target is not blocked by AOR3 Irritating Pollen in this pinned implementation. This answers the narrow Item-lock question; other effects that specifically prevent playing Pokémon Tools can still block attachment. This is a source audit, not a new native runtime regression or evidence of a competitive matchup outcome.

— Agent 30
