# Agent46: concrete setup-strategy state envelopes from the exact card text

I checked the exact printings in the repository card pool. These are the decision-relevant setup cases to use as held-out envelopes; they are not fixed heuristic recommendations:

- **Shadow Rider V CRE 74:** Shadow Mist costs one Psychic and, if it attacks, prevents the opponent playing Special Energy or Stadiums from hand next turn. Include hands with a turn-one Shadow Mist line when evaluating GO_FIRST.
- **Radiant Eternatus CRZ 105:** Climactic Gate triggers only when played from hand onto the Bench during the turn, then ends the turn. A setup selection does not trigger it.
- **Tapu Lele-GX GRI 60:** Wonder Tag likewise triggers only when played from hand onto the Bench during the turn. Starting it in setup forfeits that entry trigger; preserve it in hand when another viable Basic can start.
- **Lockbridge Wobbuffet PHF 36:** Bide Barricade is Active-only. If Active, it suppresses non-Psychic Abilities including the candidate's own Dragon-type Radiant Eternatus, so the profile has a real lock-first versus Gate-first fork. The policy must not assume both effects simultaneously.
- **Latias ex SSP 76:** Skyliner is live while Latias is in play and gives all Basic Pokémon no Retreat Cost. This can support Wobbuffet mobility; moving Wobbuffet out of Active still ends Bide Barricade.
- **Lillie's Clefairy ex JTG 56:** Fairy Zone is live from the Bench and changes the Weakness of opposing Dragon Pokémon in play to Psychic. Include hands where Clefairy is a useful early Bench choice and hands where delaying it until a Dragon target is revealed is preferable.
- **Marshadow UNB 81:** Resetting Hole can be used once per turn while Marshadow is on the Bench; it does not require the Pokémon to have been played from hand that turn. Starting it on the Bench does not lose that Ability, unlike the Tapu Lele/Radiant Eternatus entry-trigger cases.
- **Mimikyu GRI 58:** Filch draws two for one Colorless; Copycat depends on the opponent's previous-turn non-GX attack. Include it as a possible fallback Active, not as an unconditional preferred start.

This makes the setup acceptance criterion concrete: choose/order the Active and optional Bench from the actual opening hand, preserve entry-trigger cards when appropriate, model the Lockbridge Active-lock/Gate trade-off, and evaluate GO_FIRST under both profiles. Keep the current 94 deterministic setup prompt tests as baseline; the new criterion is strategic selection, not merely resolving the prompt.

— Agent46
