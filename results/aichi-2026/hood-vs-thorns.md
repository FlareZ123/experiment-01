# Positional Stealthy Hood counter to Iron Thorns Initialization (Agent 11)

**Scope:** preliminary rules and source-list analysis as of 15 October 2026, pending a concrete Twinleaf game-state regression. No win rate is inferred.

## Exact interaction and its limitations

Official [Iron Thorns ex TWM 77](https://asia.pokemon-card.com/hk-en/card-search/detail/17531/) says its **Initialization** Ability removes the Abilities of Pokémon with a Rule Box while Iron Thorns ex is Active, excluding Future Pokémon.

**Stealthy Hood UNB 186** states, "Prevent all effects of your opponent's Abilities done to the Pokémon this card is attached to. Remove any such existing effects." Source: the included card JSON `sm10-186`, and [Bulbapedia printing](https://bulbapedia.bulbagarden.net/wiki/Stealthy_Hood_%28Unbroken_Bonds_186%29). **Shadow Rider Calyrex VMAX CRE 75** has Underworld Door, an Ability that attaches a Psychic Energy from hand to a Benched Psychic Pokémon and draws two ([official card database](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/swsh6/205)).

**Conditional rules-level result:** if Stealthy Hood is attached to the Shadow Rider VMAX, is functioning, and the only Ability suppression is the *opponent's* Active Iron Thorns Initialization, the Hood should protect that Pokémon's Underworld Door. This is backed unusually strongly by the pinned Twinleaf code: [Iron Thorns implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-twilight-masquerade/iron-thorns-ex.ts) explicitly uses `CAN_APPLY_LOCK_TO_TARGET` with the comment "Probe EffectOfAbilityEffect so Stealthy Hood / similar can keep Abilities visible and usable on the protected Pokémon", and [Hood implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-unbroken-bonds/stealthy-hood.ts) calls `PREVENT_EFFECTS_OF_OPPONENTS_ABILITIES` if the Tool is active. Both remain subject to actual runtime testing; an implementation comment does not prove gameplay works.

**Tool Jammer BST 136** says that, while attached to the Active Pokémon, it disables Tools attached to the **opponent's Active Pokémon**. Therefore, even when a Tool Jammer is active on Iron Thorns, a Stealthy Hood attached to a **Benched** Shadow Rider VMAX is outside its stated suppression scope. If that Shadow Rider becomes Active, Tool Jammer can disable its Hood. Official [2022 Pokémon article](https://www.pokemon.com/us/strategy/origin-forme-palkia-vstar-deck-strategy) describes Tool Jammer's role and the bundled `swsh5-136` card has its exact positional text.

This is a potentially important Bench-positioning counter-ALS. It also introduces a strict one-Tool-per-Pokémon tradeoff: the Hood-protected Pokémon cannot simultaneously hold Forest Seal Stone or Float Stone, consistent with the advanced rulebook's section B-02. The Shadow Rider VMAX must actually be in play, evolve legally and have valid Energy targets.

## Published Aichi 2026 list evidence

The verified [29-list source manifest](full-decklists.json) contains:

| Placement | Opponent | Tool Jammer | Faba | Megaton Blower | Guzma | VS Seeker |
| ---: | --- | ---: | ---: | ---: | ---: | ---: |
| 6 | Iron Thorns | 1 | 1 | 1 | 3 | 3 |
| 24 | Iron Thorns | 1 | 1 | 1 | 2 | 3 |
| 29 | Iron Thorns | 1 | 1 | 1 | 3 | 3 |

All three also have 2 Lusamine, 2 Tag Call, and 2 Guzma & Hala; rank 29 additionally has 1 Field Blower. **Faba** can Lost Zone the opposing Tool (bundled `sm8-173`); **Megaton Blower** removes all opposing attached Tools at once ([official card text](https://asia.pokemon-card.com/sg/card-search/detail/16747/)). Both are more generally relevant to Benched Hood than Tool Jammer; Faba may also be reused through VS Seeker and Lusamine, with Supporter contention and timing costs. Guzma may promote the protected VMAX, exposing it to Active-only Tool Jammer. Exact policy and board constraints remain essential.

The champion [rank-1 Shadow Rider deck](benchmark-shadow-rider.md) plays **zero Stealthy Hood**, 1 Float Stone, 1 Forest Seal Stone, and has **no Tag Call, Guzma & Hala or Adventure Bag**. An unchanged champion list therefore cannot directly execute the Hood line. Introducing a robust Hood package requires specific cuts and access support rather than a casual assumed counter.

Stealthy Hood already appears in the same Top 32 source field: rank 2 Vileplume Control (3), rank 3 Snorlax Stall (1), rank 15 Lopunny Vileplume (2), rank 32 Regidrago (1). This is deployment evidence only; it does not establish how often it was used, on which Pokémon, or whether it addressed Iron Thorns.

## Critical experiments before promoting as a candidate

1. In a minimal valid Twinleaf state, give player A an Active Iron Thorns ex. Player B has a Benched Shadow Rider VMAX with and without Hood. Query CheckPokemonPowersEffect and activate Underworld Door with a Psychic Energy and legal Benched target. Compare available powers, attached Energy, draw and turn state.
2. Add Tool Jammer attached to Active Iron Thorns. Repeat first with Hood on Benched VMAX, then with Hood on **Active** VMAX. Ensure only the Active protected Pokémon loses the Hood's effect.
3. Apply Faba and Megaton Blower in separate cases; verify immediate loss of Hood protection, and recovery on subsequent reattachment if legal.
4. Test Hood on Shadow Rider V before evolution, preservation after evolution, and one-Tool contention against Float Stone / Forest Seal Stone.
5. Only then compare a purpose-built legal 60-card response deck (including its access costs) against all 29 published opponents with competent policies and both seats.

**Evidence classification:** direct card-text rule reasoning, source-deck exact-card counts, pinned-engine source inspection. No state-level test of this exact combination has been executed here, and no win probability is estimated.
