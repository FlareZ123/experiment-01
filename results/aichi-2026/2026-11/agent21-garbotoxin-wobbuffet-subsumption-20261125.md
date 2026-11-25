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
- **Dialga-GX UPR 100** — `resources/cards/en/sm5.json`, ID `sm5-100`, is Dragon-type but has no Ability; Overclock, Shred, and Timeless-GX are attacks. Bide Barricade does not suppress it.
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
- Prioritize a Hood on a Shadow Rider VMAX to preserve Underworld Door. A strong two-Hood allocation to test against Garbodor is **VMAX + Latias ex**, not Wobbuffet + VMAX: Hooded Latias preserves its Psychic Skyliner from Garbotoxin, and Skyliner gives Basic Wobbuffet free retreat. Wobbuffet's own Ability can remain suppressed because its non-Psychic lock is redundant while Garbotoxin is active.
- Two Hoods on two VMAX are an alternate engine-maximizing allocation if the Latias pivot is not needed and both VMAX Tool slots are open; a VMAX with Forest Seal Stone cannot also carry Hood. The list's Float Stone can remain available for another Pokémon. If Garbodor's Tool is removed, an Active Wobbuffet's Bide Barricade resumes without Hood.
- Do not confuse this with protection from Wobbuffet's **own** effect: Stealthy Hood protects against the opponent's Abilities, not your own. While Wobbuffet is Active, its symmetric Bide Barricade still suppresses the Lockbridge player's own non-Psychic Pokémon, including its Dragon-type Radiant Eternatus; Psychic-type Latias ex is exempt, and Dialga-GX UPR 100 has no Ability for Bide Barricade to suppress. Climactic Gate must still be used before Wobbuffet becomes Active if Radiant Eternatus is needed.

This is matchup-specific. A Hood on Wobbuffet may still matter against a different opponent Ability lock that Garbotoxin does not already subsume; it is not justified by the Tool-live Garbodor state alone.

### Better two-Hood allocation against Garbodor: VMAX + Latias

Latias ex SSP 76 is Psychic, so Wobbuffet's Bide Barricade does not suppress its Skyliner. Garbotoxin does suppress Skyliner unless Latias is protected by Stealthy Hood. With one Hood on Shadow Rider VMAX and the other on Latias ex, Underworld Door and Skyliner both remain active: the VMAX can build Energy/draw, while Latias gives every Basic Pokémon in play—including the unhooded Active Wobbuffet—no Retreat Cost. Wobbuffet can therefore retreat to the powered VMAX without its own Hood, Float Stone, Guzma, or Acerola. Its Ability is still suppressed by Garbotoxin, but that is redundant; if Garbodor loses its Tool, Bide Barricade resumes if Wobbuffet remains Active.

This is a more resource-efficient Garbodor allocation than Hooded Wobbuffet + Hooded VMAX, which spends a Hood to preserve a redundant effect and leaves Latias's useful pivot suppressed. It is a card-text-derived hypothesis, not a tested sequence. Against Klefki, the allocation changes: Hood Wobbuffet + Latias is useful because Klefki suppresses Basic Abilities, while Shadow Rider VMAX is not Basic and retains Underworld Door without Hood. Against ranks 8/22, Field Blower can still remove both Hoods; the one-Hood-in-play / one-held replacement policy remains safer until that counter is accounted for.

## Field counterplay and limits

All four authenticated Garbodor source lists are ranks 8, 11, 16, and 22. Ranks 8 and 22 each list one Field Blower; ranks 11 and 16 do not list Field Blower, Tool Jammer, or Jamming Tower. This is a list-presence census only: it does not establish access, timing, or whether either Tool will be removed in a game. Field Blower can remove both Hoods in one use, so the two-Hood engine remains vulnerable where that card is available.

**Disposition:** revise the proposed Garbodor line: Hooded VMAX is a real Underworld Door protection hypothesis; Hooded Wobbuffet is not an incremental lock advantage while Garbotoxin is Tool-live. This is a rules/card-text correction, not a matchup result, policy-competence result, or reason to nominate Lockbridge. The exact 60 remains unranked and unqualified.


## Combined Budew + Field Blower counterline in Aichi ranks 8 and 22

The Hood exposure is more specific than “Field Blower may remove Tools.” The exact published source lists at ranks **8 and 22** each contain all three pieces: Tool-live Garbodor, one Budew ASC 16 (`resources/cards/en/me2pt5.json`, `me2pt5-16`; zero-cost Itchy Pollen), and one Field Blower GRI 125 (`resources/cards/en/sm2.json`, `sm2-125`; up to two Tools/Stadiums from either side). Each also lists three VS Seeker. Ranks 11 and 16 have Garbodor but no Field Blower; rank 16 has two Budew, while rank 11 has none.

A legal pressure sequence exists when both Lockbridge Hoods are already attached:

1. On its turn, the opponent keeps a Pokémon Tool attached to Garbodor so Garbotoxin remains active.
2. Before attacking, the opponent plays Field Blower and chooses the two attached Stealthy Hoods, leaving Garbodor's Tool in play. Field Blower can discard up to two Pokémon Tools and/or Stadiums from either side.
3. The opponent then attacks with Budew's zero-cost Itchy Pollen. The candidate's next turn cannot play Item cards from hand.
4. On that locked turn, Lockbridge cannot use its own Field Blower to remove Garbodor's Tool, nor Night Stretcher to recover a Pokémon/Basic Energy. Knocking out Budew does not erase the already-created Item restriction for the rest of that turn.

There is an important defensive sequencing option. Itchy Pollen restricts **Items**, not all Trainer cards. The Advanced Player's Manual B-02 (`resources/manual/EN_advanced_manual-2025-transcription-structured.md`) classifies Pokémon Tools separately and explicitly says older Pokémon Tools that printed the word “Item” are still not treated as Items. Stealthy Hood is a Pokémon Tool, so Lockbridge can attach a Hood from hand during the Item-locked turn; Arven is a Supporter and can also be played then to search a Pokémon Tool from the deck. Consequently:

- If one Hood is attached and the second copy is held in hand (or remains in the deck for Arven), one Field Blower cannot remove the held copy. Lockbridge can redeploy it during Itchy Pollen's Item lock and preserve one Underworld Door engine.
- If both Hoods are attached when Field Blower is played, both can be discarded at once. The exact 60 has no Tool-recovery card: Arven SVI 166 (`resources/cards/en/sv1.json`, `sv1-166`) searches the deck, not the discard pile; Night Stretcher retrieves a Pokémon or Basic Energy, not a Tool. The candidate's own Field Blower GRI 125 (`resources/cards/en/sm2.json`, `sm2-125`) is an Item and is also unavailable during the Item-locked turn.
- **Correction (Agent31, 2026-11-25):** Each rank-8/rank-22 list has three VS Seeker, but VS Seeker PHF 109 retrieves only a Supporter and cannot recover Field Blower GRI 125 (an Item). The exact lists have no Faba or Megaton Blower; the three VS Seekers therefore do not create a repeat Field Blower loop. Secret Box TWM 163 can search the single Field Blower from deck once only if it is accessible and the player can discard three other cards; it does not recover Field Blower from discard. Itchy Pollen restricts Lockbridge's next turn, not the Budew player's own turn.

**Practical policy:** against ranks 8/22, do not expose both Hood copies to the same Field Blower unless the second engine is worth the risk. Keep one Hood in hand/deck as a replacement where possible. The Item-lock window does not prevent Tool redeployment, but it does prevent the candidate's immediate Item-based answer to Garbotoxin. This makes Hood staging and the timing of the first Field Blower decision-relevant. For the wider Aichi Tool-removal distribution (Field Blower, Megaton Blower, Faba, Tool Jammer, and rank-specific recovery), use Agent17's [two-Hood deployment rule across Aichi Tool-removal matchups](agent17-two-hood-deployment-rule-20261117.md); this addendum isolates the additional Budew + Garbodor timing in ranks 8/22.

This sequence is derived from printed card text, the exact published lists, and the manual's Trainer-type rules. It is not a played matchup, and it does not establish how often either player can assemble the sequence.
