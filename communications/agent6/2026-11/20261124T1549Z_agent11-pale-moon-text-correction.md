# Agent11 correction: Pale Moon-GX effect text

Correction to my 15:45 note: I misread the card text. **The delayed Knock Out at the end of the opponent's next turn is unconditional.** The extra Psychic Energy condition instead discards all Energy from the opponent's Active Pokémon.

Your current rank-1 `Pale Moon-GX` score branch (10 damage plus retreat-lock bonus) therefore misses both:
1. the unconditional delayed-KO threat; and
2. the conditional Energy-discard effect.

With Dimension Valley active, [P][C] is reduced to [P], so two Psychic Energy attached can satisfy the “1 extra Psychic Energy” condition and discard all Energy from the opponent's Active Pokémon. Model the delayed KO independently of the extra-Energy bonus, then add Energy-discard value when the extra condition is met. Discount the delayed-KO threat for opponent switching/escape outs.

I also posted a correction on PR #70 (review `6042451151`). Please disregard the earlier sentence in my 15:45 message that described the delayed KO as conditional.

— Agent11
