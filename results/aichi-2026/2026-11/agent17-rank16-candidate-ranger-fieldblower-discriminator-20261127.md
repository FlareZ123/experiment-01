# Rank 16 candidate discriminator: Ranger → Field Blower breaks Budew/Garbotoxin

Agent17 · 2026-11-27. **Decision affected:** Hood Shield vs Lockbridge fixed-60 ranking. Exact-list/card-text state analysis; not a game or matchup result.

## Why rank16 separates the profiles

Rank16 can establish:

- **Budew ASC 16 / Itchy Pollen:** zero-Energy attack; during the opponent's next turn they cannot play Item cards from hand.
- **Psychic Garbodor LTR 68 / BKP 57 / Garbotoxin:** while a Tool is attached, Pokémon in play/hand/discard have no Abilities except Garbotoxin.

The candidate delta is:

- **Hood Shield:** Pokémon Ranger ×1; no Wobbuffet/Temple.
- **Lockbridge:** Wobbuffet ×1 + Temple of Sinnoh ×1; no Ranger.
- Both: Field Blower ×1, Stealthy Hood ×2.

Rank16 uses seven Basic Darkness Energy only, so Lockbridge's Temple has no direct Energy-denial value in this matchup.

## Lockbridge's Wobbuffet does not directly answer the dual lock

Active Wobbuffet slows rank16's non-Psychic setup Ability Pokémon (Crobat V, Dedenne-GX, Squawkabilly ex), but it does **not** disable the structural lock once present:

- Itchy Pollen is an **attack**, not an Ability.
- The rank16 Garbodor printings are Psychic; Bide Barricade explicitly exempts Psychic Pokémon, so Garbotoxin remains live.

Thus “we have Wobbuffet” must not be scored as a direct answer to rank16's Budew + Garbotoxin board. Its value is earlier setup friction only.

## Hood Shield's source-native one-turn escape

If the candidate begins its affected turn with **Pokémon Ranger already accessible as a Supporter**, Ranger removes the effect of Paralyzing/locking attacks on the player. It therefore removes Itchy Pollen's Item-play prohibition.

After Ranger resolves, the same turn can play **Field Blower** to discard the Tool enabling Garbotoxin. With one live Tool-bearing Garbodor this gives a deterministic paper sequence:

`Pokémon Ranger → Item lock removed → Field Blower Garbodor Tool → Garbotoxin off`

The sequence removes the two different lock layers in the required order. Field Blower cannot be the first action because Itchy Pollen blocks Items; Ranger is a Supporter and remains playable through Item lock.

With two Tool-bearing Garbodor, one Field Blower can discard both Tools. With three independently Tool-bearing Garbodor, the singleton Field Blower is insufficient by itself.

## Availability caveats

This is not “Hood always escapes”:

- Ranger and Field Blower must actually be available; under Item lock, VS Seeker/Fog/Quick Ball cannot newly access pieces.
- Garbotoxin can suppress Wonder Tag and Forest Seal Stone before they search Ranger/Blower.
- Ranger consumes the turn's Supporter.
- Rank16 can re-establish locks on later turns.
- A full Bench, attack pressure or a second/third Garbodor can make another line preferable.

Both candidates also have **Stealthy Hood ×2**. Under the current rules, Pokémon Tools are a separate Trainer type, not Items, including older Tool cards that once printed “Item” at the top. Therefore Itchy Pollen's Item lock does not itself prohibit playing Stealthy Hood. A Hooded candidate Pokémon can be protected from Garbotoxin's Ability effect, giving both profiles a partial Ability-lock escape even before Ranger. This does not remove the player-level Item lock.

## Matched two-profile challenges

1. **Single-Garbodor dual lock; Ranger + Blower in hand.** Hood should execute Ranger → Blower when restoring Items/Abilities outweighs a competing Supporter. Lockbridge has no identical route.
2. **Two Tool-bearing Garbodor; Ranger + Blower in hand.** Hood can remove both Tools after Ranger; verify exact two-target selection.
3. **Three Tool-bearing Garbodor.** Do not overclaim Field Blower clears all Garbotoxin sources.
4. **Ranger absent.** Hood must not assume Item-based search for Ranger through Itchy Pollen; test Stealthy Hood/attack-through alternatives instead.
5. **Wobbuffet pre-lock.** Give Lockbridge credit only for suppressing rank16's non-Psychic setup Abilities, not for suppressing Psychic Garbotoxin or the Budew attack.
6. **Temple neutral.** Do not assign rank16 Energy-denial value to Temple against seven Basic Darkness Energy.

## Decision implication

Rank16 structurally favors Hood's **post-lock removal tool** more directly than rank22 does: Wobbuffet cannot preempt Budew's zero-Energy attack or Psychic Garbotoxin, whereas Ranger can unlock the candidate's own Field Blower once Itchy Pollen has landed.

That is a candidate-ranking hypothesis requiring paired policy/full-game evidence, not a demonstrated matchup edge. No candidate 60 was changed.


## Exact Prize-only capacity comparison

The two candidate answers also have different raw Prize exposure before either policy or matchup frequency is considered.

For Hood Shield's one-turn `Ranger → Field Blower` escape, both singleton Trainers must be outside the six Prizes if no Prize has yet been taken and no alternative removal line substitutes for one of them. With two distinct specified singleton cards in a 60-card deck:

[
P(\text{Ranger and Blower both unprized})
= \frac{\binom{58}{6}}{\binom{60}{6}}
= \frac{477}{590}
\approx 80.8475\%.
]

So the raw probability that **at least one of those two exact Trainers is Prized** is **19.1525%**. This is a capacity screen, not a loss rate: later Prize-taking, other lines, or not needing both pieces can erase the consequence.

Lockbridge's preventive card is one singleton Basic Psychic Pokémon, Wobbuffet. If Wobbuffet itself is Prized, the list's singleton Hisuian Heavy Ball can in principle recover it. Under the optimistic Prize-only capacity model where Heavy Ball is usable before the relevant lock window, the only six-Prize configuration that removes both the Wobbuffet and its direct Prize-recovery card is the event that both specified singletons are Prized:

[
P(\text{Wobbuffet and Heavy Ball both Prized})
= \frac{6}{60}\frac{5}{59}
= \frac{1}{118}
\approx 0.8475\%.
]

Equivalently, at least one of `Wobbuffet in ordinary zones` or `Heavy Ball available to recover a Prized Wobbuffet` survives the Prize layout in **99.1525%** of six-Prize configurations.

This is intentionally optimistic for Lockbridge: Hisuian Heavy Ball is an Item, so an already-active Itchy Pollen lock can make a Prized Wobbuffet temporarily unrecoverable even when Heavy Ball itself is not Prized. Conversely, Hood's 19.1525% figure is pessimistic if only one piece is needed, if a Tool/Ability-protected alternative line exists, or if either singleton is taken from Prizes before the escape turn.

The quantitative conclusion is therefore narrower than a matchup ranking: **Lockbridge's preventive Wobbuffet axis is substantially less exposed to opening Prize placement than Hood's exact two-Trainer Ranger→Blower escape axis, but timing under Item lock can nullify that recovery advantage.**
