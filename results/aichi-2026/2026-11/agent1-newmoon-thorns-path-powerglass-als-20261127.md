# New Moon vs Iron Thorns: asymmetric Path + Powerglass native-Gengar ALS

**Agent 1 · 27 November 2026**
**Scope:** exact ranks 6, 24 and 29 Iron Thorns source inventories; unchanged New Moon 60; paper line analysis only.

## Source fact that simplifies the state

All three authenticated Iron Thorns lists contain exactly four Pokémon, all **Iron Thorns ex**.

None contains an in-play Marshadow or other Pokémon Ability that can remove a Stadium from the board during Horror House.

Their Stadium/Field-Blower/Faba-style answers are cards that must be played from hand. Horror House blocks those hand plays for the locked turn.

## Core line when New Moon goes second

Assume:

- fresh native Gengar & Mimikyu-GX can become the attacker with full 240 HP;
- GX is unused;
- TPE is available for the normal Energy attachment;
- enough Bench space exists for Solrock + Lunatone;
- Path is available;
- Powerglass can be attached to Gengar;
- a Basic Psychic can be put into discard before the attack (Battle Compressor is the cleanest route).

Sequence:

1. **Battle Compressor** a Basic Psychic to discard when doing so does not destroy another needed line.
2. Attach **TPE** from hand to native Gengar.
3. TPE puts **Solrock + Lunatone** from deck onto the Bench.
4. Iron Thorns Initialization does not suppress either pair member because they have no Rule Box.
5. Play **Path to the Peak**.
6. Lunatone New Moon, enabled by Solrock, prevents the Stadium effect from applying to candidate Pokémon.
7. Opposing Iron Thorns is not protected, so Path removes **Initialization**.
8. Attach **Powerglass** to native Gengar.
9. Use **Horror House-GX** for one Psychic.
10. After the attack, Powerglass may attach the discarded **Basic Psychic** to the Active Gengar.

At the end of the candidate turn, Gengar has two Psychic-providing Energy and Path remains active.

## Opponent locked turn

During the source's next turn:

- it draws normally;
- it cannot play Energy, Supporters, Items, Tools or Stadiums from hand;
- it can use existing board actions, including retreat and a currently funded Volt Cyclone.

Volt Cyclone does **140**.

A fresh 240-HP Gengar survives one clean 140-damage hit with 100 HP remaining.

Because the exact source board contains only Iron Thorns, there is no published in-play Stadium-removal Ability. Hand-based Path answers remain locked for this turn.

## Candidate follow-up

On New Moon's next turn:

- Path is still in play unless an actual board-only effect changed it;
- opposing Initialization remains suppressed;
- candidate Rule-Box Abilities remain protected by New Moon;
- native Gengar already has the two Psychic needed for **Poltergeist**;
- Mewtwo Perfection is also restored if Mewtwo is in play and another legal attack line is stronger.

Poltergeist must still obey actor-visible hand uncertainty. Iron Thorns has 230 HP, so:

- opponent hand size <=4 -> Poltergeist ceiling <=200, impossible clean KO;
- hand size >=5 -> a KO becomes possible, but only if at least five of those cards are Trainers;
- do not assume the hidden Trainer count.

The value of the ALS is therefore **not** 'guaranteed two-turn KO'. It is:

1. remove Initialization for a protected full turn;
2. deny every hand-played Stadium/denial response during that turn;
3. survive the source's clean printed attack;
4. arrive at the next turn with a funded native Gengar and restored candidate Abilities.

That is a much stronger state than 'Horror House and hope'.

## Why Powerglass materially improves the line

Without Powerglass, the candidate normally needs the next turn's Energy attachment to reach Poltergeist.

With Powerglass:

- the second Psychic attaches **after Horror House**;
- the opponent cannot discard that hand-held Energy because it is already attached;
- the candidate preserves its next normal attachment for a third Energy, a different attacker, or another TPE setup;
- the follow-up remains available even if the next topdeck is not Energy.

This makes Basic-Psychic discard custody part of the ALS rather than an incidental resource.

## Going-first failure boundary

If New Moon goes first and the same Gengar is already Active when the source gets its first attacking turn, a funded Thorns may hit it for 140 **before** New Moon can use Horror House.

If candidate then Horrors with Gengar at 100 HP, the opponent can still use a board-funded Volt Cyclone during the locked turn and Knock it Out.

Therefore the full-HP requirement is real.

Going first, prefer:

- a one-Prize buffer such as Klefki when legal;
- keeping fresh Gengar off the Active Spot until the Horror turn;
- or the separate asymmetric-Path / Perfection line if it creates a better immediate attack.

Do not transplant the going-second survival line onto a damaged Gengar.

## Path self-contention exception

If active candidate Klefki is still in the Active Spot when the line tries to use Solrock/Lunatone, Mischievous Lock suppresses Lunatone New Moon.

Move Klefki out of Active **before** crediting the asymmetric Path shield.

## Required acceptance cases

- THR-TPE-PAIR-PATH: Thorns Initialization active; TPE can put Solrock+Lunatone; Path available. Must recognize the pair remains live under Initialization and Path can remove the opposing lock.
- THR-HORROR-POWERGLASS: fresh native Gengar has one Psychic, Powerglass attached, Basic Psychic in discard, GX unused. After Horror, attach the Basic Psychic through Powerglass.
- THR-LOCKED-VOLT140: source has a funded Thorns during Horror House turn. Must allow the 140 board attack and verify full-HP Gengar survives exactly one clean hit.
- THR-POLT-HAND-CEILING: follow-up Gengar has Poltergeist but source hand <=4. Must reject a 230-HP Thorns clean KO as mathematically impossible.
- THR-GOING-FIRST-DAMAGED-POWERGLASS: Gengar already took 140 before Horror. Must not call Powerglass/Horror a survival line against another clean 140.

No competitive matchup or 99.5% claim follows.