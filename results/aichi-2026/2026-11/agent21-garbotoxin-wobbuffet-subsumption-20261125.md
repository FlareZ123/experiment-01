# Agent21 — Bide Barricade is redundant during Tool-live Garbotoxin

**Date:** 25 November 2026  
**Decision relevance:** Lockbridge vs Hood Shield; allocation of the two Stealthy Hood copies in the Lockbridge 60.  
**Evidence class:** exact card-text / source-list derivation. No game or simulator result.

## Finding

The proposed line of attaching one Stealthy Hood to Wobbuffet and one to Shadow Rider Calyrex VMAX is unnecessarily spending a Tool to preserve Bide Barricade against Tool-live Garbodor.

For the four authenticated Aichi Garbodor lists (ranks 8, 11, 16, and 22), the Garbodor printings are Psychic and have Garbotoxin. When Garbotoxin is active, its effect already suppresses **every Pokémon Ability except Garbotoxin**. Bide Barricade suppresses only Abilities of **non-Psychic Pokémon**. Because each Aichi Garbodor is Psychic and is exempt from Bide Barricade, Bide Barricade's entire suppression target set is already contained in Garbotoxin's target set.

Therefore, even if Stealthy Hood protects Wobbuffet from Garbotoxin and leaves Bide Barricade active, Bide Barricade adds no further Ability suppression while Garbotoxin remains Tool-live. It does not suppress the Psychic Garbodor, and every non-Psychic target it would suppress is already suppressed by Garbotoxin.

This is a material qualification to the proposed “Hooded Wobbuffet + Hooded VMAX” Garbodor line: **the Hood on Wobbuffet is not needed merely to preserve the Ability lock.** The Hooded VMAX matters because Garbotoxin suppresses Psychic Shadow Rider VMAX's Underworld Door, while Bide Barricade would not.

## Exact source basis

- **Wobbuffet PHF 36** — card-pool record `resources/cards/en/xy4.json`, ID `xy4-36`. It is Psychic. Bide Barricade applies only while Wobbuffet is Active and says each Pokémon in play, both players' hands, and both discards has no Abilities “except for Psychic Pokémon.”
- **Garbodor LTR 68** — `resources/cards/en/bw11.json`, ID `bw11-68`; **Garbodor BKP 57** — `resources/cards/en/xy9.json`, ID `xy9-57`. Both are Psychic and have the same Garbotoxin condition: while that Garbodor has a Pokémon Tool attached, each Pokémon in play, both players' hands, and both discards has no Abilities “except for Garbotoxin.”
- **Stealthy Hood UNB 186** — `resources/cards/en/sm10.json`, ID `sm10-186`. It prevents effects of the opponent's Abilities done to the attached Pokémon. This can protect a Hooded Wobbuffet from the opponent's Garbotoxin effect, but it does not make Bide Barricade's target set larger.
- **Shadow Rider Calyrex VMAX CRE 75** — `resources/cards/en/swsh6.json`, ID `swsh6-75`, is Psychic and has Underworld Door: each VMAX may once during the turn attach a Psychic Energy from hand to a Benched Psychic Pokémon and, if it does, draw two cards.
- Exact Lockbridge 60: `results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json`, blob `907014e330aae8889fe5869a32dfcdf0d876291a`. It contains 1 Wobbuffet, 4 Shadow Rider Calyrex VMAX, 2 Stealthy Hood, 1 Float Stone, and 1 Forest Seal Stone.

## Set-inclusion argument

Let (B) be the Pokémon affected by Bide Barricade: all non-Psychic Pokémon. Let (G) be the Pokémon affected by Tool-live Garbotoxin: all Pokémon other than the Garbotoxin source. In the authenticated Aichi lists, the Garbotoxin source is Psychic, so it is outside (B). Every Pokémon in (B) is also in (G): (B \subseteq G).

Thus:
1. Garbotoxin already removes every Ability that Bide Barricade would remove.
2. Bide Barricade does not remove Garbotoxin, because the Aichi Garbodor is Psychic.
3. A Hood that preserves Bide Barricade on Wobbuffet does not change the opponent's Ability availability while Garbotoxin remains active.

If the Garbodor loses its Tool, the condition for Garbotoxin ceases to hold. Wobbuffet's own Ability can then function again if Wobbuffet is Active; it does not need a Hood to “reactivate.” This does not mean Wobbuffet is always irrelevant: it is a backup non-Psychic Ability lock when Garbotoxin is not active.

## Tactical consequence for Lockbridge

Against an established Tool-live Garbodor:

- Do not attach a Hood to Wobbuffet solely to preserve Bide Barricade. The preserved effect is redundant in that state.
- Prioritize a Hood on a Shadow Rider VMAX if preserving Underworld Door is important. Two Hoods can instead protect two VMAX engines, provided both have open Tool slots; a VMAX carrying Forest Seal Stone cannot also carry Hood.
- The list's Float Stone can remain available for Wobbuffet. Wobbuffet does not need to stay Active to maintain the suppression that Garbotoxin is already providing. If Garbodor's Tool is removed, decide whether to keep/promote Wobbuffet Active to re-establish Bide Barricade.
- Do not confuse this with protection from Wobbuffet's **own** effect: Stealthy Hood protects against the opponent's Abilities, not your own. While Wobbuffet is Active, its symmetric Bide Barricade still suppresses the Lockbridge player's own non-Psychic Pokémon, including its Dragon-type Radiant Eternatus and Latias ex. Climactic Gate must still be used before Wobbuffet becomes Active if Radiant Eternatus is needed.

This is matchup-specific. A Hood on Wobbuffet may still matter against a different opponent Ability lock that Garbotoxin does not already subsume; it is not justified by the Tool-live Garbodor state alone.

## Field counterplay and limits

All four authenticated Garbodor source lists are ranks 8, 11, 16, and 22. Ranks 8 and 22 each list one Field Blower; ranks 11 and 16 do not list Field Blower, Tool Jammer, or Jamming Tower. This is a list-presence census only: it does not establish access, timing, or whether either Tool will be removed in a game. Field Blower can remove both Hoods in one use, so the two-Hood engine remains vulnerable where that card is available.

**Disposition:** revise the proposed Garbodor line: Hooded VMAX is a real Underworld Door protection hypothesis; Hooded Wobbuffet is not an incremental lock advantage while Garbotoxin is Tool-live. This is a rules/card-text correction, not a matchup result, policy-competence result, or reason to nominate Lockbridge. The exact 60 remains unranked and unqualified.
