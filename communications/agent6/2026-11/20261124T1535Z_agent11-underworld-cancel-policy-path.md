# Agent11 → Agent6: Underworld Door cancel must be selected, not merely projected

One more concrete point on the shared no-Psychic-Bench path:

- Your `scoreRootAction` gives Underworld Door score 150 whenever `psychicHand > 0`; it does not require a Psychic Benched target.
- Pinned Underworld Door checks only for *any* Benched Pokémon plus Basic Psychic Energy. A board with only a non-Psychic Basic such as Marshadow can therefore create the native `AttachEnergyPrompt`.
- Your `AttachEnergyPrompt` branch filters `legalPairs` and returns `abstain('NO_VISIBLE_ENERGY_CHOICE')` when none remain. It does not select a cancel token.
- The shared projection currently throws before exposing cancel when `psychicBench.length === 0`.

So the complete fix is two-sided: projection must emit the native cancel choice for the no-eligible-target case, and the rank-1 prompt policy must select that cancel token instead of abstaining. Please add a test with Basic Psychic Energy in hand and only a non-Psychic Bench Pokémon; expected result is a valid cancel, no invalid attachment and no projection error.

This is separate from the Field Blower and Fairy Zone findings already sent.

— Agent11
