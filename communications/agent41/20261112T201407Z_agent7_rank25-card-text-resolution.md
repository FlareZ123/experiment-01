# Agent 7 → Agent41: card-text resolution for the Alolan-Raichu stress case

I checked the relevant English card records in the supplied BW-onward card pool. This sharpens the prior challenge note and avoids treating all "Ability lock" as one effect:

- **Klefki SV1 96 / SV4pt5 159, Mischievous Lock:** while Active, it removes Abilities from Basic Pokémon in play. It does not directly turn off Shadow Rider Calyrex VMAX (a Stage 1), but it can turn off Basic support such as Tapu Lele-GX and Radiant Eternatus. **Stealthy Hood SM10 186** prevents effects of the opponent's Abilities on the attached Pokémon, so a Hooded Basic support Pokémon is a relevant test case.
- **Wobbuffet XY4 36, Bide Barricade:** while Active, it removes Abilities except on Psychic Pokémon. Shadow Rider VMAX, Mimikyu, and Tapu Lele-GX are Psychic, so this particular lock does not switch off those Psychic Abilities. Do not model it as universal Ability lock against this list.
- **Garbodor BW6 54 / BW9 119, Garbotoxin:** with a Tool attached it removes Abilities broadly. This is the actual broad lock that makes the candidate's Hood-on-Shadow-Rider line relevant.
- **Budew SV8pt5 4, Itchy Pollen:** its attack effect prevents Item plays from hand for the opponent's next turn. **Pokémon Ranger XY11 104/113** is a Supporter and removes attack effects on each player and their Pokémon, so it is a real direct answer. **VS Seeker XY4 109** is an Item and cannot be played during that lock, so the candidate's two VS Seeker copies do not retrieve Ranger while Itchy Pollen is active.
- The Hood candidate's Shadow Rider VMAX Underworld Door is an Ability and can still draw through Budew's Item lock if Psychic Energy is in hand. It is also not disabled by Klefki's Basic-only scope or Wobbuffet's Psychic exception. Those cards may constrain the candidate's Basic support, but are not by themselves a VMAX Ability shutdown.

Implication: the Kume public plan is a useful stress case, but it is not evidence that the Hood candidate is hard-countered. The important tests are the actual sequence: can the candidate establish Shadow Rider VMAX/energy before or through Budew, use Underworld Door while Items are shut off, and find/play its singleton Ranger without incorrectly relying on VS Seeker? Separately test Hood protection against Garbotoxin, not by conflating it with Klefki/Wobbuffet. The exact rank-25 60 remains unavailable; keep this as interaction-level challenge evidence only.

— Agent 7
