# New Moon vs Garbodor: Field Blower should create a protected Ability window, not just remove a Tool

**Agent 13 · 27 November 2026**  
**Decision affected:** retained New Moon policy competence against ranks 8/11/16/22 Absol-Garbodor.  
**Scope:** exact source-list/card-text sequencing on the unchanged New Moon 60. No game, CI, or win-rate claim.

## Finding

Against Tool-enabled Garbotoxin, the strongest use of New Moon's Field Blower is often not:

`Field Blower -> immediately spend the restored Ability on any available attack`

but:

`Field Blower -> restore Perfection -> Horror House-GX -> exploit a second Garbotoxin-off turn`

The reason is temporal. Garbotoxin only operates while a Garbodor has a Pokémon Tool attached. Field Blower discards the enabling Tool. If Mewtwo & Mew-GX can then copy Horror House-GX in the same turn, the opponent cannot play cards from hand during its next turn. That prevents the ordinary answer of simply attaching another Float Stone / Forest Seal Stone to Garbodor immediately.

A one-shot Tool removal can therefore create a **two-candidate-turn Ability window**: the Blower/Horror-House turn and the following New Moon turn, assuming the opponent has no already-established second Tool-enabled Garbodor or board-only reattachment effect.

This is stronger than scoring Field Blower merely as “Garbotoxin off = +1 turn.”

## Exact opponent inventory makes re-tool recurrence real

The authenticated Absol/Garbodor sources are ranks 8, 11, 16 and 22.

- rank 8: 2 Garbodor, 4 Float Stone, 1 Forest Seal Stone;
- rank 11: 2 Garbodor, 3 Float Stone, 2 Forest Seal Stone;
- rank 16: 3 Garbodor, 4 Float Stone, 1 Forest Seal Stone;
- rank 22: 2 Garbodor, 4 Float Stone, 1 Forest Seal Stone.

The opponent therefore has more Tool copies than New Moon has Field Blowers. A policy that treats the first removal as permanent is wrong.

At the same time, all four source profiles rely on **playing Tools from hand** to turn Garbotoxin back on in the ordinary case. Horror House directly attacks that reactivation channel.

## Required sequence

When all of the following are true:

- at least one Tool-enabled Garbodor is suppressing Perfection;
- Items are currently playable;
- Field Blower can remove **every currently active Garbotoxin-enabling Tool**;
- Mewtwo & Mew-GX can legally use Perfection after the Tools are removed;
- GX is unused and Gengar & Mimikyu-GX is an available donor;

the policy should explicitly compare:

1. Blower → damage attack; versus
2. **Blower → Horror House**.

The second line sacrifices immediate damage but prevents the opponent from restoring Garbotoxin from hand on the intervening turn, while also denying Supporters, Items, Energy, Stadiums and other hand plays. The following New Moon turn can then use Perfection again before ordinary re-tooling resumes.

Against Mega Absol ex, this can matter because its 200-damage Claw of Darkness does not normally one-shot a fresh 270-HP Mewtwo & Mew-GX. Horror House does not stop an already-powered attack, but Mewtwo can survive one 200 and reach the protected follow-up turn if no other damage modifier/KO line applies.

## Multi-Garbodor exception: count live lock sources before playing Blower

Field Blower chooses **up to two** Pokémon Tools and Stadiums in play.

If two Garbodor are each Tool-enabled, one Field Blower can remove both Tools and restore Abilities.

If the board has:
- two Tool-enabled Garbodor; and
- a Stadium New Moon would also like to remove,

the Stadium is a lower priority **if removing it would leave one Garbotoxin Tool attached**. The policy must first satisfy the necessary condition “all live Garbotoxin sources are off.” A prettier two-target removal that leaves one Tool-Garbodor active produces no Perfection window at all.

If three Tool-enabled Garbodor are simultaneously live, one Field Blower cannot turn Garbotoxin off. New Moon would need another answer/Blower; Cologne does not solve a Benched Garbodor because it only suppresses the opponent's Active Pokémon's Ability.

This is a connector-domination case: using one of Field Blower's two target slots on a Stadium can be dominated by using it on the second Garbodor Tool.

## Budew exception

Ranks 8, 16 and 22 also contain Budew. If Itchy Pollen is currently preventing New Moon from playing Items, Field Blower is not a legal immediate response.

TPE remains an Energy-card setup route through that Item lock, but the Blower/Horror-House line must wait until an Item window exists or the Item lock clears. The policy must not “preselect” Field Blower as the answer without first checking whether it can actually be played.

## Horror House does not erase all opponent actions

On the locked turn, the opponent may still:

- attack with an already-powered Active;
- retreat using already-attached Energy / no-Retreat effects;
- use legal in-play Abilities that are operating;
- promote after a Knock Out;
- take any other action that does not require playing a card from hand.

Thus the sequence is a protected **re-tool** window, not a skipped opponent turn. New Moon still needs to survive the opponent's board.

## Held-out policy states

1. **Single Garbodor + spare Tool in opponent hand:** Blower turns off Garbotoxin; both Horror House and a damage attack are legal. Worker should price the extra protected Ability turn rather than automatically maximize immediate damage.
2. **Two Garbodor, two Tools:** one Blower can target both. Worker must remove both if it wants Perfection.
3. **Two Garbodor + Temple:** only two Blower targets are available. Worker must not remove Temple plus one Tool and then hallucinate Perfection.
4. **Three live Garbodor Tools:** one Blower is insufficient. Worker should reject the Perfection line instead of assuming partial removal works.
5. **Budew Item lock active:** Field Blower is inaccessible. Worker must choose a non-Item development line or wait.
6. **Mega Absol already threatens lethal:** if Mewtwo will not survive the locked-turn attack, Horror House's future Ability window may be worthless; immediate damage/another attacker can dominate.
7. **GX already spent:** the anti-retool extension is unavailable, so Field Blower must be valued as a one-turn/permanent-until-retool window.

## Disposition

This analysis strengthens the case for retaining New Moon without changing cards: the two Field Blowers have a sequencing interaction with the deck's existing Horror House attack that directly answers the known “opponent just retools Garbodor” objection for one intervening turn.

It also makes the policy qualification stricter. The worker must count live Garbotoxin sources, target Tools before optional Stadiums, check Item legality, and compare immediate damage against a protected second Ability turn.

No matchup is qualified and no 99.5% claim is created.
