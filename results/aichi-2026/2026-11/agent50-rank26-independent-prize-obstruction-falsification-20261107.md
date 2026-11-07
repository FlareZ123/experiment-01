# Agent50: independent rank26 first-turn Prize obstruction falsification

**7 November 2026 | Card-text and rulebook audit | No native match or CI run**

## Question and scope

I independently audited the unchanged original rank-26 Meloetta Donk 60 against the proposed first-player, turn-one Crisis Punch line into a fresh 230-HP Active Iron Thorns ex. The two questions from Agent47 were:

1. When Redeemable Ticket is Prized and obstruction G leaves at most two Damage Pump activations, is there another printed route to make the opponent take five Prizes on the source's first turn?
2. When Redeemable Ticket and both Technical Machine: Crisis Punch copies are Prized, is there another printed source-first, one-turn 230-damage knockout?

Assumptions are the same narrow ones used in the obstruction reports: the source goes first, both players begin with six Prizes, the Iron Thorns is fresh, and there is no prior board damage or opponent-provided Prize acceleration. This is a card-text/rules audit, not a probability rerun or a native game.

## Source inventory and relevant printed effects

The source 60 is results/aichi-2026/full-decklists.json, rank 26. Relevant counts are two Exeggcute PLF 4, four Damage Pump, one Dowsing Machine, one Redeemable Ticket, two Technical Machine: Crisis Punch, one Canceling Cologne, one Meloetta ex, one Tapu Koko Prism Star, four Unown AOR 30, one Bunnelby PRC 121, two Rescue Carrier, two Hisuian Heavy Ball, two Lightning Energy and one Double Colorless Energy. The list contains **zero Psychic Energy**.

The repository's bundled card snapshot confirms:

- resources/cards/en/bw9.json: Exeggcute PLF 4 is 30 HP and has Propagation.
- resources/cards/en/me1.json: Risky Ruins places two damage counters on a Basic non-Darkness Pokémon put onto a Bench during a player's turn.
- resources/cards/en/swsh11.json: Damage Pump moves up to two damage counters from one of your Pokémon to your other Pokémon.
- resources/cards/en/xy7.json: Unown AOR 30 is 60 HP. Farewell Letter explicitly says discarding this Pokémon does not count as a Knock Out.
- resources/cards/en/sm9.json: Tapu Koko Prism Star's Dance of the Ancients attaches Lightning Energy from the discard pile to two Benched Pokémon, then discards all cards from Tapu Koko and puts it in the Lost Zone.
- resources/cards/en/zsv10pt5.json: Meloetta ex is 200 HP. Debut Performance says it can use attacks during your first turn if you go first. Its only attack, Echoed Voice, does 30 damage, costs Psychic Energy, and adds 80 damage to that attack during the next turn.
- resources/cards/en/sv6.json: Iron Thorns ex is 230 HP. Initialization removes Abilities from Pokémon with a Rule Box on both sides while Iron Thorns is Active, except Future Pokémon.
- resources/cards/en/sv4pt5.json: Technical Machine: Crisis Punch provides a 280-damage attack for three Colorless Energy, usable only when the opponent has exactly one Prize card remaining.
- resources/cards/en/swsh7.json and resources/cards/en/swsh10.json: Rescue Carrier recovers Pokémon of 90 HP or less from the discard pile; Hisuian Heavy Ball can take a Basic Pokémon from the Prize cards. Neither retrieves a Trainer from the Prizes.
- resources/cards/en/bw8.json: Dowsing Machine retrieves a Trainer from the discard pile.
- resources/cards/en/sv9.json: Redeemable Ticket replaces the Prize cards after shuffling them into the deck.

The supplied Advanced Player's Rulebook v3.4 is in resources/manual/EN_advanced_manual-2025-transcription-structured.md. Relevant sections are §D (Knock Out and Prize sequence), §C-07 (damage counters), §C-08 (moving damage counters), and §D-18 (Rule Boxes).

## G: no five-Prize line with at most two Pump resolutions

Under G, the source can resolve at most two Damage Pumps: either at most one physical Pump remains outside the Prizes and Dowsing Machine can recover it once, or at most two physical Pumps remain while Dowsing Machine is Prized. This permits at most **four moved damage counters** in total.

A fresh Exeggcute has 30 HP. Risky Ruins supplies 20 damage when it is put onto the Bench, leaving one additional damage counter necessary for a one-Prize Knock Out. Four moved counters can therefore produce at most four such Exeggcute Knock Outs. The two Exeggcute copies can be recycled with Propagation and Rescue Carrier, and a Basic Pokémon can be recovered from the Prizes with Hisuian Heavy Ball. Those effects increase the number of available Exeggcute benchings; they do not create additional damage counters.

The remaining source Pokémon do not provide a more efficient five-Prize route. Unown and Bunnelby are 60 HP, so a Risky Ruins placement plus all four available moved counters can Knock Out at most one of them. Tapu Koko is 130 HP, Meloetta ex is 200 HP, Squawkabilly ex and Dedenne-GX are 160 HP, and Crobat V is 180 HP and Darkness-type (so Risky Ruins does not damage it). The Pokémon with two-Prize rules are all far above the maximum 60 damage available from one Risky Ruins placement plus four moved counters. Concentrating counters on a larger Pokémon reduces the number of possible Knock Outs.

Two apparent self-removal alternatives do not award Prizes:

- Tapu Koko's Dance of the Ancients puts Tapu Koko in the Lost Zone. It does not reduce its remaining HP to zero and is not a Knock Out.
- Unown's Farewell Letter explicitly states that its discard is not a Knock Out.

No other card in this source 60 supplies an additional damage-counter placement or movement effect that breaks the four-counter budget. Accordingly, I found no source-first line that awards the required five Prizes with at most two Pump resolutions under G.

## H: no one-turn 230-damage alternative with both Crisis Tools Prized

With both Crisis Punch Tools and Redeemable Ticket in the Prizes, the source cannot access either 280-damage Tool attack or reset the Prize cards to reach one. Hisuian Heavy Ball retrieves only a Basic Pokémon from the Prizes; Dowsing Machine retrieves only from the discard pile; Forest Seal Stone, Trainers' Mail and Order Pad search the deck. No other source card accesses a Prized Trainer.

One completeness detail deserves explicit treatment in the H report: **Meloetta ex does have a first-turn attack permission** through Debut Performance. Iron Thorns ex's Initialization suppresses that Rule Box Ability while Iron Thorns is Active. Even if Canceling Cologne disables Initialization, Meloetta's only attack, Echoed Voice, costs Psychic Energy, and the rank-26 60 contains none. Its printed 30 damage would also be insufficient against a fresh 230-HP Iron Thorns. Tapu Koko's Mach Bolt is 120 damage; the remaining attacks in the source list are also below 230. Damage Pump moves counters only among the source player's Pokémon, so it cannot increase damage on the opponent's Iron Thorns. Risky Ruins supplies only two counters when a qualifying Basic Pokémon is put onto a Bench.

I found no printed source-first, one-turn 230-damage knockout line when both Crisis Punch Tools and Ticket are Prized.

## Conclusion and limitations

**No falsifying line was found for either G or H under the stated first-turn assumptions.** The exact probability arithmetic in Agent47's reports was not independently rerun here; this audit addresses only the strategic interpretation of the two obstruction events.

The H analysis should explicitly acknowledge Meloetta ex's Debut Performance ability, then explain why Initialization suppresses it and why Echoed Voice is unpayable from this 60's Energy inventory. The source card data is the repository's bundled English snapshot. Exact Japanese physical-printing provenance remains a separate admission requirement. No native Store transaction, complete match, competitive game, or win-rate evidence was produced.

**Suggested disposition:** retain G and H as narrow first-turn negative controls when rank 26 is admitted to a shared-policy test. Do not turn these source-specific obstructions into a general matchup or deck-strength claim.
