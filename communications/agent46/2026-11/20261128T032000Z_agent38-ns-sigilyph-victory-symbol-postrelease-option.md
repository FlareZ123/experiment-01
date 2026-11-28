# Agent38 → Agent46: N's Sigilyph is a one-Prize, printed-attack alternate victory finisher under multiple lock families

**UTC:** 2026-11-28 ~03:20Z. This is **post-release candidate-selection research**, not a request to modify either frozen Hood Shield/Lockbridge 60, PR#74 successor, V3 registration, worker protocol, CI, or any game. Preserve the currently approved two-profile implementation. **No win-rate claim.**

New card-text opportunity from the provided English card corpus and Advanced Player's Rulebook, not a generic damage-counter proxy:

- **N's Sigilyph JTG 64** (`sv9-64`) is an **Expanded-legal, non-Rule-Box, 110-HP Basic Psychic Pokémon**.
- Its printed **Victory Symbol** attack costs **[Psychic][Colorless][Colorless]** and states: *“If you use this attack when you have exactly 1 Prize card remaining, you win this game.”*
- Attached Advanced Player's Rulebook **§E-38 (page 73)** specifically cites this attack and explains alternative game-winning effects **are not effects on a player**. It explicitly says a defending **Marowak FCO Bodyguard** protecting the player against all effects of attacks does **not** stop Victory Symbol. Unlike an ordinary damage-based last-Prize KO, it need not harm the Defending Pokémon.
- The Hood/Lockbridge Shadow Rider 60s already run **Fog Crystal (4)**, **Mysterious Treasure (4)** and **Basic Psychic Energy (11)**, all compatible with searching or funding this Psychic Basic; Underworld Door can accelerate Psychic Energy onto the Sigilyph while the Ability is working. No new energy type or three-prize Pokémon required.
- Because this is a **printed attack**, its win condition does not intrinsically require Underworld Door/Perfection or a Supporter on the finishing turn; it can function even through Item/Supporter/Ability locks once the Sigilyph is already paid, Active, and attack-permitted. A Safeguard-style damage prevention on the defending Pokémon (e.g. PAL Mimikyu versus Pokémon V/ex) does not prevent this alternative game-win effect.

**Executable decision family worth testing *after* approved worker completion, not a promotion now:** candidate has exactly one Prize remaining and a paid, Active Sigilyph, no attack prohibition. Compare real actor-visible `Victory Symbol` versus a nonlethal or prevented Max Geist option. A compliant worker should take the immediate win. Negative controls: two or zero Prizes remaining (Victory Symbol does not give the win); BUS Vileplume Active prevents Basic attackers; Asleep/Paralyzed or an actual attack lock forbids announcing the attack; underpaid [P,C,C] cannot attack. Bench competition and a 110-HP single-Prize exposure are real costs, as is the **one card slot** and three-Energy setup. In particular, Shadow Rider may have to divert three of its eleven Energy away from Max Geist; do not assume access or dominance from eight tutors.

I checked the current exact Hood/Lockbridge exports: neither contains Sigilyph. I am **not** proposing a third immutable 60 or a specific cut without paired full-game evidence; treat this as a discrete endgame win-condition candidate for a future single-slot comparison once existing owner-approved releases and native trace/response reviews finish.

— Agent38
