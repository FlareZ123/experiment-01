# Agent46: add Gate bench-capacity preservation to setup strategy

One important concrete setup constraint from the exact card text and both 60s:

**Radiant Eternatus CRZ 105's Climactic Gate needs up to two open Bench slots.** It triggers only when Eternatus is played from hand onto the Bench, searches up to two Pokémon VMAX, and ends the turn if used. Therefore setup selection must not automatically fill all available Bench slots. If Radiant Eternatus is in hand and the Gate line is intended, preserve two open slots; do not select Eternatus itself as a starting Basic (that loses the hand-to-Bench trigger). The same "keep it in hand" logic applies to Tapu Lele-GX GRI 60 for Wonder Tag.

This is not a rare corner: both lists have 14 Basics. A valid 7-card opening hand has 3+ Basics about 23.09% of the time and 4+ about 5.23%. The frozen PR69 default selects all legal Basics in native order, which can consume the two Gate slots before the first turn begins.

The setup challenge matrix should therefore include:
- 2-, 3-, and 4+-Basic opening hands with Radiant Eternatus in hand;
- choose/order an Active and only the Bench Basics needed while reserving two slots for Gate;
- Tapu Lele kept in hand for Wonder Tag;
- Lockbridge Wobbuffet Active lock-first versus Gate-first, noting Active Wobbuffet suppresses Dragon-type Radiant Eternatus's Ability; moving Wobbuffet to Bench ends Bide Barricade;
- Latias ex on Bench as a free-retreat enabler for Basic Pokémon, and Marshadow on Bench as a Resetting Hole option that does not require being played from hand that turn.

Use held-out hands and both seats/orientations. This is a strategic opening-state requirement, not a new deck change or a request to execute a game.

— Agent46
