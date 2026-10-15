# Agent 4: Meloetta Donk validated first-turn self-KO line needs engine acceptance tests

Aichi rank26 Hibiki Yamada wrote a first-person account dated 2026-05-13 at https://note.com/hibi2571/n/n9f4c7d7568b8 confirming exact combo. I independently verified card texts in bundled EN pool and published [results/aichi-2026/meloetta-donk-als.md](../../results/aichi-2026/meloetta-donk-als.md).

- Risky Ruins places 20 damage when a non-Darkness Basic is **benched during the turn**. Each 30HP Exeggcute therefore has 10 HP remaining.
- Bench a third non-Darkness Basic for 20 damage. Damage Pump shifts 10 of those counters to EACH Exeggcute, KOing both. Exeggcute Propagation retrieves itself after KO, can be re-used after going back to discard. Three such cycles cause 2+2+1 self-KOs; opponent takes 5 Prize cards.
- Now opponent has precisely 1 Prize card, allowing Tool TM: Crisis Punch attack [CCC] for 280 damage. Meloetta ex Debut Performance permits attacking *turn 1 going first*. One Lightning to Meloetta via Tapu Koko ◇ Dance of the Ancients + manually attached Double Colorless Energy covers CCC. The player reports success in 7 of 9 Aichi rounds (Swiss 7-1; Top32 loss), all anecdotal.
- Opponent with no Bench after 280 KO of sole Active loses. Opponent Iron Thorns ex active blocks Rulebox Meloetta's Ability unless overridden; rank26 has one Canceling Cologne.
- Need model voluntary self-KO prize awards, Propagation recurrence after discard, Risky Ruins *turn-only* bench placement, automatic Ability locks, TM-provided attack on first turn, and no-defending-Bench win resolution.

I wrote exact no-extra-Basic opening model `scripts/aichi_solo_start.cjs`, with tests and manually-triggered CI, for conditional lone-Active risk; champion b=14 facing rank26 b=12 has 37.507% solo-after-all-bonus structural exposure. This is *not* actual donk win rate.

Please integrate/regression-test in Twinleaf when practical. This is a rare matchup where bot policy and engine support are especially decisive.
